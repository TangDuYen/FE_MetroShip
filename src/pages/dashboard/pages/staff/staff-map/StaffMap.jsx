import React, { useEffect, useRef, useState } from "react";
import metro from "../../../../../assets/metro_station.png";
import "./StaffMap.scss";
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
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../../config/axios";
import { Button, Spin, Typography } from "antd";
import { getAllMetroTrains } from "../../../../../config/metroApi";
import locationIconImg from "../../../../../assets/placeholder.webp";
import startStation from "../../../../../assets/train.webp";

function ResizeMapOnShow() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
  }, [map]);
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

const { Title } = Typography;
function StaffMap() {
  const { trainId } = useParams();
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

  const fetchLivePosition = async () => {
    try {
      const res = await api.get(`/train/${trainId}/position`);
      const {
        latitude,
        longitude,
        path,
        fromStation,
        toStation,
        additionalData,
      } = res.data;

      const newData = {
        latitude,
        longitude,
        path,
        fromStation,
        toStation,
        additionalData,
      };

      // so sánh dữ liệu mới với dữ liệu cũ
      if (JSON.stringify(newData) !== JSON.stringify(lastDataRef.current)) {
        setPosition([latitude, longitude]);
        setFromStation(fromStation);
        setToStation(toStation);

        if (path && Array.isArray(path)) {
          setPath(path.map((p) => [p.latitude, p.longitude]));
        }

        // 🔥 Lấy dữ liệu chặng (fullPath)
        const fullPath = additionalData?.fullPath || [];
        if (Array.isArray(fullPath)) {
          setFullPathSegments(fullPath);
        }

        lastDataRef.current = newData;
        setIntervalTime(2000);
      } else {
        setIntervalTime(10000);
      }
      setLoading(false);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu tàu:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTrainCode = async () => {
      try {
        // Gọi lấy danh sách tất cả metro trains
        const metroTrainRes = await getAllMetroTrains();
        const trains = metroTrainRes?.data?.items || [];

        // Tìm trainCode theo trainId
        const matchedTrain = trains.find((t) => t.id === trainId);
        if (matchedTrain) {
          setTrainCode(matchedTrain.trainCode);
        }

        // Bắt đầu fetch vị trí live
        fetchLivePosition();
      } catch (err) {
        console.error("Lỗi khi load train info:", err);
      }
    };

    fetchTrainCode();
  }, [trainId]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (intervalTime) {
      intervalRef.current = setInterval(fetchLivePosition, intervalTime);
    }
    return () => clearInterval(intervalRef.current);
  }, [intervalTime]);

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

  // Tính segment hiện tại
  const currentSegmentIndex = getCurrentSegmentIndex(
    position,
    fullPathSegments
  );

  return (
    <div className="staff-map-container">
      <Button onClick={() => navigate(-1)}>← Quay lại</Button>

      <Title level={3} style={{ textAlign: "center", marginTop: 16 }}>
        Tàu: {trainCode || "Thông tin tàu"}
      </Title>
      <div className="staff-map">
        {loading ? (
          <Spin spinning />
        ) : (
          <MapContainer
            center={position[0] !== 0 ? position : [10.76, 106.7]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <ResizeMapOnShow />
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
              // tìm điểm gần vị trí hiện tại trong đoạn này
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
                // ga bắt đầu
                if (index === 0) {
                  allStations.push({
                    name: segment.fromStation,
                    lat: segment.polyline[0].latitude,
                    lng: segment.polyline[0].longitude,
                    type: "start",
                  });
                }
                // ga cuối
                if (index === fullPathSegments.length - 1) {
                  allStations.push({
                    name: segment.toStation,
                    lat: segment.polyline[segment.polyline.length - 1].latitude,
                    lng: segment.polyline[segment.polyline.length - 1]
                      .longitude,
                    type: "end",
                  });
                } else {
                  // ga trung gian
                  allStations.push({
                    name: segment.toStation,
                    lat: segment.polyline[segment.polyline.length - 1].latitude,
                    lng: segment.polyline[segment.polyline.length - 1]
                      .longitude,
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

            {path.length > 0 && (
              <>
                {/*<Marker position={path[0]} icon={locationIcon}>
                  <Popup>{fromStation || "Ga xuất phát"}</Popup>
                </Marker>*/}
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
        )}
      </div>
    </div>
  );
}

export default StaffMap;
