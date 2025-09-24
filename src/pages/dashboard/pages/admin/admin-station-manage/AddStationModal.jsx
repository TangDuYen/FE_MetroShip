import "leaflet/dist/leaflet.css";

import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Spin,
} from "antd";
import { useEffect, useRef, useState } from "react";

import L from "leaflet";
import api from "../../../../../config/axios";
import { getAllRegions } from "../../../../../config/metroApi";
import { toast } from "react-toastify";

//HELPER CALL NOMINATIM API
async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  }
  return null;
}

async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.display_name || "";
}

function AddStationModal({ open, onCancel, onSuccess }) {
  const [form] = Form.useForm();
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [mapVisible, setMapVisible] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    getAllRegions().then(setRegions).catch(console.error);
  }, []);

  //OPEN MAP MODAL
  useEffect(() => {
    if (mapVisible && !mapRef.current) {
      const map = L.map("leaflet-map").setView([10.776, 106.700], 12); // HCM CENTER
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;

        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        markerRef.current = L.marker([lat, lng]).addTo(map);

        //GET ADDRESS FROM LAT LNG
        const addr = await reverseGeocode(lat, lng);

        form.setFieldsValue({
          latitude: lat,
          longitude: lng,
          address: addr,
        });
      });

      mapRef.current = map;
    }
  }, [mapVisible]);

  const handleFindAddress = async () => {
    const address = form.getFieldValue("address");
    if (!address) return;
    const result = await geocodeAddress(address);
    if (result) {
      form.setFieldsValue({
        latitude: result.lat,
        longitude: result.lon,
        address: result.displayName,
      });

      if (mapRef.current) {
        mapRef.current.setView([result.lat, result.lon], 15);
        if (markerRef.current) {
          mapRef.current.removeLayer(markerRef.current);
        }
        markerRef.current = L.marker([result.lat, result.lon]).addTo(
          mapRef.current
        );
      }
    } else {
      toast.error("Không tìm thấy địa chỉ!");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        stationNameVi: values.stationNameVi,
        stationNameEn: values.stationNameEn,
        address: values.address,
        isUnderground: values.isUnderground,
        regionId: values.regionId,
        latitude: parseFloat(values.latitude),
        longitude: parseFloat(values.longitude),
      };

      setLoading(true);
      await api.post("/stations", payload);
      toast.success("Thêm trạm mới thành công!");
      onSuccess?.();
      onCancel();
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi thêm trạm!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title="Thêm trạm mới"
        open={open}
        onCancel={onCancel}
        onOk={handleSubmit}
        okText="Thêm"
        cancelText="Hủy"
        width={700}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên trạm (Tiếng Việt)"
                name="stationNameVi"
                rules={[{ required: true, message: "Nhập tên trạm" }]}
              >
                <Input placeholder="Nhập tên trạm (VI)" />
              </Form.Item>

              <Form.Item
                label="Tên trạm (Tiếng Anh)"
                name="stationNameEn"
                rules={[{ required: true, message: "Nhập tên trạm" }]}
              >
                <Input placeholder="Nhập tên trạm (EN)" />
              </Form.Item>

              <Form.Item
                label="Khu vực"
                name="regionId"
                rules={[{ required: true, message: "Chọn khu vực" }]}
              >
                <Select
                  options={regions.map((r) => ({
                    label: r.regionName,
                    value: r.id,
                  }))}
                  placeholder="Chọn khu vực"
                />
              </Form.Item>

              <Form.Item
                label="Trạm ngầm?"
                name="isUnderground"
                rules={[{ required: true, message: "Chọn loại trạm" }]}
              >
                <Radio.Group>
                  <Radio value={true}>Có</Radio>
                  <Radio value={false}>Không</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: "Nhập địa chỉ" }]}
              >
                <Input.Search
                  placeholder="Nhập địa chỉ"
                  enterButton="Tìm"
                  onSearch={handleFindAddress}
                />
              </Form.Item>

              <Form.Item
                label="Vĩ độ (lat)"
                name="latitude"
                rules={[{ required: true, message: "Nhập vĩ độ" }]}
              >
                <Input placeholder="VD: 10.776" />
              </Form.Item>

              <Form.Item
                label="Kinh độ (lng)"
                name="longitude"
                rules={[{ required: true, message: "Nhập kinh độ" }]}
              >
                <Input placeholder="VD: 106.700" />
              </Form.Item>

              <Button onClick={() => setMapVisible(true)}>
                Chọn trên bản đồ
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* MAP MODAL */}
      <Modal
        title="Chọn vị trí trên bản đồ"
        open={mapVisible}
        onCancel={() => setMapVisible(false)}
        footer={null}
        width={800}
      >
        <div id="leaflet-map" style={{ height: "500px", width: "100%" }} />
      </Modal>
    </>
  );
}

export default AddStationModal;
