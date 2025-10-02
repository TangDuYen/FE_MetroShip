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
import { getAllShipments, getShipmentGuest } from "../../config/metroApi";
import {
  shipmentStatusColorMap,
  shipmentStatusMap,
} from "../../constants/statusMap";

import { Link } from "react-router-dom";
import { PATH_NAME } from "../../constants/pathname";
import { selectUser } from "../../redux/features/counterSlice";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
function Tracking() {
  const [code, setTrackingCode] = useState("");
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const user = useSelector(selectUser);
  const handleSearch = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      toast.warn("Vui lòng nhập đầy đủ mã vận đơn!");
      return;
    }

    setHasSearched(true);
    try {
      const res = await getShipmentGuest(trimmedCode);
      setResult(res.data || null);
    } catch {
      setResult(null); // Đảm bảo reset khi lỗi
    }
  };
  return (
    <div className="tracking-container">
      <div className="tracking-search">
        <Title level={2}>Tra cứu vận đơn</Title>
        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={14} xl={12}>
            <Input.Search
              placeholder="Nhập mã vận đơn (VD: MSHCMC12345678901A1B)"
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
            {/* <Descriptions.Item label="Ngày gửi">
              {new Date(result.scheduledDateTime).toLocaleString()}
            </Descriptions.Item> */}
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
        </div>
      )}
    </div>
  );
}

export default Tracking;
