import "./MetroLineManagement.scss";

import {
  Button,
  Col,
  ConfigProvider,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  getAllRegions,
  getAllStationsByRegion,
  getMetroLines,
  getMetroLinesAdmin,
} from "../../../../../config/metroApi";
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
  const [searchLineCode, setSearchLineCode] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);

  //API ONE TIME
  useEffect(() => {
    Promise.all([getAllRegions(), getMetroLinesAdmin()])
      .then(([regionData, metroLineData]) => {
        setRegions(regionData);
        setMetroLines(metroLineData);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredLines = metroLines.filter((line) => {
    // lọc theo lineCode
    const matchCode = searchLineCode
      ? line.lineCode?.toLowerCase().includes(searchLineCode.toLowerCase())
      : true;

    // lọc theo region
    const matchRegion = selectedRegion
      ? line.regionId === selectedRegion
      : true;

    // lọc theo status
    const matchStatus =
      selectedStatus == null ? true : line.isActive === selectedStatus;

    // lọc theo tên tuyến
    const matchName = selectedLine ? line.lineNameVi === selectedLine : true;

    return matchCode && matchRegion && matchStatus && matchName;
  });

  const fetchLineDetail = async (lineId) => {
    try {
      setLoading(true);
      const res = await api.get(`/metro-lines/${lineId}`);
      setDetailData(res.data.data); // dữ liệu trả về như ảnh bạn gửi
      setIsDetailModalOpen(true);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Không thể tải chi tiết tuyến metro";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

  // const handleDelete = () => {
  //   toast.success("Đã xóa tuyến metro.");
  // };

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
      routeTimeMin: values.routeTimeMin
        ? Number(values.routeTimeMin)
        : undefined,
      dwellTimeMin: values.dwellTimeMin
        ? Number(values.dwellTimeMin)
        : undefined,
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
      title: "Mã tuyến",
      dataIndex: "lineCode",
      key: "lineCode",
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
      title: "Khu vực",
      dataIndex: ["region", "regionName"],
      key: "regionName",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (value) =>
        value ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng hoạt động</Tag>
        ),
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
                  defaultColor: "white",
                  defaultBg: "#52c41a",
                  defaultBorderColor: "#52c41a",
                  defaultHoverBorderColor: "#52c41a",
                  defaultHoverColor: "#52c41a",
                  defaultActiveBorderColor: "#52c41a",
                  defaultActiveColor: "#52c41a",
                },
              },
            }}
          >
            <Button onClick={() => openEditModal(record)}>Cập nhật</Button>
          </ConfigProvider>
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  defaultColor: "white",
                  defaultBg: "#0066CC",
                  defaultBorderColor: "#0066CC",
                },
              },
            }}
          >
            <Button onClick={() => fetchLineDetail(record.id)}>
              Xem chi tiết
            </Button>
          </ConfigProvider>
          {/* <Popconfirm
            title="Xác nhận xoá tàu này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xoá"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm> */}
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
        <Input.Search
          placeholder="Tìm theo mã tuyến"
          allowClear
          style={{ width: 200 }}
          value={searchLineCode}
          onChange={(e) => setSearchLineCode(e.target.value)}
        />
        <Select
          allowClear
          placeholder="Chọn tuyến"
          style={{ width: 350 }}
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
        <Select
          allowClear
          placeholder="Chọn khu vực"
          style={{ width: 200 }}
          value={selectedRegion}
          onChange={(value) => setSelectedRegion(value)}
        >
          {regions.map((r) => (
            <Select.Option key={r.id} value={r.id}>
              {r.regionName}
            </Select.Option>
          ))}
        </Select>
        <Select
          allowClear
          placeholder="Chọn trạng thái"
          style={{ width: 200 }}
          value={selectedStatus}
          onChange={(value) => setSelectedStatus(value)}
        >
          <Select.Option value={true}>
            <Tag color="green">Đang hoạt động</Tag>
          </Select.Option>
          <Select.Option value={false}>
            <Tag color="red">Ngừng hoạt động</Tag>
          </Select.Option>
        </Select>

        <Button
          className="clear-filter-button"
          icon={<ReloadOutlined />}
          onClick={() => {
            setSelectedLine(null);
            setSearchLineCode("");
            setSelectedRegion(null);
            setSelectedStatus(null);
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
                rules={[
                  { required: true, message: "Nhập tên tuyến tiếng Việt" },
                ]}
              >
                <Input placeholder="Nhập tên tuyến bằng tiếng Việt" />
              </Form.Item>
              <Form.Item
                label="Tên tuyến (Tiếng Anh)"
                name="lineNameEn"
                rules={[
                  { required: true, message: "Nhập tên tuyến tiếng Anh" },
                ]}
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
                    <div style={{ marginBottom: 12, fontWeight: 600 }}>
                      Danh sách ga (stations)
                    </div>
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
                rules={[
                  { required: true, message: "Nhập tên tuyến tiếng Việt" },
                ]}
              >
                <Input placeholder="Nhập tên tuyến bằng tiếng Việt" />
              </Form.Item>

              <Form.Item
                label="Tên tuyến (Tiếng Anh)"
                name="lineNameEn"
                rules={[
                  { required: true, message: "Nhập tên tuyến tiếng Anh" },
                ]}
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

      <Modal
        title={
          <div style={{ textAlign: "center", width: "100%" }}>
            {detailData?.lineNameVi || "Chi tiết tuyến Metro"}
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={800}
      >
        {loading ? (
          <Spin tip="Đang tải dữ liệu..." />
        ) : detailData ? (
          <div>
            <Descriptions
              bordered
              column={2}
              size="middle"
              labelStyle={{ fontWeight: "bold", width: 160 }}
            >
              <Descriptions.Item label="Tên tuyến (VI)">
                {detailData.lineNameVi}
              </Descriptions.Item>
              <Descriptions.Item label="Tên tuyến (EN)">
                {detailData.lineNameEn}
              </Descriptions.Item>
              <Descriptions.Item label="Mã tuyến">
                {detailData.lineCode}
              </Descriptions.Item>
              <Descriptions.Item label="Khu vực">
                {detailData.region?.regionName}
              </Descriptions.Item>
              <Descriptions.Item label="Loại tuyến" span={2}>
                {detailData.lineType}
              </Descriptions.Item>
              <Descriptions.Item label="Chủ quản lý" span={2}>
                {detailData.lineOwner}
              </Descriptions.Item>
              <Descriptions.Item label="Số trạm">
                {detailData.totalStations}
              </Descriptions.Item>
              <Descriptions.Item label="Chiều dài">
                {detailData.totalKm} km
              </Descriptions.Item>
            </Descriptions>

            <Divider />
            <h3 style={{ marginBottom: 16, textAlign: "center" }}>
              Danh sách tàu
            </h3>
            <Table
              dataSource={detailData.trains}
              rowKey="id"
              pagination={false}
              columns={[
                { title: "Mã tàu", dataIndex: "trainCode" },
                { title: "Model", dataIndex: "modelName" },
                // { title: "Trạng thái", dataIndex: "statusName" },
                { title: "Kinh độ", dataIndex: "longitude" },
                { title: "Vĩ độ", dataIndex: "latitude" },
              ]}
            />
          </div>
        ) : (
          <Empty description="Không có dữ liệu chi tiết" />
        )}
      </Modal>
    </div>
  );
}

export default MetroLineManagement;
