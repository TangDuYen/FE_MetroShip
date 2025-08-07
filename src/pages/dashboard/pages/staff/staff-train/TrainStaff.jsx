import "./TrainStaff.scss";

import {
  Col,
  DatePicker,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Typography,
  Button,
} from "antd";
import React, { useEffect, useState } from "react";
import { getAllMetroTrains } from "../../../../../config/metroApi";
import moment from "moment";
import api from "../../../../../config/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { PATH_NAME } from "../../../../../constants/pathname";
import { useSelector } from "react-redux";
import { selectUser } from "../../../../../redux/features/counterSlice";

const { Title } = Typography;
const { Option } = Select;

function TrainStaff() {
  const user = useSelector(selectUser);
  console.log("User data:", user);

  const [metroTrains, setMetroTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxCapacity, setMaxCapacity] = useState(0); // Trọng tải của tàu
  const [maxVolume, setMaxVolume] = useState(0); // Dung tích của tàu

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getAllMetroTrains()
      .then((data) => {
        // Set the metro trains data
        setMetroTrains(data.data.items);

        // Extract max capacity and max volume from additionalData
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
      })
      .catch((error) => {
        console.error("Error fetching metro trains data", error);
      });
  }, []);

  const handleStartTrain = async (train) => {
    try {
      await api.post(`/train/${train.id}/status`);
      toast.success(`Tàu ${train.trainCode} đã được khởi động`);
    } catch (error) {
      console.error("Lỗi khi start tàu:", error);
      toast.error(`Không thể khởi động tàu ${train.trainCode}`);
    }
  };

  const handleConfirmArrival = async (train) => {
    try {
      const stationId = user?.StationId;

      if (!stationId) {
        toast.error("Không tìm thấy stationId của nhân viên.");
        return;
      }

      await api.post(`/train/${train.id}/confirm-arrival`, null, {
        params: { stationId },
      });

      toast.success(`Tàu ${train.trainCode} đã được xác nhận đến trạm.`);
    } catch (error) {
      console.error("Lỗi xác nhận tàu đến trạm:", error);
      toast.error("Xác nhận tàu thất bại.");
    }
  };

  const handleViewMapTrain = (train) => {
    console.log("Train clicked:", train);
    // setSelectedTrain(train);
    // setIsMapVisible(true);
    const mapPath = PATH_NAME.DASHBOARD_STAFF_TRAIN_MAP.replace(
      ":trainId",
      train.id
    );
    navigate(mapPath);
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      render: (_, __, index) => index + 1, // Generate index for each row
      width: 60,
    },
    {
      title: "Mã tàu",
      dataIndex: "trainCode",
      key: "trainCode",
    },
    {
      title: "Model tàu",
      dataIndex: "modelName",
      key: "modelName",
    },
    {
      title: "Trọng tải tàu (kg)",
      dataIndex: "maxCapacity",
      key: "maxCapacity",
      render: () => maxCapacity, // Show max capacity
    },
    {
      title: "Dung tích tàu (m³)",
      dataIndex: "maxVolume",
      key: "maxVolume",
      render: () => maxVolume, // Show max volume
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="primary"
            onClick={() => handleStartTrain(record)}
            style={{ marginRight: 8 }}
          >
            Bắt đầu
          </Button>
          <Button
            className="btn-arrival"
            onClick={() => handleConfirmArrival(record)}
          >
            Đến trạm
          </Button>
          <Button onClick={() => handleViewMapTrain(record)}>Xem bản đồ</Button>
        </div>
      ),
    },
  ];

  // Map the metroTrains data to fit the table format
  const data = metroTrains.map((train, index) => ({
    key: index, // Ensure each row has a unique `key` field
    stt: index + 1,
    id: train.id,
    trainCode: train.trainCode,
    modelName: train.modelName,
    maxCapacity: maxCapacity, // Adding max capacity for each train
    maxVolume: maxVolume, // Adding max volume for each train
  }));

  return (
    <div className="staff-train-container">
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <Table
          columns={columns}
          dataSource={data} // Pass the correctly mapped data to `dataSource`
          rowKey="id" // Ensure `id` is used as the unique key for each row
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
}

export default TrainStaff;
