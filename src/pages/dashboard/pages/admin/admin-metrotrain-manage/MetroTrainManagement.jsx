import "./MetroTrainManagement.scss";

import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
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
  Typography,
} from "antd";
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  getAllMetroTrains,
  getAllStations,
  getMetroLines,
  getMetroLinesAdmin,
  getMetroTimeSlots,
} from "../../../../../config/metroApi";
import {
  trainStatusColorMap,
  trainStatusMap,
} from "../../../../../constants/statusMap";
import { useEffect, useState } from "react";

import api from "../../../../../config/axios";
import dayjs from "dayjs";
import moment from "moment";
import { toast } from "react-toastify";

const { Title } = Typography;
function MetroTrainManagement() {
  const [metroTrains, setMetroTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxCapacity, setMaxCapacity] = useState(0);
  const [maxVolume, setMaxVolume] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);
  const [form] = Form.useForm();
  const [allTrains, setAllTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [metroLines, setMetroLines] = useState([]);
  const [selectedLineId, setSelectedLineId] = useState([]);
  const [lineMap, setLineMap] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [searchTrainCode, setSearchTrainCode] = useState("");
  const [stations, setStations] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const today = dayjs();

  const [trainDetails, setTrainDetails] = useState({});


  const fetchInitialData = async () => {
    const lines = await getMetroLinesAdmin();
    const map = {};
    lines.forEach((line) => {
      map[line.id] = { lineNameVi: line.lineNameVi };
    });
    setMetroLines(lines);
    setLineMap(map);

    const slotData = await getMetroTimeSlots();
    setTimeSlots(slotData);

    const data = await getAllMetroTrains();
    const trains = data.data.items;
    const trainsWithLine = trains.map((train) => ({
      ...train,
      lineNameVi: map[train.lineId]?.lineNameVi || "Không xác định",
    }));
    setAllTrains(trainsWithLine);
    setFilteredTrains(trainsWithLine);

    const additionalData = data.additionalData[0];
    const capacity = additionalData.find(
      (item) => item.configKey === "MAX_CAPACITY_PER_LINE_KG"
    );
    const volume = additionalData.find(
      (item) => item.configKey === "MAX_CAPACITY_PER_LINE_M3"
    );

    setMaxCapacity(capacity ? capacity.configValue : "Không xác định");
    setMaxVolume(volume ? volume.configValue : "Không xác định");

    const stationRes = await getAllStations();
    setStations(stationRes || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchTrainDetail = async (trainId) => {
    try {
      const res = await api.get(`/train/${trainId}/position`);
      setTrainDetails((prev) => ({ ...prev, [trainId]: res.data }));
    } catch (err) {
      console.error("Lỗi khi fetch chi tiết tàu:", err);
    }
  };
  // const handleReset = async (train) => {
  //   if (!train) {
  //     toast.error("Chưa chọn tàu để reset lịch.");
  //     return;
  //   }

  //   try {
  //     // fetch direction luôn cho chắc chắn
  //     const res = await api.get(`/train/${train.id}/position`);
  //     const { additionalData } = res.data;
  //     const dir = additionalData?.fullPath?.[0]?.direction;

  //     if (dir !== 0 && dir !== 1) {
  //       toast.error("Không có direction để reset lịch tàu.");
  //       return;
  //     }

  //     const formData = new FormData();
  //     formData.append("trainIdOrCode", train.id);

  //     await api.post(`/train/schedule?startFromEnd=${dir}`, formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     toast.success(`Đặt lại lịch cho tàu ${train.trainCode} thành công.`);
  //   } catch (error) {
  //     console.error("Lỗi khi reset lịch tàu:", error.response?.data || error);
  //     toast.error(error.response?.data?.message || "Không thể reset lịch tàu.");
  //   }
  // };

  //KHI NÀO METRO-TRAIN THÊM DIRECTION. THÌ SỬ DỤNG NÀY
  // const handleReset = async (train) => {
  //   if (!train) {
  //     toast.error("Chưa chọn tàu để reset lịch.");
  //     return;
  //   }

  //   const dir = train.direction;

  //   if (dir !== 0 && dir !== 1) {
  //     toast.error("Không có direction để reset lịch tàu.");
  //     return;
  //   }

  //   try {
  //     const formData = new FormData();
  //     formData.append("trainIdOrCode", train.id);

  //     await api.post(`/train/schedule?startFromEnd=${dir}`, formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     toast.success(`Đặt lại lịch cho tàu ${train.trainCode} thành công.`);
  //   } catch (error) {
  //     console.error("Lỗi khi reset lịch tàu:", error.response?.data || error);
  //     toast.error(error.response?.data?.message || "Không thể reset lịch tàu.");
  //   }
  // };

  // const handleFilterByLine = (lineId) => {
  //   setSelectedLineId(lineId);
  //   if (!lineId) {
  //     setFilteredTrains(allTrains);
  //     return;
  //   }
  //   const filtered = allTrains.filter((train) => train.lineId === lineId);
  //   setFilteredTrains(filtered);
  // };

  const getCurrentShift = (slots) => {
    const now = moment();
    return slots.find((slot) => {
      const start = moment(slot.openTime, "HH:mm:ss");
      const end = moment(slot.closeTime, "HH:mm:ss");
      if (end.isBefore(start)) {
        // NIGHT SHIFT
        return now.isAfter(start) || now.isBefore(end);
      }
      return now.isBetween(start, end);
    });
  };

  const currentShift = getCurrentShift(timeSlots);

  const applyFilters = () => {
    let filtered = [...allTrains];

    if (selectedLineId && selectedLineId.length > 0) {
      filtered = filtered.filter((train) =>
        selectedLineId.includes(train.lineId)
      );
    }

    if (searchTrainCode) {
      const kw = searchTrainCode.toLowerCase();
      filtered = filtered.filter(
        (train) =>
          train.trainCode?.toLowerCase().includes(kw) ||
          train.modelName?.toLowerCase().includes(kw)
      );
    }

    if (selectedStatus != null) {
      filtered = filtered.filter((train) => train.status === selectedStatus);
    }

    if (selectedDirection != null) {
      filtered = filtered.filter(
        (train) => train.direction === selectedDirection
      );
    }

    setFilteredTrains(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedLineId, searchTrainCode, selectedStatus, selectedDirection]);

  // const getStationName = (currentStationId) => {
  //   if (!currentStationId) return "Không xác định";
  //   const station = stations.find(
  //     (s) => String(s.stationId) === String(currentStationId)
  //   );
  //   return station ? station.stationNameVi : "Không xác định";
  // };
  const openAddModal = () => {
    form.resetFields();
    setEditingTrain(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const openEditModal = (train) => {
    setEditingTrain(train);
    form.setFieldsValue(train);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const openAssignModal = (train) => {
    setEditingTrain(train);
    form.setFieldsValue(train);
    setModalMode("assign");
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        trainIdOrCode: editingTrain.id,
      };
      await api.post(
        `/train/schedule?startFromEnd=${values.startFromEnd}`,
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Đã phân tàu vào ca thành công!");
      await fetchInitialData();
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || err.message || "Phân tàu thất bại!";
      toast.error(errorMessage);
    }
  };
  // const handleSubmit = async () => {
  //   try {
  //     const values = await form.validateFields();
  //     const payload = {
  //       trainId: editingTrain.id,
  //       timeSlotId: values.timeSlotId,
  //       date: values.date.format("YYYY-MM-DD"),
  //       direction: values.direction,
  //     };
  //     await api.post("/metro-trains/itineraries", payload);
  //     toast.success("Đã phân tàu vào ca thành công!");
  //     setIsModalOpen(false);
  //     form.resetFields();
  //   } catch (err) {
  //     console.error(err);
  //     const errorMessage =
  //       err.response?.data?.message || err.message || "Phân tàu thất bại!";
  //     toast.error(errorMessage);
  //   }
  // };
  const parcelColumns = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    { title: "Mã bưu kiện", dataIndex: "parcelCode", key: "parcelCode" },
  ];

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Mã tàu",
      dataIndex: "trainCode",
    },
    {
      title: "Model tàu",
      dataIndex: "modelName",
    },
    {
      title: "Tuyến metro",
      dataIndex: "lineNameVi",
    },
    {
      title: "Trọng tải tàu (kg)",
      render: () => maxCapacity,
    },
    {
      title: "Dung tích tàu (m³)",
      render: () => maxVolume,
      width: 100,
    },
    {
      title: "Chiều chạy",
      dataIndex: "currentTrainScheduleDirection",
      render: (value) =>
        value === 0 ? (
          <Tag color="gold">Chiều đi</Tag>
        ) : (
          <Tag color="purple">Chiều về</Tag>
        ),
    },
    {
      title: "Ga hiện tại",
      dataIndex: "currentStationName",
      key: "currentStationName",
      width: 120,
      render: (value) =>
        value ? (
          <Tag color="green">{value}</Tag>
        ) : (
          //value
          <Tag color="default">Chưa xác định</Tag>
        ),
    },
    // {
    //   title: "Ga kế tiếp",
    //   dataIndex: "nextStationName",
    //   key: "nextStationName",
    //   width: 120,
    //   render: (value, record) => {
    //     if (record.status === 3 && value) {
    //       return <Tag color="blue">{value}</Tag>;
    //     }
    //     return <Tag color="default">Chưa xác định</Tag>;
    //   },
    // },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag color={trainStatusColorMap[status]}>
          {trainStatusMap[status] || "Không xác định"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
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
            <Button
              className="assign-train-button"
              onClick={() => openAssignModal(record)}
            >
              {" "}
              Phân tàu{" "}
            </Button>
          </ConfigProvider>
          {/* <ConfigProvider
            theme={{
              components: {
                Button: {
                  defaultColor: "white",
                  defaultBg: "#52c41a",
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
              className="edit-train-button"
              onClick={() => openEditModal(record)}
            >
              {" "}
              Cập nhật{" "}
            </Button>
          </ConfigProvider> */}
          {/* <Button
            danger
            onClick={() => {
              // setSelectedTrain(record);
              handleReset(record);
            }}
          >
            Reset
          </Button> */}
        </Space>
      ),
    },
  ];

  const expandedRowRender = (train) => {
    const detail = trainDetails[train.id];
    const parcels = detail?.additionalData?.parcels || [];
    if (!detail) return <Spin />;
    return (
      <div>
        <Spin spinning={loading} tip="Đang tải dữ liệu...">
          <ConfigProvider
            renderEmpty={() => (
              <Empty
                image={Empty.PRESENTED_IMAGE_DEFAULT}
                description="Không có bưu kiện"
              />
            )}
          >
            <Table
              columns={parcelColumns}
              dataSource={parcels}
              rowKey="parcelId"
              pagination={false}
              size="small"
              className="parcel-table"
            />
          </ConfigProvider>
        </Spin>
      </div>
    );
  };

  return (
    <div className="metro-train-management-container">
      <Space style={{ marginBottom: 16, marginRight: 16 }}>
        <Button type="primary" onClick={openAddModal}>
          + Thêm tàu
        </Button>
        <Select
          mode="multiple"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.children?.toLowerCase().includes(input.toLowerCase())
          }
          placeholder="Lọc theo tuyến"
          allowClear
          style={{ width: 300 }}
          value={selectedLineId}
          onChange={setSelectedLineId}
        >
          {metroLines.map((line) => (
            <Option key={line.id} value={line.id}>
              {line.lineNameVi}
            </Option>
          ))}
        </Select>
        <Input.Search
          placeholder="Tìm mã tàu"
          style={{ width: 250 }}
          value={searchTrainCode}
          onChange={(e) => setSearchTrainCode(e.target.value)}
        />
        <Select
          placeholder="Trạng thái"
          allowClear
          style={{ width: 200 }}
          value={selectedStatus}
          onChange={setSelectedStatus}
        >
          {Object.entries(trainStatusMap).map(([key, value]) => (
            <Select.Option key={key} value={parseInt(key)}>
              <Tag color={trainStatusColorMap[key]} style={{ marginRight: 8 }}>
                {value}
              </Tag>
            </Select.Option>
          ))}
        </Select>

        <Select
          placeholder="Chiều chạy"
          allowClear
          style={{ width: 200 }}
          value={selectedDirection}
          onChange={setSelectedDirection}
        >
          <Select.Option value={0}>
            <Tag color="gold">Chiều đi</Tag>
          </Select.Option>
          <Select.Option value={1}>
            <Tag color="purple">Chiều về</Tag>
          </Select.Option>
        </Select>

        <Button
          className="clear-filter-button"
          icon={<ReloadOutlined />}
          onClick={() => {
            setSearchTrainCode("");
            setSelectedLineId([]);
            setSelectedStatus(null);
            setFilteredTrains(allTrains);
            setSelectedDirection(null);
          }}
        ></Button>
      </Space>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <Card style={{ marginBottom: "1em" }}>
          <Title level={3}>Ngày và ca của tàu Metro</Title>
          <Row gutter={16}>
            <Col span={6}>
              <DatePicker
                value={dateFilter ?? today}
                onChange={(date) => setDateFilter(date)}
                style={{ width: "100%" }}
                disabled
                format="DD/MM/YYYY"
              />
            </Col>
            <Col span={18}>
              <div style={{ display: "flex", gap: "0.5em", flexWrap: "wrap" }}>
                {timeSlots.map((slot) => {
                  const isActive = currentShift?.shift === slot.shift;
                  return (
                    <div
                      key={slot.id}
                      style={{
                        padding: "0.5em 1em",
                        borderRadius: "8px",
                        background: isActive ? "#0066CC" : "#f0f0f0",
                        color: isActive ? "white" : "#000",
                        fontWeight: isActive ? 600 : 400,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5em",
                      }}
                    >
                      <ClockCircleOutlined />
                      Ca {slot.shift} ({slot.openTime.slice(0, 5)} -{" "}
                      {slot.closeTime.slice(0, 5)})
                    </div>
                  );
                })}
              </div>
            </Col>
          </Row>
        </Card>
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
            dataSource={filteredTrains}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            expandable={{
              expandedRowRender,
              onExpand: (expanded, record) => {
                if (expanded && !trainDetails[record.id]) {
                  fetchTrainDetail(record.id);
                }
              },
            }}
          />
        </ConfigProvider>
      </Spin>

      <Modal
        title={
          modalMode === "add"
            ? "Thêm tàu"
            : modalMode === "edit"
              ? "Cập nhật tàu"
              : "Phân tàu"
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText={
          modalMode === "add"
            ? "Thêm"
            : modalMode === "edit"
              ? "Cập nhật"
              : "Phân tàu"
        }
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="trainCode"
            label="Mã tàu"
            rules={[{ required: true, message: "Vui lòng nhập mã tàu" }]}
          >
            <Input placeholder="Nhập mã tàu" disabled={modalMode !== "add"} />
          </Form.Item>

          <Form.Item
            placeholder="Nhập Model tàu"
            name="modelName"
            label="Model tàu"
            rules={[{ required: true, message: "Vui lòng nhập model tàu" }]}
          >
            <Input
              placeholder="Nhập model tàu"
              disabled={modalMode !== "add"}
            />
          </Form.Item>
          {/* <Form.Item
            name="timeSlotId"
            label="Ca hoạt động"
            rules={[{ required: true, message: "Vui lòng chọn ca hoạt động" }]}
          >
            <Select placeholder="Chọn ca chạy">
              {timeSlots.map((slot) => (
                <Select.Option key={slot.id} value={slot.id}>
                  {slot.openTime} - {slot.closeTime}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày"
            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="direction"
            label="Chiều chạy"
            rules={[{ required: true, message: "Vui lòng chọn chiều chạy" }]}
          >
            <Select placeholder="Chiều chạy">
              <Select.Option value={0}>Chiều đi</Select.Option>
              <Select.Option value={1}>Chiều về</Select.Option>
            </Select>
          </Form.Item> */}
          <Form.Item
            name="startFromEnd"
            label="Định hướng chạy"
            rules={[{ required: true, message: "Vui lòng chọn hướng chạy" }]}
          >
            <Select placeholder="Chọn hướng chạy">
              <Select.Option value={0}>Bắt đầu từ trạm đầu tuyến</Select.Option>
              <Select.Option value={1}>
                Bắt đầu từ trạm cuối tuyến
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MetroTrainManagement;
