import './TrackingOrder.scss';

import { Badge, Button, Card, Divider, Timeline } from 'antd';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import React, { useEffect, useState } from 'react';
import { getAllCustomerShipments, getAllParcels, getAllStations } from '../../config/metroApi';
import { shipmentStatusMap, shipmentStatusSteps } from '../../constants/statusMap';

import { Icon } from 'leaflet';
import { PATH_NAME } from '../../constants/pathname';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

function TrackingOrder() {
  const [shipments, setShipments] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [parcelMap, setParcelMap] = useState(new Map());
  const [selectedShipment, setSelectedShipment] = useState(null);

  const navigate = useNavigate();

  const formatCurrency = (v) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  useEffect(() => {
    Promise.all([getAllCustomerShipments(), getAllParcels(), getAllStations()])
      .then(([shipmentsData, parcelsData, stations]) => {
        setShipments(shipmentsData);
        setParcels(parcelsData);
        if (shipmentsData.length > 0) {
          setSelectedShipment(shipmentsData[0]);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const m = new Map();
    parcels.forEach(p => {
      if (!m.has(p.shipmentId)) m.set(p.shipmentId, []);
      m.get(p.shipmentId).push(p);
    });
    setParcelMap(m);
  }, [parcels]);

  if (!selectedShipment) return <div>Đang tải đơn...</div>;

  const currentStatus = selectedShipment.shipmentStatus;
  const shipmentParcels = parcelMap.get(selectedShipment.id) || [];

  const orderStatuses = [
    { id: 8, label: 'PickedUp' },
    { id: 9, label: 'InTransit' },
    { id: 10, label: 'AwaitingDelivery' },
    { id: 17, label: 'Completed' },
  ];

  const shipmentTimeline = selectedShipment.histories || [];

  return (
    <div className="tracking-order-container">
      <div className="tracking-order-wrapper">
        <div className="left-column">
          <Card style={{ marginTop: '2em', marginBottom: '16px' }}>
            <MapContainer center={[10.762622, 106.660172]} zoom={13} style={{ width: '100%', height: '300px' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[10.762622, 106.660172]} icon={new Icon({ iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png' })}>
                <Popup>
                  Station: {selectedShipment.currentStationName}
                </Popup>
              </Marker>
            </MapContainer>
          </Card>

          <Card title={`Giao vào ${dayjs(selectedShipment.scheduledDateTime).format('DD [Th]MM')}`} bordered={false}>
            <div className="custom-progress">
              {[
                { id: 8, label: 'Đã lấy hàng' },
                { id: 9, label: 'Đang giao hàng' },
                { id: 17, label: 'Đã giao hàng' },
              ].map((step, idx, arr) => {
                const isCompleted = currentStatus >= step.id;
                const isLast = idx === arr.length - 1;
                return (
                  <div key={step.id} className="progress-step">
                    <div className={`dot ${isCompleted ? 'completed' : ''}`}>
                      {isLast && isCompleted ? '✔️' : ''}
                    </div>
                    {!isLast && <div className={`line ${currentStatus >= arr[idx + 1].id ? 'completed' : ''}`} />}
                    <div className={`label ${isCompleted ? 'active' : ''}`}>{step.label}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card bordered={false}>
            <Timeline>
              {shipmentStatusSteps
                .filter((step) => currentStatus >= step.id)
                .reverse()
                .map((step, idx) => {
                  // Giả lập thời gian cho mỗi bước, chỉ bước đầu dùng bookedAt
                  const timestamp = idx === shipmentStatusSteps.length - 1
                    ? dayjs(selectedShipment.bookedAt).format('DD/MM HH:mm')
                    : dayjs().subtract(idx, 'hour').format('DD/MM HH:mm');

                  return (
                    <Timeline.Item key={step.id} color={idx === 0 ? 'green' : 'gray'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div className="timeline-date" style={{ color: '#999' }}>{timestamp}</div>
                        <div className={`timeline-description ${idx === 0 ? 'highlight' : ''}`}>
                          {step.label}
                        </div>
                      </div>
                    </Timeline.Item>
                  );
                })}
            </Timeline>
          </Card>


        </div>

        <div className="right-column" style={{ marginTop: '2em' }}>
          <Card title="Thông tin đơn hàng" bordered={false}>
            <div className="shipment-details">
              <div className="detail-item">
                <span className="detail-label">Tracking Code</span>
                <span className="detail-value">{selectedShipment.trackingCode}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Người gửi</span>
                <span className="detail-value">{selectedShipment.senderName} – {selectedShipment.senderPhone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Người nhận</span>
                <span className="detail-value">{selectedShipment.recipientName} – {selectedShipment.recipientPhone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tổng phí</span>
                <span className="detail-value">{formatCurrency(selectedShipment.totalCostVnd)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Đặt lúc</span>
                <span className="detail-value">{dayjs(selectedShipment.bookedAt).format('DD/MM/YYYY HH:mm')}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Dự kiến giao</span>
                <span className="detail-value">{dayjs(selectedShipment.scheduledDateTime).format('DD/MM/YYYY HH:mm')}</span>
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
                    <span className="detail-value">{p.lengthCm} × {p.widthCm} × {p.heightCm} cm</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phí vận chuyển</span>
                    <span className="detail-value">{formatCurrency(p.shippingFeeVnd)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phí bảo hiểm</span>
                    <span className="detail-value">{formatCurrency(p.insuranceFeeVnd)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tổng phí</span>
                    <span className="detail-value">{formatCurrency(p.priceVnd)}</span>
                  </div>
                  {p.parcelCategory && (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">Loại hàng</span>
                        <span className="detail-value">{p.parcelCategory.categoryName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Mô tả</span>
                        <span className="detail-value">{p.parcelCategory.description}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Bắt buộc bảo hiểm</span>
                        <span className="detail-value">{p.parcelCategory.isInsuranceRequired ? 'Có' : 'Không'}</span>
                      </div>
                    </>
                  )}
                </React.Fragment>
              ))}
            </div>
          </Card>
          <Card title="Trạng thái" bordered={false}>
            <Badge className={`status-badge ${currentStatus >= 17 ? 'delivered' : 'in-transit'}`}>
              {shipmentStatusMap[selectedShipment.shipmentStatus] || 'Không rõ trạng thái'}
            </Badge>
          </Card>

          <Card bordered={false}>
            <Button type="primary" block onClick={() => navigate(PATH_NAME.PRINT_ORDER, {
              state: { trackingCode: selectedShipment.trackingCode }
            })}>
              In đơn hàng
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TrackingOrder;
