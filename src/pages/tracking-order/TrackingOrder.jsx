import "./TrackingOrder.scss";
import "leaflet/dist/leaflet.css";

import {
  Badge,
  Button,
  Card,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Tag,
  Timeline,
} from "antd";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import React, { useEffect, useRef, useState } from "react";
import {
  formatCurrency,
  parcelStatusColorMap,
  parcelStatusMap,
  shipmentStatusMap,
} from "../../constants/statusMap";
import { useNavigate, useParams } from "react-router-dom";

import L from "leaflet";
import { PATH_NAME } from "../../constants/pathname";
import api from "../../config/axios";
import dayjs from "dayjs";
import { getParcelsByTrackingCode } from "../../config/metroApi";
import locationIconImg from "../../assets/placeholder.webp";
import metro from "../../assets/metro_station.png";
import { selectUser } from "../../redux/features/counterSlice";
import startStation from "../../assets/train.webp";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const { Option } = Select;

function ResizeMapOnShow() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
  }, [map]);
  return null;
}

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position[0] !== 0) {
      map.setView(position);
    }
  }, [position, map]);
  return null;
}

// icons
const locationIcon = new L.Icon({
  iconUrl: locationIconImg,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});
const startMetro = new L.Icon({
  iconUrl: startStation,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});
const metroIcon = new L.Icon({
  iconUrl: metro,
  iconSize: [25, 25],
});

