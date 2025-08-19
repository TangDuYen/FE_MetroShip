import './PrintOrder.scss';

import { formatCurrency, shipmentStatusMap } from '../../constants/statusMap';
import { getAllCustomerShipments, getAllParcelCategories, getAllParcels } from './../../config/metroApi';
import { useEffect, useRef, useState } from 'react';

import { Button } from 'antd';
import api from '../../config/axios';
import dayjs from 'dayjs';
import html2pdf from 'html2pdf.js';
import { useLocation } from 'react-router-dom';

function PrintOrder() {
  const location = useLocation();
  const [shipment, setShipment] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [parcelCate, setParcelCate] = useState([]);
  const [parcelMap, setParcelMap] = useState(new Map());
  const [qrUrl, setQrUrl] = useState(null);
  const invoiceRef = useRef();
  const [qrUrlsParcel, setQrUrlsParcel] = useState({});
  


  useEffect(() => {
    Promise.all([getAllCustomerShipments(), getAllParcels(), getAllParcelCategories()]).then(
      ([shipmentsData, parcelsData, parcelCateData]) => {
        const found = shipmentsData.find(
          (s) => s.trackingCode === location.state?.trackingCode
        );
        setShipment(found);
        setParcels(parcelsData);
        setParcelCate(parcelCateData);
      }
    );
  }, [location]);
  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return;

    invoiceRef.current.classList.add('pdf-scale');

    const opt = {
      margin: 0,
      filename: `${shipment.trackingCode || 'invoice'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
      .set(opt)
      .from(invoiceRef.current)
      .save()
      .then(() => {
        invoiceRef.current.classList.remove('pdf-scale');
      });
  };

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
        setQrUrl(res.data);
      } catch (err) {
        console.error('Lỗi QR đơn hàng:', err);
      }
    };

    if (shipment?.trackingCode) {
      fetchQrForShipment();
    }
  }, [shipment]);

  useEffect(() => {
    if (!relatedParcels.length) return;

    const fetchAllQrParcels = async () => {
      const qrResults = {};
      for (const p of relatedParcels) {
        try {
          const res = await api.get(`/parcels/qrcode/${p.parcelCode}`);
          qrResults[p.parcelCode] = res.data;
        } catch (err) {
          qrResults[p.parcelCode] = null;
          console.error(`Lỗi QR kiện hàng ${p.parcelCode}:`, err);
        }
      }
      setQrUrlsParcel(qrResults);
    };

    fetchAllQrParcels();
  }, [relatedParcels]);

  if (!shipment) return <div style={{ padding: 20 }}>Đang tải...</div>;

  return (
    <div className="invoice-container">
      <div className="invoice-page" ref={invoiceRef}>
        <h1 className="invoice-title">HÓA ĐƠN VẬN CHUYỂN</h1>
        <div className="invoice-header">
          <div>
            <strong>CÔNG TY: </strong>METROSHIP
            <br />
            <strong>Địa chỉ: </strong>Số 1 Lưu Hữu Phước, Đông Hoà, Dĩ An, Hồ Chí Minh
            <br />
            <strong>Điện thoại: </strong>028 3835 1118 - 1109
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
              <th>QR CODE</th>
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
                <td>
                  <td>
                    {/* PARCEL QR CODE */}
                    {qrUrlsParcel[p.parcelCode] && (
                      <div style={{textAlign: 'center' }}>
                        <img src={qrUrlsParcel[p.parcelCode]} alt={`QR-${p.parcelCode}`} width={50} height={50} />
                      </div>
                    )}
                  </td>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/*SHIPMENT QR CODE */}
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
          <strong>Hạn chót gửi hàng lúc: </strong>{' '}
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

      <div style={{ display: 'flex', gap: 8 }}>
        <Button className="print-order-button" onClick={() => window.print()}>
          In hóa đơn
        </Button>
        <Button className='download-order-button' type="primary" onClick={handleDownloadPDF}>
          Tải về PDF
        </Button>
      </div>
    </div>
  );
}

export default PrintOrder;
