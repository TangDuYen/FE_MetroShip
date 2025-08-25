import "./TrackingOrder.scss";
import "leaflet/dist/leaflet.css";

import { Badge, Button, Card, Col, Divider, Row, Tag, Timeline } from "antd";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import React, { useEffect, useRef, useState } from "react";
import {
  formatCurrency,
  parcelStatusColorMap,
  parcelStatusMap,
  shipmentStatusMap,
  shipmentStatusSteps,
} from "../../constants/statusMap";

import L from "leaflet";
import { PATH_NAME } from "../../constants/pathname";
import api from "../../config/axios";
import axios from "axios";
import dayjs from "dayjs";
import { getAllParcelCategories } from "../../config/metroApi";
import locationIconImg from "../../assets/placeholder.webp";
import metro from "../../assets/metro_station.png";
import startStation from "../../assets/train.webp";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

function ResizeMapOnShow() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
  }, [map]);
  return null;
}

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position[0] !== 0) {
      map.setView(position);
    }
  }, [position, map]);
  return null;
}


const locationIcon = new L.Icon({
  iconUrl: locationIconImg,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const startMetro = L.icon({
  iconUrl: startStation,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
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
  const lastDataRef = useRef(null); // lưu lần fetch trước
  const [intervalTime, setIntervalTime] = useState(2000);

  const fetchData = async () => {
    try {
      const shipmentRes = await api.get(`/shipments/${trackingCode}`);
      const shipment = shipmentRes.data.data;
      setSelectedShipment(shipment);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
  };

  useEffect(() => {
    if (!trackingCode) return;
    fetchData();
  }, [trackingCode]);

  const fetchLivePosition = async () => {
    try {
      const res = await api.get(`/${trackingCode}/position`);
      const {
        latitude,
        longitude,
        path,
        fromStation,
        toStation,
        trainCode,
        additionalData,
      } = res.data;

      const newData = {
        latitude,
        longitude,
        path,
        fromStation,
        toStation,
        trainCode,
        additionalData,
      };

      if (JSON.stringify(newData) !== JSON.stringify(lastDataRef.current)) {
        setPosition([latitude, longitude]);
        setFromStation(fromStation);
        setToStation(toStation);
        setTrainCode(trainCode || ""); // có thì set, không thì để rỗng

        if (path && Array.isArray(path)) {
          setPath(path.map((p) => [p.latitude, p.longitude]));
        }

        const fullPath = additionalData?.shipment?.fullPath || [];
        if (Array.isArray(fullPath)) {
          setFullPathSegments(fullPath);
        }

        // lưu dữ liệu để lần sau so sánh
        lastDataRef.current = newData;
        setIntervalTime(2000); // có thay đổi → fetch nhanh
      } else {
        setIntervalTime(5000); // không đổi → fetch chậm
      }

      setLoading(false);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu tàu:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedShipment) return;

    if (selectedShipment.shipmentStatus === 9) {
      fetchLivePosition();
    } else {
      // reset map khi chưa đến trạng thái 10
      setPosition([0, 0]);
      setPath([]);
      setFullPathSegments([]);
    }
  }, [selectedShipment]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (selectedShipment?.shipmentStatus === 9 && intervalTime) {
      intervalRef.current = setInterval(fetchLivePosition, intervalTime);
    }

    return () => clearInterval(intervalRef.current);
  }, [intervalTime, selectedShipment]);

  const getCurrentSegmentIndex = (position, segments) => {
    if (!segments.length) return 0;
    let minIndex = 0;
    let minDist = Infinity;

    segments.forEach((seg, i) => {
      seg.polyline.forEach((p) => {
        const dist = Math.sqrt(
          Math.pow(p.latitude - position[0], 2) +
          Math.pow(p.longitude - position[1], 2)
        );
        if (dist < minDist) {
          minDist = dist;
          minIndex = i;
        }
      });
    });

    return minIndex;
  };

  const currentSegmentIndex = getCurrentSegmentIndex(
    position,
    fullPathSegments
  );

  if (!selectedShipment) return <div>Đang tải đơn...</div>;

  const currentStatus = selectedShipment.shipmentStatus;
  const shipmentParcels = selectedShipment.parcels || [];

  const handleInsuranceRequest = async (shipmentId) => {
    try {
      const payload = {
        shipmentId,
        subject: "Yêu cầu bồi thường",
        description: "Khách hàng yêu cầu bồi thường vì kiện hàng bị mất.",
        supportType: 1,
      };

      const res = await api.post("/support-tickets", payload);

      if (res.status === 200 || res.status === 201) {
        toast.success("Yêu cầu bồi thường đã được gửi thành công!");
        fetchData();
      } else {
        toast.error("Không thể gửi yêu cầu bồi thường. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error(
        "Lỗi khi gửi yêu cầu bồi thường: ",
        error.response.data.message
      );
      toast.error("Gửi yêu cầu thất bại: " + error.response.data.message);
    }
  };

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
              <RecenterMap position={position} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {fullPathSegments.map((segment, index) => {
                if (!segment.polyline?.length) return null;

                const pts = segment.polyline.map((p) => [
                  p.latitude,
                  p.longitude,
                ]);

                // Segment trước đoạn hiện tại => xám
                if (index < currentSegmentIndex) {
                  return (
                    <Polyline
                      key={index}
                      positions={pts}
                      color="gray"
                      weight={5}
                    />
                  );
                }

                // Segment sau đoạn hiện tại => xanh
                if (index > currentSegmentIndex) {
                  return (
                    <Polyline
                      key={index}
                      positions={pts}
                      color="blue"
                      weight={5}
                    />
                  );
                }

                // Segment hiện tại => tách đôi (xám + xanh)
                let nearestIdx = 0;
                let minDist = Infinity;
                segment.polyline.forEach((p, i) => {
                  const dist =
                    Math.pow(p.latitude - position[0], 2) +
                    Math.pow(p.longitude - position[1], 2);
                  if (dist < minDist) {
                    minDist = dist;
                    nearestIdx = i;
                  }
                });
                return (
                  <React.Fragment key={index}>
                    {nearestIdx > 0 && (
                      <Polyline
                        positions={pts.slice(0, nearestIdx + 1)}
                        color="gray"
                        weight={5}
                      />
                    )}
                    <Polyline
                      positions={pts.slice(nearestIdx)}
                      color="blue"
                      weight={5}
                    />
                  </React.Fragment>
                );
              })}

              {(() => {
                const allStations = [];
                fullPathSegments.forEach((segment, index) => {
                  if (index === 0) {
                    allStations.push({
                      name: segment.from.name,
                      lat: segment.from.latitude,
                      lng: segment.from.longitude,
                      type: "start",
                    });
                  }
                  if (index === fullPathSegments.length - 1) {
                    allStations.push({
                      name: segment.to.name,
                      lat: segment.to.latitude,
                      lng: segment.to.longitude,
                      type: "end",
                    });
                  } else {
                    allStations.push({
                      name: segment.to.name,
                      lat: segment.to.latitude,
                      lng: segment.to.longitude,
                      type: "middle",
                    });
                  }
                });
                return allStations.map((station, idx) => (
                  <Marker
                    key={idx}
                    position={[station.lat, station.lng]}
                    icon={
                      station.type === "start"
                        ? startMetro
                        : station.type === "end"
                          ? locationIcon
                          : locationIcon
                    }
                  >
                    <Popup>{station.name}</Popup>
                  </Marker>
                ));
              })()}

              {position[0] !== 0 && (
                <Marker position={position} icon={metroIcon}>
                  <Popup>Shipment hiện tại</Popup>
                </Marker>
              )}
            </MapContainer>
          </Card>

          <Card
            title={
              <Badge
                className={`status-badge ${currentStatus >= 20 ? "delivered" : "in-transit"
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
                { id: 10, label: "Đang giao hàng" },
                { id: 22, label: "Đã giao hàng" },
              ].map((step, idx, arr) => {
                const isLast = idx === arr.length - 1;
                const isCompleted = isLast
                  ? currentStatus === 22 ||
                  currentStatus === 24 ||
                  currentStatus === 26
                  : currentStatus >= step.id;
                const nextStep = arr[idx + 1];
                const isLineCompleted = nextStep
                  ? nextStep.id === 22
                    ? currentStatus === 22 ||
                    currentStatus === 24 ||
                    currentStatus === 26
                    : currentStatus >= nextStep.id
                  : false;
                return (
                  <div key={step.id} className="progress-step">
                    <div className={`dot ${isCompleted ? "completed" : ""}`}>
                      {isLast && isCompleted ? "" : ""}
                    </div>
                    {!isLast && (
                      <div
                        className={`line ${isLineCompleted ? "completed" : ""}`}
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

          <Card title="Lịch sử đơn hàng" bordered={false}>
            <Timeline>
              {selectedShipment.shipmentTrackings
                .sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))
                .map((track, idx) => (
                  <Timeline.Item
                    key={track.id}
                    color={idx === 0 ? "green" : "gray"}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ color: "#999" }}>
                        {dayjs(track.eventTime).format("DD/MM HH:mm")}
                      </div>
                      <div
                        className={
                          idx === 0
                            ? "timeline-description highlight"
                            : "timeline-description"
                        }
                      >
                        {track.status}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
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
                <span className="detail-label">Trạm gửi</span>
                <span className="detail-value">
                  Trạm {selectedShipment.departureStationName}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Trạm nhận</span>
                <span className="detail-value">
                  Trạm {selectedShipment.destinationStationName}
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
                <span className="detail-label">Hạn chót gửi hàng lúc</span>
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
                  {p.priceVnd !== p.shippingFeeVnd && (
                    <div className="detail-item">
                      <span className="detail-label">Phí bảo hiểm</span>
                      <span className="detail-value">
                        {formatCurrency(p.insuranceFeeVnd)}
                      </span>
                    </div>
                  )}
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
                    </>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Tình trạng</span>
                    <span className="detail-value">
                      <Tag color={parcelStatusColorMap[p.status]}>
                        {parcelStatusMap[p.status]}
                      </Tag>
                    </span>
                  </div>
                  <div className="detail-value">
                    {p.status === 4 &&
                      !selectedShipment.isCompensationRequested && (
                        <Button
                          type="primary"
                          className="insurance-button"
                          onClick={() =>
                            handleInsuranceRequest(selectedShipment.id)
                          }
                        >
                          Yêu cầu bồi thường
                        </Button>
                      )}
                  </div>
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
