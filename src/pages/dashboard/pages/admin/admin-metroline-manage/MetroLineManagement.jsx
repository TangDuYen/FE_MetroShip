import "./MetroLineManagement.scss";

import {
  Button,
  Col,
  Collapse,
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

const { Panel } = Collapse;
function MetroLineManagement() {
  const [metroLines, setMetroLines] = useState([]);
  const [editingLine, setEditingLine] = useState(null);
  const [form] = Form.useForm();
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
  const [lineInfo, setLineInfo] = useState({
    lineNameVi: "",
    lineNameEn: "",
    regionId: "",
    lineNumber: "",
    lineCode: "",
    lineType: "",
    lineOwner: "",
    colorHex: "",
    routeTimeMin: "",
    dwellTimeMin: "",
  });

  const [stations, setStations] = useState([]); // trạm theo region
  const [selectedStations, setSelectedStations] = useState([]);


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
      setDetailData(res.data.data);
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
    setIsAddModalOpen(true);
    form.resetFields(); // Reset toàn bộ trường trong Form
    setStations([]); // Reset danh sách trạm theo khu vực
    setSelectedStations([]); // Reset danh sách trạm đã chọn
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
          await api.put(`/metro-lines/${editingLine.id}`, payload);
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
    setLineInfo((prev) => ({ ...prev, regionId }));
    try {
      const stationData = await getAllStationsByRegion(regionId);
      // chuẩn hóa id về number hoặc string (phụ thuộc backend)
      setStations(stationData.map(s => ({ ...s, id: s.stationId.toString() })));

      setSelectedStations([]); // reset trạm cũ
    } catch (error) {
      toast.error("Không thể tải danh sách ga!");
      setStations([]);
    }
  };

  const addStation = () => {
    if (selectedStations.length >= 10) {
      toast.error("Một tuyến chỉ có thể chứa tối đa 10 trạm!");
      return;
    }

    setSelectedStations([
      ...selectedStations,
      {
        id: "",
        toNextStationKm: 0,
      },
    ]);
  };

  const handleAddMetroLine = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        lineNumber: values.lineNumber ? Number(values.lineNumber) : undefined,
        routeTimeMin: values.routeTimeMin ? Number(values.routeTimeMin) : undefined,
        dwellTimeMin: values.dwellTimeMin ? Number(values.dwellTimeMin) : undefined,
        stations: selectedStations
          .filter((s) => s.id)
          .map((s) => {
            const station = stations.find((st) => st.id === s.id);
            return {
              id: station?.id,
              toNextStationKm: s.toNextStationKm ? Number(s.toNextStationKm) : undefined,
            };
          }),
      };

      // Clean up
      if (!payload.stations.length) delete payload.stations;
      const cleanedPayload = Object.fromEntries(
        Object.entries(payload).filter(
          ([, v]) =>
            v !== undefined &&
            v !== "" &&
            !(Array.isArray(v) && v.length === 0)
        )
      );

      if (cleanedPayload.stations) {
        cleanedPayload.stations = cleanedPayload.stations.map(st =>
          Object.fromEntries(
            Object.entries(st).filter(
              ([, v]) =>
                v !== undefined &&
                v !== "" &&
                !(Array.isArray(v) && v.length === 0)
            )
          )
        );
      }

      const res = await api.post("/metro-lines", cleanedPayload);
      if (res.data?.statusCode === 200) {
        toast.success("Thêm tuyến metro thành công!");
        setIsAddModalOpen(false);
        form.resetFields();
        setSelectedStations([]);
      } else {
        toast.error("Thêm tuyến metro thất bại!");
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Lỗi không xác định";

      console.error("Add Metro Line Error:", err);
      toast.error(errorMessage);

    }
  };

  const handleActivateLine = async (lineId) => {
    try {
      setLoading(true);
      const res = await api.post(`/metro-lines/activation/${lineId}`);
      if (res.data?.statusCode === 200) {
        toast.success("Kích hoạt tuyến thành công!");
        const updatedLines = await getMetroLinesAdmin();
        setMetroLines(updatedLines);
      } else {
        toast.error("Kích hoạt tuyến thất bại!");
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Lỗi không xác định";
      console.error("Activation error:", err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const removeStation = (index) => {
    setSelectedStations(selectedStations.filter((_, i) => i !== index));
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
          {/* Cập nhật */}
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

          {/* Xem chi tiết */}
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
            <Button onClick={() => fetchLineDetail(record.id)}>Xem chi tiết</Button>
          </ConfigProvider>

          {/* Kích hoạt / Ngừng */}
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  defaultColor: "white",
                  defaultBg: record.isActive ? "#FF4D4F" : "#1890FF", // đỏ / xanh
                  defaultBorderColor: record.isActive ? "#FF4D4F" : "#1890FF",
                },
              },
            }}
          >
            <Popconfirm
              title={`Bạn có chắc muốn ${record.isActive ? "ngừng" : "kích hoạt"} tuyến này?`}
              onConfirm={() => handleActivateLine(record.id)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button>
                {record.isActive ? "Ngừng hoạt động" : "Kích hoạt"}
              </Button>
            </Popconfirm>
          </ConfigProvider>
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
        onOk={handleAddMetroLine}
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
              <div>
                <strong>Danh sách trạm (Stations)</strong>
                {selectedStations.map((s, index) => (
                  <Row key={index} gutter={12} style={{ marginBottom: 8 }}>
                    <Col span={12}>
                      <Select
                        placeholder="Chọn trạm"
                        style={{ width: "100%" }}
                        value={s.id?.toString()}
                        onChange={(val) => {
                          const updated = [...selectedStations];
                          updated[index].id = val.toString(); // Force string to match stationId
                          setSelectedStations(updated);
                        }}

                        options={stations.map((station) => ({
                          label: `${station.stationNameVi} (${station.stationNameEn})`,
                          value: station.id,
                        }))}
                      />
                    </Col>

                    <Col span={8}>
                      <Input
                        type="number"
                        placeholder="Khoảng cách đến trạm kế (km)"
                        value={s.toNextStationKm}
                        onChange={(e) => {
                          const updated = [...selectedStations];
                          updated[index].toNextStationKm = e.target.value;
                          setSelectedStations(updated);
                        }}
                      />
                    </Col>

                    <Col span={4} style={{ display: "flex", justifyContent: "center" }}>
                      <Button danger onClick={() => removeStation(index)}>
                        Xóa
                      </Button>
                    </Col>
                  </Row>

                ))}

                <Button type="dashed" block onClick={addStation}>
                  + Thêm trạm
                </Button>
              </div>
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

            <Collapse
              defaultActiveKey={["1"]}
              bordered={false}
              style={{
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
              }}
            >
              <Panel
                key="1"
                header={
                  <h3 style={{ margin: 0, textAlign: "center" }}>
                    Danh sách tàu ({detailData.trains?.length || 0})
                  </h3>
                }
              >
                {detailData.trains && detailData.trains.length > 0 ? (
                  <Table
                    dataSource={detailData.trains}
                    rowKey="id"
                    pagination={false}
                    bordered
                    columns={[
                      { title: "Mã tàu", dataIndex: "trainCode" },
                      { title: "Model", dataIndex: "modelName" },
                      // { title: "Trạng thái", dataIndex: "statusName" },
                      // { title: "Kinh độ", dataIndex: "longitude" },
                      // { title: "Vĩ độ", dataIndex: "latitude" },
                    ]}
                  />
                ) : (
                  <Empty description="Không có dữ liệu tàu" />
                )}
              </Panel>
            </Collapse>

            <Collapse
              defaultActiveKey={["1"]}
              bordered={false}
              style={{
                marginTop: 5,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
              }}
            >
              <Panel
                key="1"
                header={
                  <h3 style={{ margin: 0, textAlign: "center" }}>
                    Danh sách trạm ({detailData.stations?.length || 0})
                  </h3>
                }
              >
                {detailData.stations && detailData.stations.length > 0 ? (
                  <Table
                    dataSource={detailData.stations}
                    rowKey="id"
                    pagination={false}
                    bordered
                    columns={[
                      { title: "Mã trạm", dataIndex: "stationCode" },
                      { title: "Tên trạm", dataIndex: "stationNameVi" },
                      // { title: "Trạng thái", dataIndex: "statusName" },
                      { title: "Kinh độ", dataIndex: "longitude" },
                      { title: "Vĩ độ", dataIndex: "latitude" },
                    ]}
                  />
                ) : (
                  <Empty description="Không có dữ liệu trạm"/>
                )}
              </Panel>
            </Collapse>
          </div>
        ) : (
          <Empty description="Không có dữ liệu chi tiết" />
        )}
      </Modal>
    </div>
  );
}

export default MetroLineManagement;
