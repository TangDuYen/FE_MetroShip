import "./MetroTrainManagement.scss";

import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  getAllMetroTrains,
  getMetroLines,
  getMetroTimeSlots,
} from "../../../../../config/metroApi";
import { useEffect, useState } from "react";

import api from "../../../../../config/axios";
import { toast } from "react-toastify";

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
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [lineMap, setLineMap] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [searchTrainCode, setSearchTrainCode] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      const lines = await getMetroLines();
      const map = {};
      lines.forEach((line) => {
        map[line.id] = { lineNameVi: line.lineNameVi };
      });
      setMetroLines(lines);
      setLineMap(map);

      const slotData = await getMetroTimeSlots(); // 👈 fetch time slots
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
      setLoading(false);
    };

    fetchInitialData();
  }, []);

  // const handleFilterByLine = (lineId) => {
  //   setSelectedLineId(lineId);
  //   if (!lineId) {
  //     setFilteredTrains(allTrains);
  //     return;
  //   }
  //   const filtered = allTrains.filter((train) => train.lineId === lineId);
  //   setFilteredTrains(filtered);
  // };

  const applyFilters = () => {
    let filtered = [...allTrains];

    if (selectedLineId) {
      filtered = filtered.filter((train) => train.lineId === selectedLineId);
    }

    if (searchTrainCode) {
      const kw = searchTrainCode.toLowerCase();
      filtered = filtered.filter(
        (train) =>
          train.trainCode?.toLowerCase().includes(kw) ||
          train.modelName?.toLowerCase().includes(kw)
      );
    }

    setFilteredTrains(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedLineId, searchTrainCode]);

  const openAddModal = () => {
    form.resetFields();
    setEditingTrain(null);
    setIsModalOpen(true);
  };

  const openEditModal = (train) => {
    setEditingTrain(train);
    form.setFieldsValue(train);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        trainId: editingTrain.id,
        timeSlotId: values.timeSlotId,
        date: values.date.format("YYYY-MM-DD"),
        direction: values.direction,
      };
      await api.post("/metro-trains/itineraries", payload);
      toast.success("Đã phân tàu vào ca thành công!");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      toast.error("Phân tàu thất bại!");
    }
  };

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
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button
            className="assign-train-button"
            style={{
              backgroundColor: "#0066CC",
              color: "white",
              border: "#0066CC",
            }}
            onClick={() => openEditModal(record)}
          >
            {" "}
            Phân tàu{" "}
          </Button>
          <Button
            className="edit-train-button"
            onClick={() => openEditModal(record)}
          >
            {" "}
            Cập nhật{" "}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="metro-train-management-container">
      <Space style={{ marginBottom: 16, marginRight: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Thêm tàu
        </Button>
        <Select
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.children?.toLowerCase().includes(input.toLowerCase())
          }
          placeholder="Lọc theo tuyến"
          allowClear
          style={{ width: 400 }}
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
        <Button
          className="clear-filter-button"
          icon={<ReloadOutlined />}
          onClick={() => {
            setSearchTrainCode("");
            setSelectedLineId(null);
            setFilteredTrains(allTrains);
          }}
        ></Button>
      </Space>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <Table
          columns={columns}
          dataSource={filteredTrains}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      <Modal
        title={editingTrain ? "Phân tàu" : "Cập nhật tàu"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText={editingTrain ? "Phân tàu" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="trainCode"
            label="Mã tàu"
            rules={[{ required: true, message: "Vui lòng nhập mã tàu" }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="modelName"
            label="Model tàu"
            rules={[{ required: true, message: "Vui lòng nhập model tàu" }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
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
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MetroTrainManagement;
