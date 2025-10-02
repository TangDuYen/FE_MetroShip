import "./OrderInformationStaff.scss";

import {
  Button,
  Card,
  Descriptions,
  Divider,
  Image,
  Modal,
  Tag,
  Timeline,
  Typography,
} from "antd";
import {
  businessMediaType,
  formatCurrency,
  parcelStatusMap,
  shipmentStatusColorMap,
} from "./../../../../../constants/statusMap";
import {
  getAllBusinessMediaTypes,
  getMetroTrainsByStation,
  getParcelsByTrackingCode,
} from "../../../../../config/metroApi";
import {
  parcelStatusColorMap,
  shipmentStatusMap,
} from "../../../../../constants/statusMap";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { EnvironmentOutlined } from "@ant-design/icons";
import MapParcel from "./MapParcel";
import { PATH_NAME } from "../../../../../constants/pathname";
import api from "../../../../../config/axios";
import dayjs from "dayjs";
import html2pdf from "html2pdf.js";
import { jwtDecode } from "jwt-decode";

const { Title, Link } = Typography;

function OrderInformationStaff() {
  const { trackingCode } = useParams();
  const [shipment, setShipment] = useState(null);
  const [parcels, setParcels] = useState([]);
  const nav = useNavigate();
  const token = localStorage.getItem("token");
  const decodedUser = token ? jwtDecode(token) : null;
  const [trains, setTrains] = useState([]);
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [businessMediaTypes, setBusinessMediaTypes] = useState([]);
  const [showImages, setShowImages] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const qrRef = useRef();
  const navigate = useNavigate();
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [trackingParcelModalVisible, setTrackingParcelModalVisible] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/shipments/${trackingCode}`);
      const shipmentData = res.data?.data;
      setShipment(shipmentData);
      const parcelCodes = shipmentData?.parcels?.map((p) => p.parcelCode) || [];
      const parcelDetails = await Promise.all(
        parcelCodes.map((code) => getParcelsByTrackingCode(code))
      );
      setParcels(parcelDetails);

      const trainRes = await getMetroTrainsByStation(decodedUser?.StationId);
      const trainData = trainRes.items;
      setTrains(trainData);
    } catch (err) {
      console.error("Lỗi lấy chi tiết đơn:", err.response?.data || err.message);
    }
  };

  const fetchBusinessMediaTypes = async () => {
    try {
      const data = await getAllBusinessMediaTypes();
      setBusinessMediaTypes(data || []);
    } catch (err) {
      console.error("Lỗi lấy businessMediaTypes:", err);
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchBusinessMediaTypes();
  }, [trackingCode]);

  if (!shipment) return <p>Đang tải dữ liệu đơn hàng...</p>;

  const trainId = shipment.shipmentItineraries?.[0]?.trainId;
  const train = trains.find((t) => t.id === trainId);

  const handleDownloadQRAsPDF = () => {
    if (!qrRef.current) return;

    const opt = {
      margin: 5,
      filename: `Parcel-${selectedParcel?.parcelCode}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: "mm", format: "a5", orientation: "portrait" },
    };

    html2pdf().set(opt).from(qrRef.current).save();
  };


  let trainStatusText = null;
  if (shipment.shipmentStatus === 9) {
    trainStatusText = "Đang ở trên tàu:";
  } else if ([7, 8, 14].includes(shipment.shipmentStatus)) {
    trainStatusText = "Đang chờ tàu:";
  }


  return (
    <div className="order-info-staff-container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <Title level={2} style={{ margin: 0 }}>
          Chi tiết đơn hàng: {shipment.trackingCode}
        </Title>
        <div className="button-action" style={{ display: "flex", gap: 8 }}>
          <Button
            type="default"
            style={{ backgroundColor: '#0066CC', color: 'white', border: 'none', fontWeight: 'bold' }}
            onClick={() =>
              navigate(PATH_NAME.DASHBOARD_STAFF_PRINT_ORDER, {
                state: { trackingCode: shipment.trackingCode },
              })
            }
          >
            Tải đơn hàng
          </Button>
          <Button
            type="default"
            icon={<EnvironmentOutlined />}
            onClick={() => setMapVisible(true)}
            style={{ fontWeight: 'bold', color: '#0066CC' }}
          >
            Xem vị trí
          </Button>
        </div>

      </div>

      {trainStatusText && (
        <Typography.Link
          style={{
            fontSize: 18,
            marginBottom: 20,
            display: "inline-block",
            fontWeight: "bold",
            color: "black",
          }}
          onClick={() =>
            nav(PATH_NAME.DASHBOARD_STAFF_TRAIN_MAP.replace(":trainId", trainId))
          }
        >
          {trainStatusText}{" "}
          <span style={{ color: "#0066CC" }}>{shipment.waitingForTrainCode}</span>
        </Typography.Link>
      )}

      <Card title="Thông tin đơn hàng" style={{ marginBottom: 20 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Người gửi">
            <span style={{ color: "#0066CC", fontWeight: "bold" }}>
              {shipment.senderName} ({shipment.senderPhone})
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Người nhận">
            <span style={{ color: "#0066CC", fontWeight: "bold" }}>
              {shipment.recipientName} ({shipment.recipientPhone})
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Trạm gửi">
            <span style={{ color: "#0066CC", fontWeight: "bold" }}>{shipment.departureStationName}</span>
          </Descriptions.Item>

          <Descriptions.Item label="Trạm nhận">
            <span style={{ color: "blueviolet", fontWeight: "bold" }}>{shipment.destinationStationName}</span>
          </Descriptions.Item>

          <Descriptions.Item label="Thời điểm đặt">
            <span style={{ color: "orangered", fontWeight: "bold" }}>
              {dayjs(shipment.bookedAt).format("YYYY-MM-DD HH:mm")}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Thời điểm thanh toán">
            <span style={{ color: "blueviolet", fontWeight: "bold" }}>
              {dayjs(shipment.paidAt).format("YYYY-MM-DD HH:mm")}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Hạn chót nhận hàng lúc">
            <span style={{ color: "red", fontWeight: "bold" }}>
              {dayjs(shipment.scheduledDateTime).format("YYYY-MM-DD HH:mm")}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Tổng trọng lượng (kg)">
            <span style={{ fontWeight: "bold" }}>
              {shipment.totalWeightKg}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Tổng thể tích (M³)">
            <span style={{ color: "#0066CC", fontWeight: "bold" }}>
              {shipment.totalVolumeM3}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Tổng tiền bảo hiểm">
            <span style={{ color: "green", fontWeight: "bold" }}>
              {formatCurrency(shipment.totalInsuranceFeeVnd)}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Tổng phí vận chuyển">
            <span style={{ color: "green", fontWeight: "bold" }}>
              {formatCurrency(shipment.totalShippingFeeVnd)}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Tổng chi phí">
            <span style={{ color: "green", fontWeight: "bold" }}>
              {formatCurrency(shipment.totalCostVnd)}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Khách gửi hàng lúc">
            <span style={{ color: "#0066CC", fontWeight: "bold" }}>
              {dayjs(shipment.pickedUpAt).format("YYYY-MM-DD HH:mm")}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            <Tag color={shipmentStatusColorMap[shipment.shipmentStatus]}>
              {shipmentStatusMap[shipment.shipmentStatus] || "Không xác định"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Hình ảnh của đơn hàng" span={2}>
            {shipment.shipmentMedias && shipment.shipmentMedias.length > 0 ? (
              <Link onClick={() => setPreviewVisible(true)} style={{ color: "#0066CC", fontWeight: "bold" }}>
                Xem hình ảnh
              </Link>
            ) : (
              <span style={{ color: "gray" }}>Hiện tại không có dữ liệu hình ảnh</span>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Hành trình đơn hàng" span={2}>
            {shipment.shipmentTrackings && shipment.shipmentTrackings.length > 0 ? (
              <Link onClick={() => setTrackingModalVisible(true)} style={{ color: "#0066CC", fontWeight: "bold" }}>
                Xem hành trình
              </Link>
            ) : (
              <span style={{ color: "gray" }}>Hiện tại không có dữ liệu hành trình đơn hàng</span>
            )}
          </Descriptions.Item>
        </Descriptions>

        {/* <Image.PreviewGroup
          preview={{
            visible: previewVisible,
            onVisibleChange: (vis) => setPreviewVisible(vis),
          }}
        >
          {shipment.shipmentMedias?.map((m) => (
            <Image
              key={m.id}
              src={m.mediaUrl}
               title={mediaTypeMap[m.businessMediaType] || "Ảnh"}
              style={{ display: "none" }}
            />
          ))}
        </Image.PreviewGroup> */}
        {shipment.shipmentMedias && shipment.shipmentMedias.length > 0 && (
          <Image.PreviewGroup
            preview={{
              visible: previewVisible,
              onVisibleChange: (vis) => setPreviewVisible(vis),
              imageRender: (originalNode, { current }) => {
                const media = shipment.shipmentMedias[current];
                return (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      background: "transparent",
                    }}
                  >
                    <img
                      src={media.mediaUrl}
                      alt={businessMediaType?.[media?.businessMediaType] || "Ảnh"}
                      style={{
                        maxWidth: "90%",
                        maxHeight: "90%",
                        objectFit: "contain",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 110,
                        color: "white",
                        textAlign: "center",
                      }}
                    >
                      <div>
                        {media?.createdAt
                          ? dayjs(media.createdAt).format("DD/MM/YYYY HH:mm")
                          : ""}
                      </div>
                    </div>
                  </div>
                );
              },
            }}
          >
            {shipment.shipmentMedias.map((m) => (
              <Image
                key={m.id}
                src={m.mediaUrl}
                alt={businessMediaType?.[m.businessMediaType] || "Ảnh"}
                style={{ display: "none" }}
              />
            ))}
          </Image.PreviewGroup>
        )}
      </Card >

      <div
        style={{
          backgroundColor: "#0066CC",
          color: "white",
          fontSize: "16px",
          fontWeight: "bold",
          padding: "24px 20px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        Thông tin kiện hàng
      </div>

      {
        parcels.map((res, idx) => {
          const parcel = res.data;
          return (
            <Card
              title={`Kiện hàng ${idx + 1}`}
              style={{ marginBottom: 16 }}
              key={parcel.id}
              extra={
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    style={{ backgroundColor: 'white', color: '#0066CC', fontWeight: "bold" }}
                    type="primary"
                    onClick={async () => {
                      try {
                        const res = await api.get(`/parcels/qrcode/${parcel.parcelCode}`);
                        setSelectedParcel(parcel);
                        setQrCodeUrl(res.data);
                        setQrModalVisible(true);
                      } catch (err) {
                        console.error("Lỗi lấy QR:", err);
                      }
                    }}
                  >
                    Tải QR
                  </Button>
                  <Button
                    style={{ backgroundColor: 'white', color: '#0066CC', fontWeight: "bold" }}
                    type="default"
                    onClick={() => {
                      setSelectedParcel(parcel);
                      setTrackingParcelModalVisible(true);
                    }}
                  >
                    Xem hành trình kiện hàng
                  </Button>
                </div>
              }

            >
              <div style={{ display: "flex", gap: 24 }}>
                {/* LEFT COLUMN */}
                <div style={{ flex: 5 }}>
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Mã kiện">
                      <span style={{ color: "#0066CC", fontWeight: "bold" }}>
                        {parcel.parcelCode}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại hàng">
                      <span style={{ color: "#0066CC", fontWeight: "bold" }}>
                        {parcel.categoryInsurance?.parcelCategory?.categoryName || "Không có loại hàng"}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả">
                      <span style={{ color: "#0066CC", fontWeight: "bold" }}>
                        {parcel.categoryInsurance?.parcelCategory?.description || "Không có mô tả"}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trọng lượng">
                      <span style={{ fontWeight: "bold" }}>{parcel.weightKg} kg</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Kích thước">
                      <span style={{ color: "#0066CC", fontWeight: "bold" }}>
                        {parcel.lengthCm} x {parcel.widthCm} x {parcel.heightCm} cm
                      </span>
                    </Descriptions.Item>
                  </Descriptions>
                </div>

                {/* MIDDLE COLUMN */}
                <div style={{ flex: 5 }}>
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Thể tích">
                      <span style={{ color: "#0066CC", fontWeight: "bold" }}>
                        {parcel.volumeCm3} cm³
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trọng lượng quy đổi">
                      <span style={{ color: "#0066CC", fontWeight: "bold" }}>
                        {parcel.chargeableWeightKg} kg
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phí vận chuyển">
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        {parcel.shippingFeeVnd} VND
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng phí">
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        {parcel.priceVnd} VND
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tình trạng">
                      <Tag color={parcelStatusColorMap[parcel.status]}>
                        {parcelStatusMap[parcel.status]}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </div>

                {/* QR CODE */}
                <div
                  style={{
                    flex: 2,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${parcel.parcelCode}&size=200x200`}
                    alt="QR"
                    style={{ width: 200, height: 200, marginBottom: 12 }}
                  />
                  <div style={{ fontWeight: "bold" }}>{parcel.parcelCode}</div>
                </div>
              </div>

            </Card>
          );
        })
      }

      <Modal
        title={`Vị trí đơn hàng ${selectedParcel?.parcelCode || ""}`}
        open={mapVisible}
        onCancel={() => setMapVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ height: 400, background: "#eee" }}>
          <MapParcel shipmentId={shipment.id} visible={mapVisible} />
        </div>
      </Modal>

      <Modal
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        width={800}
      >
        {qrCodeUrl && selectedParcel ? (
          <div ref={qrRef}>
            {/* HEADER */}
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <h2 style={{ margin: 0, fontWeight: "bold" }}>MetroShip</h2>
              <div style={{ marginTop: 4 }}>
                <strong>Mã đơn hàng:</strong> {shipment.trackingCode}
              </div>
            </div>

            {/* GRID CONTENT */}
            <div
              style={{
                border: "2px solid black",
                display: "grid",
                gridTemplateColumns: "3fr 1fr",
                gridTemplateRows: "1fr 1fr 1fr",
                height: "450px",
              }}
            >
              {/* SENDER */}
              <div style={{ borderRight: "2px solid black", borderBottom: "2px solid black", padding: "10px" }}>
                <strong>Thông tin người gửi:</strong>
                <div>{shipment.senderName} ({shipment.senderPhone})</div>
                <div>Trạm gửi: {shipment.departureStationName}</div>
              </div>

              {/* QR CODE */}
              <div style={{ borderBottom: "2px solid black", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <img src={qrCodeUrl} alt="QR" style={{ width: 120, height: 120 }} />
              </div>

              {/* RECIPIENT */}
              <div style={{ borderRight: "2px solid black", borderBottom: "2px solid black", padding: "10px" }}>
                <strong>Thông tin người nhận:</strong>
                <div>{shipment.recipientName} ({shipment.recipientPhone})</div>
                <div>Trạm nhận: {shipment.destinationStationName}</div>
              </div>

              {/* PAYMENT METHOD */}
              <div style={{ borderBottom: "2px solid black", justifyContent: "center", alignItems: "center", padding: "10px" }}>
                <strong>Phương thức thanh toán:</strong>
                <div>VNPAY</div>
              </div>

              {/* PARCEL INFO */}
              <div style={{ borderRight: "2px solid black", padding: "10px" }}>
                <strong>Thông tin kiện hàng:</strong>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #000", padding: 4 }}>Mã kiện</th>
                      <th style={{ border: "1px solid #000", padding: 4 }}>Loại hàng</th>
                      <th style={{ border: "1px solid #000", padding: 4 }}>Trọng lượng</th>
                      <th style={{ border: "1px solid #000", padding: 4 }}>Kích thước</th>
                      <th style={{ border: "1px solid #000", padding: 4 }}>Phí VC</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: 4 }}>{selectedParcel.parcelCode}</td>
                      <td style={{ border: "1px solid #000", padding: 4 }}>{selectedParcel.categoryInsurance?.parcelCategory?.categoryName || "Không có"}</td>
                      <td style={{ border: "1px solid #000", padding: 4 }}>{selectedParcel.weightKg} kg</td>
                      <td style={{ border: "1px solid #000", padding: 4 }}>
                        {selectedParcel.lengthCm}x{selectedParcel.widthCm}x{selectedParcel.heightCm} cm
                      </td>
                      <td style={{ border: "1px solid #000", padding: 4 }}>
                        {formatCurrency(selectedParcel.shippingFeeVnd)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SIGNATURE */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i>Chữ ký người nhận</i>
              </div>
            </div>
          </div>
        ) : (
          <p>Đang tải...</p>
        )}

        {/* DOWNLOAD BUTTON */}
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Button type="primary" onClick={handleDownloadQRAsPDF}>Tải xuống</Button>
        </div>
      </Modal>

      <Modal
        title={`Hành trình đơn hàng`}
        open={trackingModalVisible}
        onCancel={() => setTrackingModalVisible(false)}
        footer={null}
        width={800}
      >
        {shipment.shipmentTrackings && shipment.shipmentTrackings.length > 0 ? (
          <Timeline>
            {shipment.shipmentTrackings
              .sort(
                (a, b) =>
                  new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()
              )
              .map((tracking, idx) => (
                <Timeline.Item
                  key={tracking.id}
                  color={idx === 0 ? "green" : "gray"}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ color: "#999" }}>
                      {dayjs(tracking.eventTime).format("DD/MM HH:mm")}
                    </div>
                    <div
                      className={
                        idx === 0
                          ? "timeline-description highlight"
                          : "timeline-description"
                      }
                    >
                      {tracking.status}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
          </Timeline>
        ) : (
          <p>Chưa có dữ liệu hành trình.</p>
        )}
      </Modal>

      <Modal
        title={`Hành trình kiện hàng ${selectedParcel?.parcelCode || ""}`}
        open={trackingParcelModalVisible}
        onCancel={() => setTrackingParcelModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedParcel?.parcelTrackings && selectedParcel.parcelTrackings.length > 0 ? (
          <Timeline>
            {selectedParcel.parcelTrackings
              .sort(
                (a, b) =>
                  new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()
              )
              .map((tracking, idx) => (
                <Timeline.Item
                  key={tracking.id}
                  color={idx === 0 ? "green" : "gray"}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ color: "#999" }}>
                      {dayjs(tracking.eventTime).format("DD/MM HH:mm")}
                    </div>
                    <div
                      className={
                        idx === 0
                          ? "timeline-description highlight"
                          : "timeline-description"
                      }
                    >
                      {tracking.status}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
          </Timeline>
        ) : (
          <p>Chưa có dữ liệu hành trình kiện hàng.</p>
        )}
      </Modal>

    </div >
  );
}

export default OrderInformationStaff;
