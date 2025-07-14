// import React, { useEffect, useState } from "react";
// import "./TestMap.scss";
// import L from "leaflet";
// import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
// import { useSelector } from "react-redux";
// import { selectUser } from "../../redux/features/counterSlice";
// import { useParams } from "react-router-dom";

// function TestMap() {
//   const user = useSelector(selectUser);
//   const {trackingCode} = useParams();
//   const startPoint = [10.762622, 106.660172]; // Ví dụ: Bến Thành
//   const endPoint = [10.851016, 106.626776]; // Ví dụ: Suối Tiên
//   const [position, setPosition] = useState(startPoint);
//   const [index, setIndex] = useState(0);

//   // Tính tuyến đường di chuyển (đơn giản hóa thành tuyến thẳng)
//   const route = [];
//   const steps = 100;

//   for (let i = 0; i <= steps; i++) {
//     const lat = startPoint[0] + ((endPoint[0] - startPoint[0]) * i) / steps;
//     const lng = startPoint[1] + ((endPoint[1] - startPoint[1]) * i) / steps;
//     route.push([lat, lng]);
//   }

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setIndex((prevIndex) => {
//         if (prevIndex >= steps) return steps;
//         setPosition(route[prevIndex + 1]);
//         return prevIndex + 1;
//       });
//     }, 100); // Thời gian cập nhật (ms)
//     return () => clearInterval(interval);
//   }, []);

//   const metroIcon = new L.Icon({
//     iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61205.png",
//     iconSize: [30, 30],
//   });

//   return (
//     <MapContainer
//       center={startPoint}
//       zoom={13}
//       scrollWheelZoom={true}
//       className="map"
//     >
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution="&copy; OpenStreetMap contributors"
//       />

//       {/* Điểm đầu và cuối */}
//       <Marker position={startPoint}></Marker>
//       <Marker position={endPoint}></Marker>

//       {/* Polyline tuyến đường */}
//       <Polyline positions={[startPoint, endPoint]} color="blue" />

//       {/* Marker di chuyển */}
//       <Marker position={position} icon={metroIcon}></Marker>
//     </MapContainer>
//   );
// }

// export default TestMap;

import React, { useEffect, useState } from "react";
import "./TestMap.scss";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Popup,
} from "react-leaflet";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/features/counterSlice";
import { useParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import metro from "../../assets/metro_station.png";
import axios from "axios";

function TestMap() {
  const user = useSelector(selectUser);
  const { trackingCode } = useParams();

  // Danh sách các ga metro
  // const stations = [
  //   { name: "Bến Thành", coords: [10.762622, 106.660172] },
  //   { name: "Ga 1", coords: [10.774, 106.654] },
  //   { name: "Ga 2", coords: [10.786, 106.650] },
  //   { name: "Ga 3", coords: [10.800, 106.640] },
  //   { name: "Suối Tiên", coords: [10.851016, 106.626776] },
  // ];
  const [stations, setStations] = useState([]);
  const [durations, setDurations] = useState([]);

  const [position, setPosition] = useState(null);
  const [stationIndex, setStationIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // const [isArrived, setIsArrived] = useState(false);
  const steps = 100;

  const metroIcon = new L.Icon({
    iconUrl: metro,
    iconSize: [30, 30],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shipmentRes = await axios.get(
          `https://localhost:7085/api/shipments/${trackingCode}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        const itineraries = shipmentRes.data.data.shipmentItineraries;

        // Tạo danh sách stationId theo thứ tự tuyến
        const stationIds = [];
        for (let i = 0; i < itineraries.length; i++) {
          const { route } = itineraries[i];
          const { fromStationId, toStationId } = route || {};
          if (i === 0 && fromStationId) stationIds.push(fromStationId);
          if (toStationId) stationIds.push(toStationId);

          console.log("Itinerary:", itineraries[i]);
          console.log("from:", fromStationId, "to:", toStationId);
        }
        console.log("stationIds:", stationIds);

        // Loại bỏ duplicate nếu có
        const uniqueStationIds = [...new Set(stationIds)];

        // Lấy tọa độ các ga
        const coordRes = await Promise.all(
          uniqueStationIds.map((id) =>
            axios.get(`https://localhost:7085/api/stations/${id}`, {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            })
          )
        );

        const coords = coordRes.map((res) => ({
          name: res.data.stationNameVi,
          coords: [res.data.latitude, res.data.longitude],
        }));

        setStations(coords);
        setPosition(coords[0].coords); // bắt đầu di chuyển từ ga đầu tiên

        const durationsMs = itineraries.map((item) => {
          return (item.travelTimeMin || 1) * 60 * 1000; // fallback 1 phút nếu thiếu
        });

        setDurations(durationsMs);
      } catch (error) {
        console.error("Lỗi khi fetch shipment hoặc station: ", error);
      }
    };

    fetchData();
  }, [trackingCode]);

  useEffect(() => {
  if (stationIndex >= stations.length - 1 || isPaused || stations.length < 2)
    return;

  const from = stations[stationIndex].coords;
  const to = stations[stationIndex + 1].coords;
  const durationMs = durations[stationIndex] || 60000;

  const latStep = (to[0] - from[0]) / steps;
  const lngStep = (to[1] - from[1]) / steps;
  let step = 0;

  const interval = setInterval(() => {
    step++;
    const newLat = from[0] + latStep * step;
    const newLng = from[1] + lngStep * step;

    console.log("🚄 Vị trí tàu:", newLat, newLng); // DEBUG
    setPosition([newLat, newLng]); // <- Đảm bảo array mới

    if (step >= steps) {
      clearInterval(interval);
      setPosition([...to]); // <- array mới cho Marker render lại
      setIsPaused(true);
    }
  }, durationMs / steps);

  return () => clearInterval(interval);
}, [stationIndex, isPaused, stations, durations]);


  // useEffect(() => {
  //   if (stations.length < 2 || durations.length === 0) return;

  //   let currentLeg = 0;
  //   let step = 0;

  //   const animateSegment = (from, to, durationMs) => {
  //     const steps = 100;
  //     const intervalTime = durationMs / steps;
  //     const latStep = (to[0] - from[0]) / steps;
  //     const lngStep = (to[1] - from[1]) / steps;

  //     const interval = setInterval(() => {
  //       step++;
  //       const newLat = from[0] + latStep * step;
  //       const newLng = from[1] + lngStep * step;
  //       setPosition([newLat, newLng]);

  //       if (step >= steps) {
  //         clearInterval(interval);
  //         step = 0;
  //         currentLeg++;
  //         if (currentLeg < stations.length - 1) {
  //           animateSegment(
  //             stations[currentLeg],
  //             stations[currentLeg + 1],
  //             durations[currentLeg]
  //           );
  //         }
  //       }
  //     }, intervalTime);
  //   };

  //   animateSegment(stations[0], stations[1], durations[0]);
  // }, [stations, durations]);

  const handleContinue = () => {
    setStationIndex((prev) => prev + 1);
    setIsPaused(false);
  };

  if (!position || stations.length === 0) return <div>Đang tải bản đồ...</div>;
  // // Tính route toàn bộ tuyến đường (dạng polyline mượt)
  // const buildRoute = (coords) => {
  //   const route = [];
  //   for (let i = 0; i < coords.length - 1; i++) {
  //     const [startLat, startLng] = coords[i];
  //     const [endLat, endLng] = coords[i + 1];
  //     for (let j = 0; j <= steps; j++) {
  //       const lat = startLat + ((endLat - startLat) * j) / steps;
  //       const lng = startLng + ((endLng - startLng) * j) / steps;
  //       route.push([lat, lng]);
  //     }
  //   }
  //   return route;
  // };

  // const fullRoute = stations.length > 1 ? buildRoute(stations) : [];

  // // Di chuyển marker dọc tuyến
  // useEffect(() => {
  //   if (fullRoute.length === 0) return;
  //   const interval = setInterval(() => {
  //     setStationIndex((prev) => {
  //       const nextIndex = prev + 1;
  //       if (nextIndex >= fullRoute.length) {
  //         clearInterval(interval);
  //         return prev;
  //       }
  //       setPosition(fullRoute[nextIndex]);
  //       return nextIndex;
  //     });
  //   }, 100);
  //   return () => clearInterval(interval);
  // }, [fullRoute]);

  // if (!position || stations.length === 0) return <div>Đang tải bản đồ...</div>;

  // useEffect(() => {
  //   if (stationIndex >= stations.length - 1 || isPaused || isArrived) return;

  //   const nextStation = stations[stationIndex + 1];
  //   const current = stations[stationIndex].coords;
  //   const target = nextStation.coords;

  //   const steps = 100;
  //   let stepIndex = 0;

  //   const latStep = (target[0] - current[0]) / steps;
  //   const lngStep = (target[1] - current[1]) / steps;

  //   const interval = setInterval(() => {
  //     stepIndex++;
  //     const newLat = current[0] + latStep * stepIndex;
  //     const newLng = current[1] + lngStep * stepIndex;
  //     setPosition([newLat, newLng]);

  //     // Nếu đã đến ga tiếp theo
  //     if (stepIndex >= steps) {
  //       clearInterval(interval);
  //       setPosition(target);
  //       setStationIndex((prev) => prev + 1);
  //       setIsPaused(true);       // Chờ xác nhận mới tiếp tục
  //       setIsArrived(true);      // Đã đến ga
  //     }
  //   }, 100); // 100ms per step

  //   return () => clearInterval(interval);
  // }, [stationIndex, isPaused]);

  // Khi staff nhấn tiếp tục
  // const handleContinue = () => {
  //   setIsPaused(false);
  //   setIsArrived(false);
  // };

  return (
    <div className="map-container">
      <MapContainer
        center={stations[0].coords}
        zoom={13}
        scrollWheelZoom={true}
        className="map"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Marker cho tất cả các ga */}
        {stations.map((pos, i) => (
          <Marker key={i} position={pos.coords}>
            <Popup>{pos.name}</Popup>
          </Marker>
        ))}

        {/* Tuyến đường Polyline */}
        <Polyline positions={stations.map((s) => s.coords)} color="blue" />

        {/* Marker tàu di chuyển */}
        <Marker position={position} icon={metroIcon}>
          <Popup>Tàu Metro</Popup>
        </Marker>
      </MapContainer>

      {/* Nếu đến ga và là nhân viên nhà ga => hiện nút xác nhận */}

      {/* <div className="control-panel">
          <h3>Ga hiện tại: {stations[stationIndex].name}</h3>
          <button onClick={handleContinue}>Tiếp tục hành trình</button>
        </div> */}

      <div className="control-panel">
        <h3>
          {isPaused && stationIndex < stations.length
            ? `Đã đến ga: ${stations[stationIndex + 1]?.name}`
            : `Tàu đang di chuyển...`}
        </h3>
        {isPaused && stationIndex < stations.length - 1 && (
          <button onClick={handleContinue}>Tiếp tục hành trình</button>
        )}
      </div>
    </div>
  );
}

export default TestMap;
