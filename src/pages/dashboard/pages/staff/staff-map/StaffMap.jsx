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

  const fetchLivePosition = async () => {
  try {
    const res = await api.get(`/train/${trainId}/position`);
    const {
      latitude,
      longitude,
      path,
      fromStation,
      toStation,
      additionalData
    } = res.data;

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
      intervalRef.current = setInterval(fetchLivePosition, 2000);
    } catch (err) {
      console.error("Lỗi khi load train info:", err);
    }
  };

  fetchTrainCode();

  return () => clearInterval(intervalRef.current);
}, [trainId]);


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
  return (
    <div className="staff-map-container">
      <Button
        onClick={() => navigate(-1)}
      >
        ← Quay lại
      </Button>

      <Title
        level={3}
        style={{ textAlign: "center", marginTop: 16 }}
      >
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

            {fullPathSegments.map((segment, index) => (
              <React.Fragment key={index}>
                <Polyline
                  positions={segment.polyline.map((p) => [p.latitude, p.longitude])}
                  color={segment.status ? "gray" : "blue"}
                  
                />
                {segment.polyline.length > 0 && (
                  <>
                    <Marker
                      position={[
                        segment.polyline[0].latitude,
                        segment.polyline[0].longitude,
                      ]}
                      icon={locationIcon}
                    >
                      <Popup>{segment.fromStation}</Popup>
                    </Marker>
                    <Marker
                      position={[
                        segment.polyline[segment.polyline.length - 1].latitude,
                        segment.polyline[segment.polyline.length - 1].longitude,
                      ]}
                      icon={locationIcon}
                    >
                      <Popup>{segment.toStation}</Popup>
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
        )}
      </div>
    </div>
  );
}

export default StaffMap;
