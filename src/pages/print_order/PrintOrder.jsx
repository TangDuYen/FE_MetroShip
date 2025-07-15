import './PrintOrder.scss';

import { getAllCustomerShipments, getAllParcels } from './../../config/metroApi';
import { useEffect, useState } from 'react';

import { Button } from 'antd';
import api from '../../config/axios';
import dayjs from 'dayjs';
import { shipmentStatusMap } from '../../constants/statusMap';
import { useLocation } from 'react-router-dom';

function PrintOrder() {
  const location = useLocation();
  const [shipment, setShipment] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [parcelMap, setParcelMap] = useState(new Map());
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    Promise.all([getAllCustomerShipments(), getAllParcels()]).then(
      ([shipmentsData, parcelsData]) => {
        const found = shipmentsData.find(
          (s) => s.trackingCode === location.state?.trackingCode
        );
        setShipment(found);
        setParcels(parcelsData);
      }
    );
  }, [location]);

  useEffect(() => {
    const map = new Map();
    parcels.forEach((p) => {
      if (!map.has(p.shipmentId)) map.set(p.shipmentId, []);
      map.get(p.shipmentId).push(p);
    });
    setParcelMap(map);
  }, [parcels]);

  const relatedParcels = shipment?.id ? parcelMap.get(shipment.id) || [] : [];

  useEffect(() => {
    const fetchQrForShipment = async () => {
      try {
        const res = await api.get(`/parcels/qrcode/${shipment.trackingCode}`);
        setQrUrl(res.data); // response is direct URL
      } catch (err) {
        console.error('Lỗi QR đơn hàng:', err);
      }
    };

    if (shipment?.trackingCode) {
      fetchQrForShipment();
    }
  }, [shipment]);

  const formatCurrency = (v) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(v);

  if (!shipment) return <div style={{ padding: 20 }}>Đang tải...</div>;

  return (
    <div className="invoice-container">
      <div className="invoice-page">
        <h1 className="invoice-title">HÓA ĐƠN VẬN CHUYỂN</h1>
        <div className="invoice-header">
          <div>
            <strong>CÔNG TY: </strong>METRO EXPRESS
            <br />
            <strong>Địa chỉ: </strong>01 Lý Tự Trọng, Q1, TP.HCM
            <br />
            <strong>Điện thoại: </strong>1900 9999
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>Mã đơn: </strong>
            {shipment.trackingCode}
            <br />
            <strong>Ngày đặt: </strong>
            {dayjs(shipment.bookedAt).format('DD/MM/YYYY')}
          </div>
        </div>

        <hr />

        <div className="info-section">
          <div>
            <strong>Người gửi:</strong> {shipment.senderName} – {shipment.senderPhone}
            <br />
            <strong>Trạm gửi:</strong> Trạm {shipment.departureStationName}
          </div>
          <div>
            <strong>Người nhận:</strong> {shipment.recipientName} – {shipment.recipientPhone}
            <br />
            <strong>Trạm nhận:</strong> Trạm {shipment.destinationStationName}
          </div>
        </div>

        <table className="parcel-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Mã kiện</th>
              <th>Khối lượng</th>
              <th>Kích thước</th>
              <th>Loại hàng</th>
              <th>Phí vận chuyển</th>
              <th>Bảo hiểm</th>
              <th>Tổng</th>
            </tr>
          </thead>
          <tbody>
            {relatedParcels.map((p, i) => (
              <tr key={p.id || i}>
                <td>{i + 1}</td>
                <td>{p.parcelCode}</td>
                <td>{p.weightKg} kg</td>
                <td>{p.lengthCm}×{p.widthCm}×{p.heightCm}</td>
                <td>{p.parcelCategory?.categoryName || 'N/A'}</td>
                <td>{formatCurrency(p.shippingFeeVnd)}</td>
                <td>{formatCurrency(p.insuranceFeeVnd)}</td>
                <td>{formatCurrency(p.priceVnd)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ QR Code đơn hàng */}
        {qrUrl && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <img src={qrUrl} alt={`QR-${shipment.trackingCode}`} width={120} height={120} />
            <div style={{ marginTop: 8 }}>{shipment.trackingCode}</div>
          </div>
        )}

        <div className="summary">
          <strong>Tổng phí: </strong> {formatCurrency(shipment.totalCostVnd)}
          <br />
          <strong>Trạng thái: </strong> {shipmentStatusMap[shipment.shipmentStatus] || 'N/A'}
          <br />
          <strong>Dự kiến giao: </strong>{' '}
          {dayjs(shipment.scheduledDateTime).format('DD/MM/YYYY HH:mm')}
        </div>

        <div className="signature-section">
          <div>
            <strong>Người gửi</strong>
            <br />
            <br />
            <br />
            Ký tên
          </div>
          <div>
            <strong>Người nhận</strong>
            <br />
            <br />
            <br />
            Ký tên
          </div>
        </div>
      </div>

      <Button className="print-order-button" onClick={() => window.print()}>
        In hóa đơn
      </Button>
    </div>
  );
}

export default PrintOrder;
