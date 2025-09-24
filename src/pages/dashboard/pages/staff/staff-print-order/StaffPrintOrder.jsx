import "./StaffPrintOrder.scss";

import { formatCurrency, shipmentStatusMap } from "../../../../../constants/statusMap";
import { useEffect, useRef, useState } from "react";

import { Button } from "antd";
import api from "../../../../../config/axios";
import dayjs from "dayjs";
import { getParcelsByTrackingCode } from "../../../../../config/metroApi";
import html2pdf from "html2pdf.js";
import { useLocation } from "react-router-dom";

function StaffPrintOrder() {
  const location = useLocation();
  const [shipment, setShipment] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [qrUrl, setQrUrl] = useState(null);
  const invoiceRef = useRef();

  // 🔹 Fetch shipment details
  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const res = await api.get(`/shipments/${location.state?.trackingCode}`);
        const shipmentData = res.data?.data;
        setShipment(shipmentData);

        // 🔹 Lấy chi tiết các parcels từ list parcelCode
        const parcelCodes = shipmentData?.parcels?.map((p) => p.parcelCode) || [];
        const parcelDetails = await Promise.all(
          parcelCodes.map((code) => getParcelsByTrackingCode(code))
        );
        setParcels(parcelDetails.map((p) => p.data));

        // 🔹 Lấy QR code của shipment
        const qrRes = await api.get(`/parcels/qrcode/${shipmentData.trackingCode}`);
        setQrUrl(qrRes.data);
      } catch (err) {
        console.error("Lỗi lấy shipment:", err);
      }
    };

    if (location.state?.trackingCode) fetchShipment();
  }, [location.state?.trackingCode]);

  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return;

    invoiceRef.current.classList.add("pdf-scale");

    const opt = {
      margin: 0,
      filename: `${shipment.trackingCode || "invoice"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(invoiceRef.current)
      .save()
      .then(() => {
        invoiceRef.current.classList.remove("pdf-scale");
      });
  };

  if (!shipment) return <div style={{ padding: 20 }}>Đang tải...</div>;

  return (
    <div className="staff-invoice-container">
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
          <div style={{ textAlign: "right" }}>
            <strong>Mã đơn: </strong>
            {shipment.trackingCode}
            <br />
            <strong>Ngày đặt: </strong>
            {dayjs(shipment.bookedAt).format("DD/MM/YYYY")}
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
              <th>Mã kiện</th>
              <th>Khối lượng</th>
              <th>Kích thước (DxRxC)</th>
              <th>Loại hàng</th>
              <th>Phí vận chuyển</th>
              <th>Bảo hiểm</th>
              <th>Tổng</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map((p, i) => (
              <tr key={p.id || i}>
                <td>{p.parcelCode}</td>
                <td>{p.weightKg} kg</td>
                <td>
                  {p.lengthCm}×{p.widthCm}×{p.heightCm}
                </td>
                <td>{p.categoryInsurance?.parcelCategory?.categoryName || "N/A"}</td>
                <td>{formatCurrency(p.shippingFeeVnd)}</td>
                <td>{formatCurrency(p.insuranceFeeVnd)}</td>
                <td>{formatCurrency(p.priceVnd)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Shipment QR Code */}
        {qrUrl && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <img
              src={qrUrl}
              alt={`QR-${shipment.trackingCode}`}
              width={120}
              height={120}
            />
            <div style={{ marginTop: 8 }}>{shipment.trackingCode}</div>
          </div>
        )}

        <div className="summary">
          <strong>Tổng phí: </strong> {formatCurrency(shipment.totalCostVnd)}
          <br />
          <strong>Trạng thái: </strong>{" "}
          {shipmentStatusMap[shipment.shipmentStatus] || "N/A"}
          <br />
          <strong>Hạn chót gửi hàng lúc: </strong>{" "}
          {dayjs(shipment.scheduledDateTime).format("DD/MM/YYYY HH:mm")}
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

      <div style={{ display: "flex", gap: 8 }}>
        <Button
          className="download-order-button"
          type="primary"
          onClick={handleDownloadPDF}
        >
          Tải xuống
        </Button>
      </div>
    </div>
  );
}

export default StaffPrintOrder;
