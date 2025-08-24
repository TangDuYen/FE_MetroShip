import "./Tracking.scss";
import "react-vertical-timeline-component/style.min.css";

import {
  Alert,
  Button,
  Col,
  Descriptions,
  Input,
  Row,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { FaShippingFast, FaTimesCircle } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import {
  shipmentStatusColorMap,
  shipmentStatusMap,
} from "../../constants/statusMap";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/features/counterSlice";

import { Link } from "react-router-dom";
import { PATH_NAME } from "../../constants/pathname";
import { getAllShipments } from "../../config/metroApi";
import { toast } from "react-toastify";

const { Title, Text } = Typography;
function Tracking() {
  const [shipments, setShipments] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [code, setTrackingCode] = useState("");
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const user = useSelector(selectUser);

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
      <div className="tracking-search">
        <Title level={2}>Tra cứu vận đơn</Title>
        <Row justify="center">
          <Col xs={24} sm={18} md={12} lg={10} xl={8}>
            <Input.Search
              placeholder="Nhập mã vận đơn (VD: MSHCMC123)"
              value={code}
              onChange={(e) => setTrackingCode(e.target.value)}
              onSearch={handleSearch}
              enterButton="Tra cứu"
              size="large"
            />
          </Col>
        </Row>
      </div>

      {hasSearched && result === null && code.trim() !== "" && (
        <Alert
          type="error"
          showIcon
          message="Không tìm thấy vận đơn"
          description={
            <>
              Mã <strong>{code}</strong> không tồn tại trong hệ thống. Vui lòng
              kiểm tra lại và thử lại!
            </>
          }
          icon={<FaTimesCircle />}
          style={{ maxWidth: 600, margin: "0 auto 2rem" }}
        />
      )}

      {result && (
        <div className="tracking-info">
          <Title level={4} style={{ textAlign: "center" }}>
            THÔNG TIN VẬN ĐƠN
          </Title>

          <Descriptions
            bordered
            column={2}
            size="middle"
            style={{ marginBottom: 24 }}
            className="custom-label-bold"
          >
            <Descriptions.Item label="Mã phiếu gửi">
              {result.trackingCode}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={shipmentStatusColorMap[result.shipmentStatus]}>
                {shipmentStatusMap[result.shipmentStatus] || "Không xác định"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Điểm đi">
              {result.departureStationName}
            </Descriptions.Item>
            <Descriptions.Item label="Điểm đến">
              {result.destinationStationName}
            </Descriptions.Item>
            <Descriptions.Item label="Người gửi">
              {result.senderName}
            </Descriptions.Item>
            <Descriptions.Item label="Người nhận">
              {result.recipientName}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày gửi">
              {new Date(result.scheduledDateTime).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item>
              {user ? (
                <Link
                  to={PATH_NAME.TRACKING_ORDER.replace(
                    ":trackingCode",
                    result.trackingCode
                  )}
                >
                  <Button type="primary">Xem chi tiết</Button>
                </Link>
              ) : (
                <Button
                  type="primary"
                  onClick={() =>
                    toast.info("Bạn cần đăng nhập để xem chi tiết!")
                  }
                >
                  Xem chi tiết
                </Button>
              )}
            </Descriptions.Item>
          </Descriptions>

          {/* <Link to={`${PATH_NAME.TRACKING_ORDER}/${result.trackingCode}`} className="detail-btn">
              Xem chi tiết
            </Link> */}

          {/* {Array.isArray(result.history) && result.history.length > 0 ? (
            <Timeline style={{ marginTop: 24 }}>
              {result.history.map((item, idx) => (
                <Timeline.Item
                  key={idx}
                  color={item.cancelled ? "red" : "blue"}
                  dot={item.cancelled ? <FaTimesCircle /> : <FaShippingFast />}
                >
                  <Text strong>{item.status}</Text> <br />
                  <Text type="secondary">{item.time}</Text>
                  {item.detail && <div>{item.detail}</div>}
                  {item.location && <div>{item.location}</div>}
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <Alert
              message="Không có lịch sử vận đơn"
              type="info"
              showIcon
              style={{ maxWidth: 600, margin: "0 auto" }}
            />
          )} */}

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
