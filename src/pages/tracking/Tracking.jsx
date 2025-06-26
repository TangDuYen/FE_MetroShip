import React, { useState } from "react";
import "./Tracking.scss";
import "react-vertical-timeline-component/style.min.css";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { FaShippingFast, FaTimesCircle } from "react-icons/fa";
function Tracking() {
  const trackingShipment = {
    MS12345: {
      code: "12345",
      weight: 111,
      service: "VQN Quốc tế nhanh",
      status: "Đã huỷ",
      sender: "O****** - TP.Hà Nội - Q.Hoàn Kiếm",
      receiver: "1****** - Gabon, 111, 111",
      createdAt: "14/02/2025",
      estimatedReceive: "14/02/2025",
      estimatedDelivery: "",
      history: [
        {
          status: "Đã huỷ",
          time: "14/02/2025 08:53:40",
          detail: "Khách hàng huỷ đơn - Lý do: Đơn trùng",
          location: "Giao Bưu cục nhận: Bưu cục Lý Thái Tổ - HNI - 84985906116",
          cancelled: true,
        },
        {
          status: "Tạo đơn hàng",
          time: "14/02/2025 08:53:13",
          location: "Q.Hoàn Kiếm - TP.Hà Nội",
          cancelled: false,
        },
      ],
    },
    MS24680: {
      code: "24680",
      weight: 210,
      service: "VQM Nội địa",
      status: "Đang giao",
      sender: "Nguyễn Văn A - Hà Nội",
      receiver: "Trần Thị B - TP.HCM",
      createdAt: "12/02/2025",
      estimatedReceive: "13/02/2025",
      estimatedDelivery: "15/02/2025",
      history: [
        {
          status: "Đang giao hàng",
          time: "13/02/2025 14:00",
          detail: "Shipper đang giao hàng tại Quận 1",
          cancelled: false,
        },
        {
          status: "Đã xuất kho",
          time: "12/02/2025 18:20",
          location: "Kho Hà Nội",
          cancelled: false,
        },
      ],
    },
    MS99999: {
      code: "99999",
      weight: 500,
      service: "VQN Quốc tế tiêu chuẩn",
      status: "Đã giao",
      sender: "Lê Văn C - Hải Phòng",
      receiver: "Hoàng D - Paris, France",
      createdAt: "10/02/2025",
      estimatedReceive: "11/02/2025",
      estimatedDelivery: "14/02/2025",
      history: [
        {
          status: "Đã giao hàng",
          time: "14/02/2025 11:00",
          detail: "Người nhận: Hoàng D",
          cancelled: false,
        },
        {
          status: "Đang vận chuyển quốc tế",
          time: "11/02/2025 09:00",
          location: "Sân bay Nội Bài",
          cancelled: false,
        },
      ],
    },
  };

  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);

  const handleSearch = () => {
    const res = trackingShipment[code.trim()];
    setResult(res || null);
  };
  return (
    <div className="tracking-container">
      <h1>Tra cứu vận đơn</h1>
      <div className="tracking-search">
        <input
          type="text"
          placeholder="Nhập mã vận đơn (VD: MS12345)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button onClick={handleSearch}>Tra cứu</button>
      </div>

      {result && (
        <div className="tracking-info">
          <h2>THÔNG TIN VẬN ĐƠN</h2>
          <div className="info-grid">
            <div>
              <strong>Mã phiếu gửi:</strong> {result.code}
            </div>
            <div>
              <strong>Khối lượng (Gram):</strong> {result.weight}
            </div>
            <div>
              <strong>Dịch vụ:</strong> {result.service}
            </div>
            <div>
              <strong>Trạng thái:</strong>{" "}
              <span className={result.status === "Đã huỷ" ? "cancelled" : ""}>
                {result.status}
              </span>
            </div>
            <div>
              <strong>Người gửi:</strong> {result.sender}
            </div>
            <div>
              <strong>Người nhận:</strong> {result.receiver}
            </div>
            <div>
              <strong>Ngày tạo:</strong> {result.createdAt}
            </div>
            <div>
              <strong>Ngày nhận hàng dự kiến:</strong> {result.estimatedReceive}
            </div>
            <div>
              <strong>Ngày giao hàng dự kiến:</strong>{" "}
              {result.estimatedDelivery || "—"}
            </div>
          </div>

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
                <h4 className={item.cancelled ? "text-danger" : ""}>{item.status}</h4>
                {item.detail && <p>{item.detail}</p>}
                {item.location && <p>{item.location}</p>}
              </VerticalTimelineElement>
            ))}
          </VerticalTimeline>
        </div>
      )}
    </div>
  );
}

export default Tracking;
