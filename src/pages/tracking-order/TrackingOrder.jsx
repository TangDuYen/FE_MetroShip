import './TrackingOrder.scss';

import { Badge, Button, Card, Divider, Timeline } from 'antd';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { use, useState } from 'react';

import { Icon } from 'leaflet';
import { PATH_NAME } from '../../constants/pathname';
import { useNavigate } from 'react-router-dom';

// Dữ liệu mẫu
const orderStatuses = [
  { id: 1, label: 'Đã xác nhận', date: '10 Tháng 4', completed: true, summary: 'Đã xác nhận đơn hàng' },
  { id: 2, label: 'Đang vận chuyển', date: '10 Tháng 4', completed: true, summary: 'Đang vận chuyển tới khu vực trung chuyển' },
  { id: 3, label: 'Đang giao hàng', date: '15 Tháng 4', completed: false, summary: 'Đang trên tàu AA - Tuyến XX' },
  { id: 4, label: 'Đã giao hàng', date: '17 Tháng 4', completed: false, summary: 'Giao vào 17 Tháng 4' },
];

const shipmentTimeline = [
  { date: '26 Th06 06:28', description: 'Đơn hàng đã đến trạm giao hàng tại khu vực Phường 13, Quận 4, TP. Hồ Chí Minh và sẽ được giao trong vòng 24 giờ tiếp theo.' },
  { date: '26 Th06 00:24', description: 'Đơn hàng đã rời kho phân loại tới 50-HCM D4 Hub.' },
  { date: '25 Th06 23:16', description: 'Đơn hàng đã đến kho phân loại Xã Tân Phú Trung, Huyện Củ Chi, TP. Hồ Chí Minh.' },
  { date: '25 Th06 23:10', description: 'Đơn hàng đã đến bưu cục.' },
];

function TrackingOrder() {
  const [currentStatus, setCurrentStatus] = useState(4);
  const nav = useNavigate();

  const handleStatusChange = (statusId) => {
    setCurrentStatus(statusId);
  };

  const handleReorder = () => {
    nav(PATH_NAME.BOOKING_ORDER);
  };

  return (
    <div className="tracking-order-container">
      <div className="tracking-order-wrapper">
        {/* Cột bên trái */}
        <div className="left-column">
          <div className="map-container">
            <Card style={{ marginBottom: '16px', marginTop: '2em' }}>
              <div className="map-content">
                <MapContainer center={[10.762622, 106.660172]} zoom={13} style={{ width: '100%', height: '300px' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[10.762622, 106.660172]} icon={new Icon({ iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png' })}>
                    <Popup>
                      Địa chỉ giao hàng: Phường 13, Quận 4, TP. Hồ Chí Minh.
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </Card>

            <Card title={orderStatuses.find(status => status.id === currentStatus)?.summary} bordered={false} style={{ marginBottom: '16px' }}>
            {/* Hiển thị trạng thái tóm tắt với progress bar */}
            <div className="status-summary">
              <Timeline mode="horizontal" style={{ marginBottom: '16px' }}>
                {orderStatuses.map((status) => (
                  <Timeline.Item
                    key={status.id}
                    dot={<div className={`custom-dot ${status.id <= currentStatus ? 'completed' : ''}`} />}
                    color={status.id <= currentStatus ? 'green' : 'gray'}
                  >
                    <div className="status-label">{status.label}</div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </Card>

            {/* Timeline giao hàng */}
            <Card  bordered={false}>
              <div className="timeline">
                <Timeline>
                  {shipmentTimeline.map((entry, index) => (
                    <Timeline.Item key={index} color="blue">
                      <div className="timeline-date">{entry.date}</div>
                      <div className="timeline-description">{entry.description}</div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            </Card>
          </div>
        </div>

        {/* Cột bên phải */}
        <div className="right-column" style={{ marginTop: '2em' }}>
          {/* Thông tin đơn hàng */}
          <Card title="Thông tin đơn hàng" bordered={false}>
            <div className="shipment-details">
              <div className="detail-item">
                <span className="detail-label">Sản phẩm</span>
                <span className="detail-value">All mega 200M & 4P-15 DOHF Filter Set</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Giá</span>
                <span className="detail-value">$183.97</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tổng phụ</span>
                <span className="detail-value">$183.97</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Vận chuyển</span>
                <span className="detail-value">Miễn phí</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Thuế</span>
                <span className="detail-value">$12.88</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tổng cộng</span>
                <span className="detail-value">$196.85</span>
              </div>
            </div>
          </Card>

          {/* Thẻ trạng thái */}
          <Card title="Trạng thái" bordered={false} >
            <Badge className={`status-badge ${currentStatus === 4 ? 'delivered' : 'in-transit'}`}>
              {orderStatuses.find((s) => s.id === currentStatus)?.label}
            </Badge>
          </Card>

          {/* Nút đặt lại đơn hàng */}
          <Card bordered={false}>
            <Button onClick={handleReorder} type="primary" block>
              Đặt lại đơn hàng
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TrackingOrder;