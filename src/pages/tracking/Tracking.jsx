import "./Tracking.scss";
import "react-vertical-timeline-component/style.min.css";

import { FaShippingFast, FaTimesCircle } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";

import { getAllShipments } from "../../config/metroApi";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { PATH_NAME } from "../../constants/pathname";

function Tracking() {
  // const trackingShipment = {
  //   MS12345: {
  //     code: "12345",
  //     weight: 111,
  //     service: "VQN Quốc tế nhanh",
  //     status: "Đã huỷ",
  //     sender: "O****** - TP.Hà Nội - Q.Hoàn Kiếm",
  //     receiver: "1****** - Gabon, 111, 111",
  //     createdAt: "14/02/2025",
  //     estimatedReceive: "14/02/2025",
  //     estimatedDelivery: "",
  //     history: [
  //       {
  //         status: "Đã huỷ",
  //         time: "14/02/2025 08:53:40",
  //         detail: "Khách hàng huỷ đơn - Lý do: Đơn trùng",
  //         location: "Giao Bưu cục nhận: Bưu cục Lý Thái Tổ - HNI - 84985906116",
  //         cancelled: true,
  //       },
  //       {
  //         status: "Tạo đơn hàng",
  //         time: "14/02/2025 08:53:13",
  //         location: "Q.Hoàn Kiếm - TP.Hà Nội",
  //         cancelled: false,
  //       },
  //     ],
  //   },
  //   MS24680: {
  //     code: "24680",
  //     weight: 210,
  //     service: "VQM Nội địa",
  //     status: "Đang giao",
  //     sender: "Nguyễn Văn A - Hà Nội",
  //     receiver: "Trần Thị B - TP.HCM",
  //     createdAt: "12/02/2025",
  //     estimatedReceive: "13/02/2025",
  //     estimatedDelivery: "15/02/2025",
  //     history: [
  //       {
  //         status: "Đang giao hàng",
  //         time: "13/02/2025 14:00",
  //         detail: "Shipper đang giao hàng tại Quận 1",
  //         cancelled: false,
  //       },
  //       {
  //         status: "Đã xuất kho",
  //         time: "12/02/2025 18:20",
  //         location: "Kho Hà Nội",
  //         cancelled: false,
  //       },
  //     ],
  //   },
  //   MS99999: {
  //     code: "99999",
  //     weight: 500,
  //     service: "VQN Quốc tế tiêu chuẩn",
  //     status: "Đã giao",
  //     sender: "Lê Văn C - Hải Phòng",
  //     receiver: "Hoàng D - Paris, France",
  //     createdAt: "10/02/2025",
  //     estimatedReceive: "11/02/2025",
  //     estimatedDelivery: "14/02/2025",
  //     history: [
  //       {
  //         status: "Đã giao hàng",
  //         time: "14/02/2025 11:00",
  //         detail: "Người nhận: Hoàng D",
  //         cancelled: false,
  //       },
  //       {
  //         status: "Đang vận chuyển quốc tế",
  //         time: "11/02/2025 09:00",
  //         location: "Sân bay Nội Bài",
  //         cancelled: false,
  //       },
  //     ],
  //   },
  // };

  const [shipments, setShipments] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [code, setTrackingCode] = useState("");
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchDataShipment = async () => {
      try {
        const res = await getAllShipments();
        setShipments(res.items || []);
        setStatuses(res.additionalData || []);
      } catch (err) {
        toast.error("Không thể tải danh sách vận đơn");
      }
    };
    fetchDataShipment();
  }, []);

  const handleSearch = () => {
    setHasSearched(true);
    const found = shipments.find(
      (s) => s.trackingCode?.trim().toLowerCase() === code.trim().toLowerCase()
    );

    setResult(found || null);
  };
  return (
    <div className="tracking-container">
      <h1>Tra cứu vận đơn</h1>
      <div className="tracking-search">
        <input
          type="text"
          placeholder="Nhập mã vận đơn (VD: MSHCMC123)"
          value={code}
          onChange={(e) => setTrackingCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch}>Tra cứu</button>
      </div>

      {hasSearched && result === null && code.trim() !== "" && (
        <div className="not-found-box">
          <FaTimesCircle className="icon" />
          <div>
            <h3>Không tìm thấy vận đơn</h3>
            <p>
              Mã <strong>{code}</strong> không tồn tại trong hệ thống. Vui lòng
              kiểm tra lại và thử lại!
            </p>
          </div>
        </div>
      )}

      {result && (
        <div className="tracking-info">
          <h2>THÔNG TIN VẬN ĐƠN</h2>
          <div className="info-grid">
            <div>
              <strong>Mã phiếu gửi:</strong> {result.trackingCode}
            </div>
            <div>
              <strong>Trạng thái:</strong>{" "}
              {statuses.find((s) => s.id === result.shipmentStatus)?.value ||
                "Không xác định"}
            </div>
            <div>
              <strong>Điểm đi:</strong> {result.departureStationName}
            </div>
            <div>
              <strong>Điểm đến:</strong> {result.destinationStationName}
            </div>

            <div>
              <strong>Người gửi:</strong> {result.senderName}
            </div>
            <div>
              <strong>Người nhận:</strong> {result.recipientName}
            </div>
            <div>
              <strong>Ngày gửi:</strong>{" "}
              {new Date(result.scheduledDateTime).toLocaleString()}
            </div>
            <Link to={`/test/${result.trackingCode}`} className="detail-btn">
              Xem chi tiết
            </Link>
            {/* <Link to={`${PATH_NAME.TRACKING_ORDER}/${result.trackingCode}`} className="detail-btn">
              Xem chi tiết
            </Link> */}
          </div>
          {/* <div>
              <strong>Ngày nhận hàng dự kiến:</strong> {result.estimatedReceive}
            </div>
            <div>
              <strong>Ngày giao hàng dự kiến:</strong>{" "}
              {result.estimatedDelivery || "—"}
            </div> */}

          {/* <div className="tracking-history">
            {result.history.map((item, idx) => (
              <div
                className={`history-item ${item.cancelled ? "cancelled" : ""}`}
                key={idx}
              >
                <div className="title">{item.status}</div>
                <p>{item.time}</p>
                {item.detail && <p>{item.detail}</p>}
                {item.location && <p>{item.location}</p>}
              </div>
            ))}
          </div> */}
          {/* {Array.isArray(result.history) && result.history.length > 0 ? (
            <VerticalTimeline>
              {result.history.map((item, idx) => (
                <VerticalTimelineElement
                  key={idx}
                  date={item.time}
                  iconStyle={{
                    background: item.cancelled ? "#dc3545" : "#007bff",
                    color: "#fff",
                  }}
                  icon={item.cancelled ? <FaTimesCircle /> : <FaShippingFast />}
                >
                  <h4 className={item.cancelled ? "text-danger" : ""}>
                    {item.status}
                  </h4>
                  {item.detail && <p>{item.detail}</p>}
                  {item.location && <p>{item.location}</p>}
                </VerticalTimelineElement>
              ))}
            </VerticalTimeline>
          ) : (
            <div className="no-history">
              <p>Không có lịch sử vận đơn.</p>
            </div>
          )} */}
        </div>
      )}
    </div>
  );
}

export default Tracking;
