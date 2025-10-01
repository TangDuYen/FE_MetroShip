import "./MetroLineManagement.scss";

import {
  Button,
  Col,
  ConfigProvider,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { getAllRegions, getAllStationsByRegion, getMetroLines } from "../../../../../config/metroApi";
import { useEffect, useState } from "react";

import api from "../../../../../config/axios";
import { toast } from "react-toastify";

function MetroLineManagement() {
  const [metroLines, setMetroLines] = useState([]);
  const [editingLine, setEditingLine] = useState(null);
  const [form] = Form.useForm();
  const [stations, setStations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  


  //API ONE TIME
  useEffect(() => {
    Promise.all([getAllRegions(), getMetroLines()])
      .then(([regionData, metroLineData]) => {
        setRegions(regionData);
        setMetroLines(metroLineData);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredLines = selectedLine
    ? metroLines.filter((line) => line.lineNameVi === selectedLine)
    : metroLines;

  const openAddModal = () => {
    setEditingLine(null);
    form.resetFields();
    form.setFieldsValue({ stations: [] });
    setStations([]);
    setIsAddModalOpen(true);
  };

  const openEditModal = (line) => {
    setEditingLine(line);
    setIsEditModalOpen(true);
  };

  const handleDelete = () => {
    toast.success("Đã xóa tuyến metro.");
  };

  const enrichStations = (values) => {
    return (values.stations || [])
      .map((s) => (s.station ? { id: s.station } : null))
      .filter(Boolean);
  };



  const buildPayload = (values) => {
    const payload = {
      lineNameVi: values.lineNameVi,
      lineNameEn: values.lineNameEn,
      regionId: values.regionId,
      lineNumber: values.lineNumber ? Number(values.lineNumber) : undefined,
      lineCode: values.lineCode || undefined,
      lineType: values.lineType || undefined,
      lineOwner: values.lineOwner || undefined,
      colorHex: values.colorHex || undefined,
      routeTimeMin: values.routeTimeMin ? Number(values.routeTimeMin) : undefined,
      dwellTimeMin: values.dwellTimeMin ? Number(values.dwellTimeMin) : undefined,
      stations: enrichStations(values),
    };

    return Object.fromEntries(
      Object.entries(payload).filter(
        ([, v]) => v !== undefined && v !== "" && v !== 0
      )
    );
  };

  //ADD METRO ROUTE
  const handleAddSubmit = () => {
    form.validateFields().then(async (values) => {
      try {
        setLoading(true);
        const payload = buildPayload(values);
        await api.post("/api/metro-lines", payload);
        toast.success("Đã thêm tuyến mới!");

        const metroLineData = await getMetroLines();
        setMetroLines(metroLineData);

        setIsAddModalOpen(false);
        form.resetFields();
      } catch (error) {
        console.error("Add failed:", error);
        toast.error(error.response?.data?.message || "Có lỗi khi thêm tuyến!");
      } finally {
        setLoading(false);
      }
    });
  };


  //UPDATE METRO ROUTE
  const handleEditSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const payload = {
          lineNameVi: values.lineNameVi,
          lineNameEn: values.lineNameEn,
          routeTimeMin: Number(values.routeTimeMin),
          dwellTimeMin: Number(values.dwellTimeMin),
        };

        try {
          setLoading(true);
          await api.put(`/api/metro-lines/${editingLine.id}`, payload);
          toast.success("Cập nhật thành công!");

          const metroLineData = await getMetroLines();
          setMetroLines(metroLineData);

          setIsEditModalOpen(false);
          form.resetFields();
        } catch (error) {
          console.error("Edit failed:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Có lỗi khi cập nhật tuyến!";
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      })
      .catch((info) => {
        console.error("Validate Failed:", info);
      });
  };


  const handleRegionChange = async (regionId) => {
    form.setFieldValue("regionId", regionId);
    try {
      const stationData = await getAllStationsByRegion(regionId);
      setStations(stationData);
      form.setFieldValue("stations", []);
    } catch (error) {
      setStations([]);
    }
  };


  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Tên tuyến Vi",
      dataIndex: "lineNameVi",
    },
    {
      title: "Tên tuyến En",
      dataIndex: "lineNameEn",
    },
    {
      title: "Hành động",
      dataIndex: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
        <ConfigProvider
            theme={{
              components: {
                Button: {
                  defaultColor: "#52c41a",
                  defaultBg: "white",
                  defaultBorderColor: "#52c41a",
                  defaultHoverBorderColor: "#389e0d",
                  defaultHoverColor: "#389e0d",
                  defaultActiveBorderColor: "#52c41a",
                  defaultActiveColor: "#52c41a",
                },
              },
            }}
          >
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          </ConfigProvider>
          <Popconfirm
            title="Xác nhận xoá tàu này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xoá"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="metro-line-management-container">
      <Space wrap size="middle" style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openAddModal}>
          + Thêm tuyến mới
        </Button>
        <Select
          allowClear
          placeholder="Chọn tuyến"
          style={{ width: 400 }}
          value={selectedLine}
          onChange={(value) => setSelectedLine(value)}
        >
          {[...new Set(metroLines.map((line) => line.lineNameVi))].map(
            (lineName) => (
              <Select.Option key={lineName} value={lineName}>
                {lineName}
              </Select.Option>
            )
          )}
        </Select>
        <Button
          className="clear-filter-button"
          icon={<ReloadOutlined />}
          onClick={() => {
            setSelectedLine(null);
          }}
        ></Button>
      </Space>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <ConfigProvider
          renderEmpty={() => (
            <Empty
              image={Empty.PRESENTED_IMAGE_DEFAULT}
              description="Không có dữ liệu"
            />
          )}
        >
          <Table
            columns={columns}
            dataSource={filteredLines}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </ConfigProvider>
      </Spin>

      <Modal
        title="Thêm tuyến Metro mới"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={handleAddSubmit}
        cancelText="Hủy"
        width={900}
        okText="Thêm"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên tuyến (Tiếng Việt)"
                name="lineNameVi"
                rules={[{ required: true, message: "Nhập tên tuyến tiếng Việt" }]}
              >
                <Input placeholder="Nhập tên tuyến bằng tiếng Việt" />
              </Form.Item>
              <Form.Item
                label="Tên tuyến (Tiếng Anh)"
                name="lineNameEn"
                rules={[{ required: true, message: "Nhập tên tuyến tiếng Anh" }]}
              >
                <Input placeholder="Nhập tên tuyến bằng tiếng Anh" />
              </Form.Item>
              <Form.Item
                label="Khu vực"
                name="regionId"
                rules={[{ required: true, message: "Chọn khu vực" }]}
              >
                <Select
                  placeholder="Chọn khu vực"
                  onChange={handleRegionChange}
                  options={regions.map((region) => ({
                    label: region.regionName,
                    value: region.id,
                  }))}
                />
              </Form.Item>
              <Form.Item label="Mã tuyến" name="lineCode">
                <Input placeholder="Nhập mã tuyến" />
              </Form.Item>
              <Form.Item label="Số tuyến" name="lineNumber">
                <Input type="number" placeholder="Nhập số tuyến" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.List name="stations">
                {(fields, { add, remove }) => (
                  <>
                    <div style={{ marginBottom: 12, fontWeight: 600 }}>Danh sách ga (stations)</div>
                    {fields.map(({ key, name, ...restField }) => (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          gap: "1rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "station"]}
                          rules={[{ required: true, message: "Chọn ga" }]}
                          style={{ flex: 2 }}
                        >
                          <Select
                            placeholder="Chọn ga"
                            options={stations.map((station) => ({
                              label: `${station.stationNameVi} (${station.stationNameEn})`,
                              value: String(station.id), 
                            }))}
                          />
                        </Form.Item>
                        <Button danger onClick={() => remove(name)}>
                          Xóa
                        </Button>
                      </div>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block>
                        Thêm ga
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Cập nhật tuyến Metro"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={handleEditSubmit}
        cancelText="Hủy"
        width={600}
        okText="Lưu"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên tuyến (Tiếng Việt)"
                name="lineNameVi"
                rules={[{ required: true, message: "Nhập tên tuyến tiếng Việt" }]}
              >
                <Input placeholder="Nhập tên tuyến bằng tiếng Việt" />
              </Form.Item>

              <Form.Item
                label="Tên tuyến (Tiếng Anh)"
                name="lineNameEn"
                rules={[{ required: true, message: "Nhập tên tuyến tiếng Anh" }]}
              >
                <Input placeholder="Nhập tên tuyến bằng tiếng Anh" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Tổng thời gian đi hết tuyến (phút)"
                name="routeTimeMin"
                rules={[{ required: true, message: "Nhập tổng thời gian" }]}
              >
                <Input type="number" min={1} placeholder="Ví dụ: 90" />
              </Form.Item>

              <Form.Item
                label="Thời gian dừng bốc dỡ (phút)"
                name="dwellTimeMin"
                rules={[{ required: true, message: "Nhập thời gian dừng" }]}
              >
                <Input type="number" min={1} placeholder="Ví dụ: 5" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

export default MetroLineManagement;