function TrackingOrder() {
  const [selectedShipment, setSelectedShipment] = useState(null);
  const { trackingCode } = useParams();
  const navigate = useNavigate();
  const [parcels, setParcels] = useState([]);
  const [position, setPosition] = useState([0, 0]);
  const [fullPathSegments, setFullPathSegments] = useState([]);

  const intervalRef = useRef(null);
  const lastDataRef = useRef(null);
  const [intervalTime, setIntervalTime] = useState(2000);

  const user = useSelector(selectUser);
  const [userInfo, setUserInfo] = useState(null);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [bankConfirmModalVisible, setBankConfirmModalVisible] = useState(false);
  const [bankUpdateModalVisible, setBankUpdateModalVisible] = useState(false);

  const [bankForm] = Form.useForm();
  useEffect(() => {
    if (bankUpdateModalVisible && userInfo) {
      bankForm.setFieldsValue({
        bankId: userInfo.bankId,
        accountNo: userInfo.accountNo,
        accountName: userInfo.accountName,
      });
    }
  }, [bankUpdateModalVisible, userInfo, bankForm]);

  const [bankSubmitting, setBankSubmitting] = useState(false);
  const [currentShipmentIdForCompensation, setCurrentShipmentIdForCompensation] = useState(null);

  const [banksList, setBanksList] = useState([]);
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/users/${user.id}`, {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        setUserInfo(res.data?.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        toast.error("Không thể tải thông tin người dùng");
      }
    };

    fetchUserInfo();
  }, [user?.id, user?.token]);

  // fetch shipment detail
  const fetchData = async () => {
    try {
      const shipmentRes = await api.get(`/shipments/${trackingCode}`, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const shipment = shipmentRes.data.data;
      setSelectedShipment(shipment);
      const parcelCodes = shipment?.parcels?.map((p) => p.parcelCode) || [];
      const parcelDetails = await Promise.all(
        parcelCodes.map((code) => getParcelsByTrackingCode(code))
      );
      setParcels(parcelDetails);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      toast.error("Không thể lấy thông tin đơn hàng");
    }
  };

  useEffect(() => {
    if (!trackingCode || !user?.token) return;
    fetchData();
  }, [trackingCode, user?.token]);

  // Fetch live position when appropriate
  const fetchLivePosition = async () => {
    try {
      const res = await api.get(`/${trackingCode}/position`, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const {
        latitude,
        longitude,
        additionalData,
      } = res.data;

      const newData = {
        latitude,
        longitude,
        fullPath: additionalData?.shipment?.fullPath,
      };

      if (JSON.stringify(newData) !== JSON.stringify(lastDataRef.current)) {
        setPosition([latitude, longitude]);

        const fullPath = additionalData?.shipment?.fullPath || [];
        setFullPathSegments(fullPath);

        lastDataRef.current = newData;
        setIntervalTime(2000);
      } else {
        setIntervalTime(5000);
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu vị trí:", err);
    }
  };

  useEffect(() => {
    if (!selectedShipment) return;

    if (selectedShipment.shipmentStatus === 9) {
      fetchLivePosition();
    }
  }, [selectedShipment]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (selectedShipment?.shipmentStatus === 9) {
      intervalRef.current = setInterval(fetchLivePosition, intervalTime);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalTime, selectedShipment]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await api.get("/transactions/vietqr/banks", {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const list = res.data?.data || [];
        setBanksList(list);
      } catch (err) {
        console.error("Lỗi lấy danh sách ngân hàng:", err);
      }
    };

    if (user?.token) {
      fetchBanks();
    }
  }, [user?.token]);

  const getCurrentSegmentIndex = (positionArr, segments) => {
    if (!segments || !segments.length) return 0;
    let minIndex = 0;
    let minDist = Infinity;
    segments.forEach((seg, i) => {
      seg.polyline?.forEach((p) => {
        const dist = Math.sqrt(
          Math.pow(p.latitude - positionArr[0], 2) +
          Math.pow(p.longitude - positionArr[1], 2)
        );
        if (dist < minDist) {
          minDist = dist;
          minIndex = i;
        }
      });
    });
    return minIndex;
  };

  const currentSegmentIndex = getCurrentSegmentIndex(position, fullPathSegments);

  const handleInsuranceRequest = (shipmentId) => {
    setCurrentShipmentIdForCompensation(shipmentId);
    setConfirmModalVisible(true);
  };

  const onConfirmCompensation = () => {
    setConfirmModalVisible(false);
    const hasBankInfo =
      userInfo?.bankId && userInfo?.accountNo && userInfo?.accountName;

    if (hasBankInfo) {
      setBankConfirmModalVisible(true);
    } else {
      setBankUpdateModalVisible(true);
    }
  };

  const handleBankUpdateFinish = async (values) => {
    setBankSubmitting(true);
    try {
      const res = await api.put(
        "/users/bank-info",
        {
          bankId: values.bankId,
          accountNo: values.accountNo,
          accountName: values.accountName,
        },
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(res.data?.message || "Cập nhật thông tin ngân hàng thành công!");
      setBankUpdateModalVisible(false);
      setBankConfirmModalVisible(true);
    } catch (err) {
      console.error("Lỗi cập nhật bank info:", err);
      toast.error("Cập nhật thông tin ngân hàng thất bại!");
    } finally {
      setBankSubmitting(false);
    }
  };

  const handleConfirmBankAndSubmitCompensation = async () => {
    try {
      const payload = {
        shipmentId: currentShipmentIdForCompensation,
        subject: "Yêu cầu bồi thường",
        description: "Khách hàng yêu cầu bồi thường vì kiện hàng bị mất.",
        supportType: 1,
      };
      const res = await api.post("/support-tickets", payload, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.status === 200 || res.status === 201) {
        toast.success("Yêu cầu bồi thường đã được gửi thành công!");
        fetchData();
      } else {
        toast.error("Gửi yêu cầu bồi thường thất bại");
      }
    } catch (error) {
      console.error("Lỗi gửi yêu cầu bồi thường:", error);
      const msg = error.response?.data?.message || "Có lỗi xảy ra";
      toast.error(msg);
    }
    setBankConfirmModalVisible(false);
  };

  if (!selectedShipment) {
    return (
      <div className="tracking-order-container">
        <Spin tip="Đang tải đơn..." />
      </div>
    );
  }

  const currentStatus = selectedShipment.shipmentStatus;
  const shipmentParcels = selectedShipment.parcels || [];

  return (
    <div className="tracking-order-container">
      <div className="tracking-order-wrapper">
        <div className="left-column">
          <Card style={{ marginTop: "2em", marginBottom: "16px" }}>
            <MapContainer
              center={position[0] !== 0 ? position : [10.76, 106.7]}
              zoom={13}
              style={{ width: "100%", height: "300px" }}
            >
              <ResizeMapOnShow />
              <RecenterMap position={position} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {fullPathSegments.map((segment, idx) => {
                const pts = segment.polyline?.map((p) => [
                  p.latitude,
                  p.longitude,
                ]);
                if (!pts || !pts.length) return null;

                if (idx < currentSegmentIndex) {
                  return (
                    <Polyline
                      key={idx}
                      positions={pts}
                      color="gray"
                      weight={5}
                    />
                  );
                }
                if (idx > currentSegmentIndex) {
                  return (
                    <Polyline
                      key={idx}
                      positions={pts}
                      color="blue"
                      weight={5}
                    />
                  );
                }
                // segment hiện tại → split
                let nearestIdx = 0;
                let minDist = Infinity;
                segment.polyline.forEach((p, i) => {
                  const d =
                    Math.pow(p.latitude - position[0], 2) +
                    Math.pow(p.longitude - position[1], 2);
                  if (d < minDist) {
                    minDist = d;
                    nearestIdx = i;
                  }
                });
                const firstPart = pts.slice(0, nearestIdx + 1);
                const secondPart = pts.slice(nearestIdx);
                return (
                  <React.Fragment key={idx}>
                    {firstPart.length > 1 && (
                      <Polyline positions={firstPart} color="gray" weight={5} />
                    )}
                    {secondPart.length > 1 && (
                      <Polyline positions={secondPart} color="blue" weight={5} />
                    )}
                  </React.Fragment>
                );
              })}
              {(() => {
                const allStations = [];
                fullPathSegments.forEach((segment, index) => {
                  if (index === 0) {
                    allStations.push({
                      name: segment.from.name,
                      lat: segment.from.latitude,
                      lng: segment.from.longitude,
                      type: "start",
                    });
                  }
                  if (index === fullPathSegments.length - 1) {
                    allStations.push({
                      name: segment.to.name,
                      lat: segment.to.latitude,
                      lng: segment.to.longitude,
                      type: "end",
                    });
                  } else {
                    allStations.push({
                      name: segment.to.name,
                      lat: segment.to.latitude,
                      lng: segment.to.longitude,
                      type: "middle",
                    });
                  }
                });
                return allStations.map((station, idx) => (
                  <Marker
                    key={idx}
                    position={[station.lat, station.lng]}
                    icon={
                      station.type === "start"
                        ? startMetro
                        : station.type === "end"
                          ? locationIcon
                          : locationIcon
                    }
                  >
                    <Popup>{station.name}</Popup>
                  </Marker>
                ));
              })()}
              {position[0] !== 0 && (
                <Marker position={position} icon={metroIcon}>
                  <Popup>Vị trí hiện tại</Popup>
                </Marker>
              )}
            </MapContainer>
          </Card>

          <Card
            title={
              <Badge
                className={`status-badge ${currentStatus >= 20 ? "delivered" : "in-transit"
                  }`}
              >
                {shipmentStatusMap[currentStatus] || "Không rõ trạng thái"}
              </Badge>
            }
            bordered={false}
          >
            <div className="custom-progress">
              {[{ id: 8, label: "Đã lấy hàng" }, { id: 9, label: "Đang giao hàng" }, { id: 21, label: "Đã giao hàng" }].map(
                (step, idx, arr) => {
                  const isLast = idx === arr.length - 1;
                  const isCompleted = isLast
                    ? [21, 24, 26].includes(currentStatus)
                    : currentStatus >= step.id;
                  const nextStep = arr[idx + 1];
                  const isLineCompleted = nextStep
                    ? nextStep.id === 21
                      ? [21, 24, 26].includes(currentStatus)
                      : currentStatus >= nextStep.id
                    : false;
                  return (
                    <div key={step.id} className="progress-step">
                      <div className={`dot ${isCompleted ? "completed" : ""}`} />
                      {!isLast && (
                        <div
                          className={`line ${isLineCompleted ? "completed" : ""}`}
                        />
                      )}
                      <div className={`label ${isCompleted ? "active" : ""}`}>
                        {step.label}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </Card>

          <Card title="Lịch sử đơn hàng" bordered={false}>
            <Timeline>
              {selectedShipment.shipmentTrackings
                .sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))
                .map((track) => (
                  <Timeline.Item
                    key={track.id}
                    color={track === selectedShipment.shipmentTrackings[0] ? "green" : "gray"}
                  >
                    <div
                      style={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <div style={{ color: "#999" }}>
                        {dayjs(track.eventTime).format("DD/MM HH:mm")}
                      </div>
                      <div className="timeline-description">{track.status}</div>
                    </div>
                  </Timeline.Item>
                ))}
            </Timeline>
          </Card>
        </div>

        <div className="right-column" style={{ marginTop: "2em" }}>
          <Card title="Thông tin đơn hàng" bordered={false}>
            <div className="shipment-details">
              <div className="detail-item">
                <span className="detail-label">Tracking Code</span>
                <span className="detail-value">
                  {selectedShipment.trackingCode}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Người gửi</span>
                <span className="detail-value">
                  {selectedShipment.senderName} – {selectedShipment.senderPhone}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Người nhận</span>
                <span className="detail-value">
                  {selectedShipment.recipientName} – {selectedShipment.recipientPhone}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Trạm gửi</span>
                <span className="detail-value">
                  Trạm {selectedShipment.departureStationName}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Trạm nhận</span>
                <span className="detail-value">
                  Trạm {selectedShipment.destinationStationName}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tổng phí</span>
                <span className="detail-value">
                  {formatCurrency(selectedShipment.totalCostVnd)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Đặt lúc</span>
                <span className="detail-value">
                  {dayjs(selectedShipment.bookedAt).format("DD/MM/YYYY HH:mm")}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Hạn chót gửi hàng lúc</span>
                <span className="detail-value">
                  {dayjs(selectedShipment.scheduledDateTime).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </span>
              </div>

              {parcels.map((p, i) => {
                const parcel = p.data;
                return (
                  <React.Fragment key={parcel.id || i}>
                    <Divider />
                    <div className="detail-item">
                      <span className="detail-label">Mã kiện #{i + 1}</span>
                      <span className="detail-value">{parcel.parcelCode}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Khối lượng</span>
                      <span className="detail-value">{parcel.weightKg} kg</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Kích thước</span>
                      <span className="detail-value">
                        {parcel.lengthCm} × {parcel.widthCm} × {parcel.heightCm} cm
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Phí vận chuyển</span>
                      <span className="detail-value">
                        {formatCurrency(parcel.shippingFeeVnd)}
                      </span>
                    </div>
                    {parcel.priceVnd !== parcel.shippingFeeVnd && (
                      <div className="detail-item">
                        <span className="detail-label">Phí bảo hiểm</span>
                        <span className="detail-value">
                          {formatCurrency(parcel.insuranceFeeVnd)}
                        </span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Tổng phí</span>
                      <span className="detail-value">{formatCurrency(parcel.priceVnd)}</span>
                    </div>
                    {parcel.parcelCategory && (
                      <>
                        <div className="detail-item">
                          <span className="detail-label">Loại hàng</span>
                          <span className="detail-value">
                            {parcel.parcelCategory.categoryName}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Mô tả</span>
                          <span className="detail-value">
                            {parcel.parcelCategory.description}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Tình trạng</span>
                      <span className="detail-value">
                        <Tag color={parcelStatusColorMap[parcel.status]}>
                          {parcelStatusMap[parcel.status]}
                        </Tag>
                      </span>
                    </div>
                    <div className="detail-item">
                      {parcel.status === 4 &&
                        !selectedShipment.isCompensationRequested &&
                        [24, 25, 27].includes(selectedShipment.shipmentStatus) && (
                          <Button
                            type="primary"
                            className="insurance-button"
                            onClick={() =>
                              handleInsuranceRequest(selectedShipment.id)
                            }
                          >
                            Yêu cầu bồi thường
                          </Button>
                        )}
                    </div>
                  </React.Fragment>
                )
              })}
            </div>
          </Card>

          {user && user.id === selectedShipment.senderId && (
            <Card bordered={false}>
              <Button
                type="default"
                block
                onClick={() =>
                  navigate(PATH_NAME.PRINT_ORDER, {
                    state: { trackingCode: selectedShipment.trackingCode },
                  })
                }
              >
                Tải đơn hàng
              </Button>
            </Card>
          )}
        </div>
      </div>

      <Modal
        title="Xác nhận yêu cầu bồi thường"
        visible={confirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        onOk={onConfirmCompensation}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>Bạn muốn yêu cầu bồi thường cho kiện hàng?</p>
      </Modal>

      <Modal
        title="Xác nhận thông tin ngân hàng"
        visible={bankConfirmModalVisible}
        onCancel={() => setBankConfirmModalVisible(false)}
        onOk={handleConfirmBankAndSubmitCompensation}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>Số tiền sẽ được hoàn vào tài khoản này:</p>
        <p>
          Ngân hàng:{" "}
          {banksList.find(b => b.id === userInfo?.bankId)?.shortName ||
            banksList.find(b => b.code === userInfo?.bankId)?.shortName ||
            "-"}
          <br />
          Số tài khoản: {userInfo?.accountNo || "-"} <br />
          Tên chủ tài khoản: {userInfo?.accountName || "-"}
        </p>
      </Modal>

      <Modal
        title="Cập nhật thông tin ngân hàng"
        visible={bankUpdateModalVisible}
        onCancel={() => setBankUpdateModalVisible(false)}
        footer={null}
      >
        <Form
          form={bankForm}
          layout="vertical"
          onFinish={handleBankUpdateFinish}
        >
          <Form.Item
            name="bankId"
            label="Ngân hàng"
            rules={[{ required: true, message: "Chọn ngân hàng" }]}
          >
            <Select
              placeholder="Chọn ngân hàng"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {banksList.map((bank) => (
                <Option key={bank.id} value={bank.id}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {bank.logo && (
                      <img
                        src={bank.logo}
                        alt={bank.shortName}
                        style={{
                          width: 24,
                          height: 24,
                          marginRight: 8,
                        }}
                      />
                    )}
                    <span>{bank.shortName}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="accountNo"
            label="Số tài khoản"
            rules={[{ required: true, message: "Nhập số tài khoản" }]}
          >
            <Input placeholder="Nhập số tài khoản" />
          </Form.Item>
          <Form.Item
            name="accountName"
            label="Tên chủ tài khoản"
            rules={[{ required: true, message: "Nhập tên chủ tài khoản" }]}
          >
            <Input placeholder="Nhập tên chủ tài khoản" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={bankSubmitting}
              style={{ width: "100%" }}
            >
              Lưu & tiếp tục
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default TrackingOrder;
