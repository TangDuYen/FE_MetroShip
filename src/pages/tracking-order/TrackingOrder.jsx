import "./TrackingOrder.scss";
import { Badge, Button, Card, Col, Divider, Row, Timeline } from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
  shipmentStatusMap,
  shipmentStatusSteps,
} from "../../constants/statusMap";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { PATH_NAME } from "../../constants/pathname";
import api from "../../config/axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import metro from "../../assets/metro_station.png";
import axios from "axios";

function ResizeMapOnShow() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
  }, [map]);
  return null;
}

const locationIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const metroIcon = new L.Icon({
  iconUrl: metro,
  iconSize: [25, 25],
});
function TrackingOrder() {
  const [selectedShipment, setSelectedShipment] = useState(null);
  const { trackingCode } = useParams();

  const navigate = useNavigate();

  const [position, setPosition] = useState([0, 0]);
  const [path, setPath] = useState([]);
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [trainCode, setTrainCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [fullPathSegments, setFullPathSegments] = useState([]);

  const intervalRef = useRef(null);

  const formatCurrency = (v) =>
    v.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " VND";

  useEffect(() => {
    if (!trackingCode) return;

    const fetchShipmentDetails = async () => {
      try {
        const res = await api.get(`/shipments/${trackingCode}`);
        setSelectedShipment(res.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin đơn hàng:", error);
      }
    };

    fetchShipmentDetails();
  }, [trackingCode]);

  const fetchLivePosition = async () => {
    try {
      const res = await axios.get(
        `https://localhost:7085/${trackingCode}/position`
      );
      const {
        latitude,
        longitude,
        path,
        fromStation,
        toStation,
        trainCode,
        additionalData,
      } = res.data;

      setPosition([latitude, longitude]);
      setFromStation(fromStation);
      setToStation(toStation);
      setTrainCode(trainCode || "");

      if (path && Array.isArray(path)) {
        setPath(path.map((p) => [p.latitude, p.longitude]));
      }

      const fullPath = additionalData?.shipment?.fullPath || [];
      if (Array.isArray(fullPath)) {
        setFullPathSegments(fullPath);
      }

      setLoading(false);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu tàu:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePosition();
    intervalRef.current = setInterval(fetchLivePosition, 2000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const getNearestIndex = (position, path) => {
    if (!path.length) return 0;
    let minIndex = 0;
    let minDist = Infinity;
    path.forEach((p, i) => {
      const dist = Math.sqrt(
        Math.pow(p[0] - position[0], 2) + Math.pow(p[1] - position[1], 2)
      );
      if (dist < minDist) {
        minDist = dist;
        minIndex = i;
      }
    });
    return minIndex;
  };

  const currentIndex = getNearestIndex(position, path);

  if (!selectedShipment) return <div>Đang tải đơn...</div>;

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
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {fullPathSegments.map((segment, index) => (
                <React.Fragment key={index}>
                  <Polyline
                    positions={segment.polyline.map((p) => [
                      p.latitude,
                      p.longitude,
                    ])}
                    color={segment.isCompleted ? "gray" : "blue"}
                  />
                  {segment.polyline.length > 0 && (
                    <>
                      <Marker
                        position={[
                          segment.from.latitude,
                          segment.from.longitude,
                        ]}
                        icon={locationIcon}
                      >
                        <Popup>{segment.from.name}</Popup>
                      </Marker>
                      <Marker
                        position={[segment.to.latitude, segment.to.longitude]}
                        icon={locationIcon}
                      >
                        <Popup>{segment.to.name}</Popup>
                      </Marker>
                    </>
                  )}
                </React.Fragment>
              ))}

              {path.length > 1 && (
                <>
                  <Polyline
                    positions={path.slice(0, currentIndex + 1)}
                    color="gray"
                  />
                  <Polyline positions={path.slice(currentIndex)} color="blue" />
                </>
              )}

              {path.length > 0 && (
                <>
                  <Marker position={path[0]} icon={locationIcon}>
                    <Popup>{fromStation || "Ga xuất phát"}</Popup>
                  </Marker>
                  <Marker position={path[path.length - 1]} icon={locationIcon}>
                    <Popup>{toStation || "Ga đến"}</Popup>
                  </Marker>
                </>
              )}

              {position[0] !== 0 && (
                <Marker position={position} icon={metroIcon}>
                  <Popup>{trainCode || "Tàu Metro"}</Popup>
                </Marker>
              )}
            </MapContainer>
          </Card>

          <Card
            title={
              <Badge
                className={`status-badge ${
                  currentStatus >= 20 ? "delivered" : "in-transit"
                }`}
              >
                {shipmentStatusMap[selectedShipment.shipmentStatus] ||
                  "Không rõ trạng thái"}
              </Badge>
            }
            bordered={false}
          >
            <div className="custom-progress">
              {[
                { id: 8, label: "Đã lấy hàng" },
                { id: 9, label: "Đang giao hàng" },
                { id: 17, label: "Đã giao hàng" },
              ].map((step, idx, arr) => {
                const isCompleted = currentStatus >= step.id;
                const isLast = idx === arr.length - 1;
                return (
                  <div key={step.id} className="progress-step">
                    <div className={`dot ${isCompleted ? "completed" : ""}`}>
                      {isLast && isCompleted ? "✔️" : ""}
                    </div>
                    {!isLast && (
                      <div
                        className={`line ${
                          currentStatus >= arr[idx + 1].id ? "completed" : ""
                        }`}
                      />
                    )}
                    <div className={`label ${isCompleted ? "active" : ""}`}>
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card bordered={false}>
            <Timeline>
              {shipmentStatusSteps
                .filter((step) => currentStatus >= step.id)
                .reverse()
                .map((step, idx) => {
                  let timestamp = "";

                  switch (step.id) {
                    case 0: // Đơn tạo
                      timestamp = selectedShipment.bookedAt
                        ? dayjs(selectedShipment.bookedAt).format("DD/MM HH:mm")
                        : "";
                      break;
                    case 8: // Đã lấy hàng
                      timestamp = selectedShipment.pickedUpAt
                        ? dayjs(selectedShipment.pickedUpAt).format(
                            "DD/MM HH:mm"
                          )
                        : "";
                      break;
                    default:
                      // Tạm thời giả lập giờ giảm dần
                      timestamp = dayjs()
                        .subtract(idx, "hour")
                        .format("DD/MM HH:mm");
                  }

                  return (
                    <Timeline.Item
                      key={step.id}
                      color={idx === 0 ? "green" : "gray"}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          className="timeline-date"
                          style={{ color: "#999" }}
                        >
                          {timestamp}
                        </div>
                        <div
                          className={`timeline-description ${
                            idx === 0 ? "highlight" : ""
                          }`}
                        >
                          {step.label}
                        </div>
                      </div>
                    </Timeline.Item>
                  );
                })}
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
                  {selectedShipment.recipientName} –{" "}
                  {selectedShipment.recipientPhone}
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
                <span className="detail-label">Thời gian giao</span>
                <span className="detail-value">
                  {dayjs(selectedShipment.scheduledDateTime).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </span>
              </div>
              {shipmentParcels.map((p, i) => (
                <React.Fragment key={p.id || i}>
                  <Divider />
                  <div className="detail-item">
                    <span className="detail-label">Mã kiện #{i + 1}</span>
                    <span className="detail-value">{p.parcelCode}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Khối lượng</span>
                    <span className="detail-value">{p.weightKg} kg</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Kích thước</span>
                    <span className="detail-value">
                      {p.lengthCm} × {p.widthCm} × {p.heightCm} cm
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phí vận chuyển</span>
                    <span className="detail-value">
                      {formatCurrency(p.shippingFeeVnd)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phí bảo hiểm</span>
                    <span className="detail-value">
                      {formatCurrency(p.insuranceFeeVnd)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tổng phí</span>
                    <span className="detail-value">
                      {formatCurrency(p.priceVnd)}
                    </span>
                  </div>
                  {p.parcelCategory && (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">Loại hàng</span>
                        <span className="detail-value">
                          {p.parcelCategory.categoryName}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Mô tả</span>
                        <span className="detail-value">
                          {p.parcelCategory.description}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Bắt buộc bảo hiểm</span>
                        <span className="detail-value">
                          {p.parcelCategory.isInsuranceRequired
                            ? "Có"
                            : "Không"}
                        </span>
                      </div>
                    </>
                  )}
                </React.Fragment>
              ))}
            </div>
          </Card>

          <Card bordered={false}>
            <Row gutter={16}>
              <Col span={12}>
                <Button
                  type="primary"
                  block
                  onClick={() =>
                    navigate(PATH_NAME.PRINT_ORDER, {
                      state: { trackingCode: selectedShipment.trackingCode },
                    })
                  }
                >
                  In đơn hàng
                </Button>
              </Col>
              <Col span={12}>
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
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TrackingOrder;
