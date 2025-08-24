import "./TrainStaff.scss";
import "leaflet/dist/leaflet.css";

import {
  Button,
  Col,
  DatePicker,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  getAllRegions,
  getAllStations,
  getMetroLines,
  getMetroLinesByStation,
  getMetroTrainsByStation,
} from "../../../../../config/metroApi";

import { PATH_NAME } from "../../../../../constants/pathname";
import api from "../../../../../config/axios";
import { jwtDecode } from "jwt-decode";
import { selectUser } from "../../../../../redux/features/counterSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  trainStatusColorMap,
  trainStatusMap,
} from "../../../../../constants/statusMap";
import { ReloadOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

function TrainStaff() {
  const user = useSelector(selectUser);

  const [metroTrains, setMetroTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxCapacity, setMaxCapacity] = useState(0); // Trọng tải của tàu
  const [maxVolume, setMaxVolume] = useState(0); // Dung tích của tàu
  const token = localStorage.getItem("token");
  const decodedUser = token ? jwtDecode(token) : null;

  const navigate = useNavigate();

  const [regions, setRegions] = useState([]);
  const [metroLines, setMetroLines] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [direction, setDirection] = useState(null);
  const [selectedTrain, setSelectedTrain] = useState(null);

  // useEffect(() => {
  //   setLoading(true);
  //   Promise.all([
  //     getAllRegions(),
  //     getMetroLinesByStation(decodedUser?.StationId),
  //     getAllStations(),
  //   ]).then(([regionsData, metroLinesData, stationsData]) => {
  //     setRegions(regionsData);
  //     setMetroLines(metroLinesData);
  //     setStations(stationsData);
  //   });
  //   getMetroTrainsByStation(decodedUser?.StationId)
  //     .then((data) => {
  //       // Set the metro trains data
  //       setMetroTrains(data.items);

  //       // Extract max capacity and max volume from additionalData
  //       const additionalData = data.additionalData[0];
  //       const capacity = additionalData.find(
  //         (item) => item.configKey === "MAX_CAPACITY_PER_LINE_KG"
  //       );
  //       const volume = additionalData.find(
  //         (item) => item.configKey === "MAX_CAPACITY_PER_LINE_M3"
  //       );

  //       setMaxCapacity(capacity ? capacity.configValue : "Không xác định");
  //       setMaxVolume(volume ? volume.configValue : "Không xác định");

  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching metro trains data", error);
  //     });
  // }, []);

  // Hàm tìm stationNameVi theo currentStationId

  const reloadData = async () => {
    if (!decodedUser?.StationId) return;
    setLoading(true);
    try {
      const [regionsData, metroLinesData, stationsData, trainData] =
        await Promise.all([
          getAllRegions(),
          getMetroLinesByStation(decodedUser.StationId),
          getAllStations(),
          getMetroTrainsByStation(decodedUser.StationId),
        ]);

      setRegions(regionsData);
      setMetroLines(metroLinesData);
      setStations(stationsData);

      // set metro trains
      setMetroTrains(trainData.items);

      // capacity & volume
      const additionalData = trainData.additionalData[0];
      const capacity = additionalData.find(
        (item) => item.configKey === "MAX_CAPACITY_PER_LINE_KG"
      );
      const volume = additionalData.find(
        (item) => item.configKey === "MAX_CAPACITY_PER_LINE_M3"
      );

      setMaxCapacity(capacity ? capacity.configValue : "Không xác định");
      setMaxVolume(volume ? volume.configValue : "Không xác định");
    } catch (error) {
      console.error("Error reload data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData(); // load lần đầu
  }, []);

  const getStationName = (currentStationId) => {
    if (!currentStationId) return "Không xác định";
    const station = stations.find(
      (s) => String(s.stationId) === String(currentStationId)
    );
    return station ? station.stationNameVi : "Không xác định";
  };

  const handleReset = async (train) => {
  if (!train) {
    toast.error("Chưa chọn tàu để reset lịch.");
    return;
  }

  try {
    // fetch direction luôn cho chắc chắn
    const res = await api.get(`/train/${train.id}/position`);
    const { additionalData } = res.data;
    const dir = additionalData?.fullPath?.[0]?.direction;

    if (dir !== 0 && dir !== 1) {
      toast.error("Không có direction để reset lịch tàu.");
      return;
    }

    const formData = new FormData();
    formData.append("trainIdOrCode", train.id);

    await api.post(`/train/schedule?startFromEnd=${dir}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success(`Đặt lại lịch cho tàu ${train.trainCode} thành công.`);
    await reloadData();
  } catch (error) {
    console.error("Lỗi khi reset lịch tàu:", error.response?.data || error);
    toast.error(error.response?.data?.message || "Không thể reset lịch tàu.");
  }
};


  const handleStartTrain = async (train) => {
    try {
      await api.post(`/train/${train.id}/status`);
      toast.success(`Xác nhận tàu ${train.trainCode} đã rời trạm thành công.`);

      await reloadData();
    } catch (error) {
      console.error("Lỗi khi start tàu:", error);
      const errorMessage =
        error.response?.data?.message ||
        `Không thể xác nhận tàu ${train.trainCode} rời trạm.`;
      toast.error(errorMessage);
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
      await reloadData();
    } catch (error) {
      console.error("Lỗi xác nhận tàu đến trạm:", error);
      const errorMessage =
        error.response?.data?.message ||
        `Không thể xác nhận tàu ${train.trainCode} đã đến trạm.`;

      toast.error(errorMessage);
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
      title: "Vị trí hiện tại",
      dataIndex: "currentStationId",
      key: "currentStationId",
      render: (currentStationId) => getStationName(currentStationId),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={trainStatusColorMap[status]}>
          {trainStatusMap[status] || "Không xác định"}
        </Tag>
      ),
    },

    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => {
        const isAtCurrentStation =
          String(record.currentStationId) === String(user?.StationId);
        const isStatusZero = record.status === 0;

        return (
          <div className="action-buttons">
            <Button
              type="primary"
              onClick={() => handleStartTrain(record)}
              style={{ marginRight: 8 }}
              disabled={isStatusZero || !isAtCurrentStation} // chỉ bật khi tàu đang ở ga của staff
            >
              Xác nhận tàu rời trạm
            </Button>

            <Button
              className="btn-arrival"
              onClick={() => handleConfirmArrival(record)}
              disabled={isStatusZero || isAtCurrentStation} // disable nếu trùng ga staff
            >
              Xác nhận tàu đến trạm
            </Button>

            <Button
              onClick={() => {
                handleViewMapTrain(record);
              }}
              style={{ marginRight: 8 }}
            >
              Xem bản đồ
            </Button>

            <Button
              danger
              
              onClick={() => {
                setSelectedTrain(record);
                handleReset(record);
              }}
              
            >
              Reset
            </Button>
          </div>
        );
      },
    },
  ];
  // Hàm lấy danh sách lineId thuộc khu vực
  const getLineIdsByRegion = (regionId) => {
    return metroLines
      ?.filter((line) => line.regionId === regionId)
      .map((line) => line.id);
  };

  const filteredTrains = metroTrains.filter((train) => {
    const matchLine = selectedLine ? train.lineId === selectedLine : true;
    const matchRegion = selectedRegion
      ? getLineIdsByRegion(selectedRegion)?.includes(train.lineId)
      : true;
    const matchStatus =
      selectedStatus !== null ? train.status === selectedStatus : true;
    return matchLine && matchRegion && matchStatus;
  });

  // Map the metroTrains data to fit the table format
  const data = filteredTrains.map((train, index) => ({
    key: index,
    stt: index + 1,
    id: train.id,
    trainCode: train.trainCode,
    modelName: train.modelName,
    currentStationId: train.currentStationId,
    status: train.status,
    maxCapacity,
    maxVolume,
  }));

  return (
    <div className="staff-train-container">
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
          {/* <Select
            showSearch
            optionFilterProp="children"
            placeholder="Chọn khu vực"
            allowClear
            style={{ width: 300 }}
            value={selectedRegion}
            onChange={(value) => setSelectedRegion(value)}
          >
            {regions?.map((region) => (
              <Option key={region.id} value={region.id}>
                {region.regionName}
              </Option>
            ))}
          </Select> */}

          <Select
            showSearch
            optionFilterProp="children"
            placeholder="Chọn tuyến metro"
            allowClear
            style={{ width: 500 }}
            value={selectedLine}
            onChange={(value) => setSelectedLine(value)}
          >
            {metroLines?.map((line) => (
              <Option key={line.id} value={line.id}>
                {line.lineNameVi}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Chọn trạng thái tàu"
            allowClear
            style={{ width: 250 }}
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value)}
          >
            {Object.keys(trainStatusMap).map((key) => (
              <Option key={key} value={Number(key)}>
                {trainStatusMap[key]}
              </Option>
            ))}
          </Select>
          <Button
            className="clear-filter-button"
            icon={<ReloadOutlined />}
            onClick={() => {
              setSelectedLine(null);
              setSelectedStatus(null);
            }}
          ></Button>
        </div>

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
