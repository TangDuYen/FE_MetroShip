import "./TrainStaff.scss";
import "leaflet/dist/leaflet.css";

import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Empty,
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
  getMetroTimeSlots,
  getMetroTrainsByStation,
} from "../../../../../config/metroApi";
import {
  trainStatusColorMap,
  trainStatusMap,
} from "../../../../../constants/statusMap";

import { PATH_NAME } from "../../../../../constants/pathname";
import { ClockCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import api from "../../../../../config/axios";
import { jwtDecode } from "jwt-decode";
import { selectUser } from "../../../../../redux/features/counterSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import moment from "moment";

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
  const [dateFilter, setDateFilter] = useState(null);
  const today = dayjs();
  const [timeSlots, setTimeSlots] = useState([]);
  const [trainDetails, setTrainDetails] = useState({});

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

      const slotData = await getMetroTimeSlots();
      setTimeSlots(slotData);

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

  const fetchTrainDetail = async (trainId) => {
    try {
      const res = await api.get(`/train/${trainId}/position`);
      setTrainDetails((prev) => ({ ...prev, [trainId]: res.data }));
    } catch (err) {
      console.error("Lỗi khi fetch chi tiết tàu:", err);
    }
  };

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
  //   const handleReset = async (train) => {
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
  //     await reloadData();
  //   } catch (error) {
  //     console.error("Lỗi khi reset lịch tàu:", error.response?.data || error);
  //     toast.error(error.response?.data?.message || "Không thể reset lịch tàu.");
  //   }
  // };

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
      title: "Chiều chạy",
      dataIndex: "direction",
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
      render: (value) =>
        value ? (
          <Tag color="green">{value}</Tag>
        ) : (
          //value
          <Tag color="default">Chưa xác định</Tag>
        ),
    },
    {
      title: "Ga kế tiếp",
      dataIndex: "nextStationName",
      key: "nextStationName",
      render: (value, record) => {
        if (record.status === 3 && value) {
          return <Tag color="blue">{value}</Tag>;
        }
        return <Tag color="default">Chưa xác định</Tag>;
      },
    },
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
      key: "actions",
      width: 510,
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

            {/* <Button
              danger
              
              onClick={() => {
                handleReset(record);
              }}
              
            >
              Reset
            </Button> */}
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
    <div className="staff-train-container">
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
              <Tag color={trainStatusColorMap[key]}>{trainStatusMap[key]}</Tag>
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
              description="Không có tàu"
            />
          )}
        >
          <Table
            columns={columns}
            dataSource={data} // Pass the correctly mapped data to `dataSource`
            rowKey="id" // Ensure `id` is used as the unique key for each row
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
    </div>
  );
}

export default TrainStaff;
