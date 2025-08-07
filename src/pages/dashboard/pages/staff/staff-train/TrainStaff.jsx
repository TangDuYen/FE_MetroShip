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
  Typography,
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
import { getAllMetroTrains, getAllRegions, getMetroLines } from "../../../../../config/metroApi";

import L from "leaflet";
import api from "../../../../../config/axios";
import metro from "../../../../../assets/metro_station.png";
import moment from "moment";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { PATH_NAME } from "../../../../../constants/pathname";

const { Title } = Typography;
const { Option } = Select;

function TrainStaff() {
  const [metroTrains, setMetroTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxCapacity, setMaxCapacity] = useState(0); // Trọng tải của tàu
  const [maxVolume, setMaxVolume] = useState(0); // Dung tích của tàu


  const navigate = useNavigate();
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [position, setPosition] = useState([0, 0]);
  const [trainPath, setTrainPath] = useState([]);
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [regions, setRegions] = useState([]);
  const [metroLines, setMetroLines] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);

  const intervalRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllRegions(), getMetroLines()]).then(([regionsData, metroLinesData]) => {
      setRegions(regionsData);
      setMetroLines(metroLinesData);
    })
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
            icon="🚆"
            onClick={() => handleStartTrain(record)}
            style={{ marginRight: 8 }}
          >
            Bắt đầu
          </Button>
          <Button onClick={() => handleViewMapTrain(record)} icon="🗺️">
            Xem bản đồ
          </Button>
        </div>
      ),
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
    return matchLine && matchRegion;
  });


  // Map the metroTrains data to fit the table format
  const data = filteredTrains.map((train, index) => ({
    key: index,
    stt: index + 1,
    id: train.id,
    trainCode: train.trainCode,
    modelName: train.modelName,
    maxCapacity,
    maxVolume,
  }));

//   const getNearestIndex = (position, path) => {
//     if (!path.length) return 0;
//     let minIndex = 0;
//     let minDist = Infinity;
//     path.forEach((p, i) => {
//       const dist = Math.sqrt(
//         Math.pow(p[0] - position[0], 2) + Math.pow(p[1] - position[1], 2)
//       );
//       if (dist < minDist) {
//         minDist = dist;
//         minIndex = i;
//       }
//     });
//     return minIndex;
//   };

//   const currentIndex = getNearestIndex(position, trainPath);

  return (
    <div className="staff-train-container">
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
          <Select
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
          </Select>

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
