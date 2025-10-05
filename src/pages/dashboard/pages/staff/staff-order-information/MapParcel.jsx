import React, { useEffect, useRef, useState } from "react";
import "./OrderInformationStaff.scss";
import locationIconImg from "../../../../../assets/placeholder.webp";
import metro from "../../../../../assets/metro_station.png";
import startStation from "../../../../../assets/train.webp";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../../../../../config/axios";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { Card, Spin } from "antd";
import { useParams } from "react-router-dom";

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

function ResizeMapOnShow({ visible }) {
  const map = useMap();
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }, [visible, map]);
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
function MapParcel({ shipmentId, visible }) {
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [position, setPosition] = useState([0, 0]);
  const [path, setPath] = useState([]);
  const [fullPathSegments, setFullPathSegments] = useState([]);
  const [intervalTime, setIntervalTime] = useState(5000);
  const [loading, setLoading] = useState(true);
  const { trackingCode } = useParams();

  const lastDataRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!shipmentId) return;
    const fetchShipment = async () => {
      try {
        const res = await api.get(`/shipments/${shipmentId}`);
        setSelectedShipment(res.data.data);
      } catch (err) {
        console.error("Lỗi lấy shipment:", err);
      }
    };
    fetchShipment();
  }, [shipmentId]);

  const fetchLivePosition = async () => {
    try {
      const res = await api.get(`/${trackingCode}/position`);
      const { latitude, longitude, path, additionalData } = res.data;

      const newData = { latitude, longitude, path, additionalData };

      if (JSON.stringify(newData) !== JSON.stringify(lastDataRef.current)) {
        setPosition([latitude, longitude]);

        if (path && Array.isArray(path)) {
          setPath(path.map((p) => [p.latitude, p.longitude]));
        }

        const fullPath = additionalData?.shipment?.fullPath || [];
        if (Array.isArray(fullPath)) {
          setFullPathSegments(fullPath);
        }

        lastDataRef.current = newData;
        setIntervalTime(2000);
      } else {
        setIntervalTime(5000);
      }

      setLoading(false);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu position:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedShipment) return;

    if (selectedShipment.shipmentStatus === 9) {
      fetchLivePosition();
    } else {
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
  return (
    <div>
      <MapContainer
        center={position[0] !== 0 ? position : [10.76, 106.7]}
        zoom={13}
        style={{ width: "100%", height: "400px" }}
      >
        <ResizeMapOnShow visible={visible}/>
        <RecenterMap position={position} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {fullPathSegments.map((segment, index) => {
          if (!segment.polyline?.length) return null;

          const pts = segment.polyline.map((p) => [p.latitude, p.longitude]);

          // Segment trước đoạn hiện tại => xám
          if (index < currentSegmentIndex) {
            return (
              <Polyline key={index} positions={pts} color="gray" weight={5} />
            );
          }

          // Segment sau đoạn hiện tại => xanh
          if (index > currentSegmentIndex) {
            return (
              <Polyline key={index} positions={pts} color="blue" weight={5} />
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
    </div>
  );
}

export default MapParcel;
