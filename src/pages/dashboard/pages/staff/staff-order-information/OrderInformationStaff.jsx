import './OrderInformationStaff.scss';

import { Card, Descriptions, Divider, Image, Tag, Typography } from "antd";
import { formatCurrency, parcelStatusMap, shipmentStatusColorMap } from './../../../../../constants/statusMap';
import { getMetroTrainsByStation, getParcelsByTrackingCode } from "../../../../../config/metroApi";
import { parcelStatusColorMap, shipmentStatusMap } from "../../../../../constants/statusMap";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PATH_NAME } from '../../../../../constants/pathname';
import api from "../../../../../config/axios";
import dayjs from "dayjs";
import { jwtDecode } from 'jwt-decode';

const { Title } = Typography;

function OrderInformationStaff() {
    const { trackingCode } = useParams();
    const [shipment, setShipment] = useState(null);
    const [parcels, setParcels] = useState([]);
    const nav = useNavigate();
    const token = localStorage.getItem("token");
    const decodedUser = token ? jwtDecode(token) : null;
    const [trains, setTrains] = useState([]);

    const fetchDetails = async () => {
        try {
            const res = await api.get(`/shipments/${trackingCode}`);
            const shipmentData = res.data?.data;
            setShipment(shipmentData);
            const parcelCodes = shipmentData?.parcels?.map(p => p.parcelCode) || [];
            const parcelDetails = await Promise.all(
                parcelCodes.map(code => getParcelsByTrackingCode(code))
            );
            setParcels(parcelDetails);

            const trainRes = await getMetroTrainsByStation(decodedUser?.StationId);
            const trainData = trainRes.items;
            setTrains(trainData);

        } catch (err) {
            console.error("Lỗi lấy chi tiết đơn:", err);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [trackingCode]);

    if (!shipment) return <p>Đang tải dữ liệu đơn hàng...</p>;

    const trainId = shipment.shipmentItineraries?.[0]?.trainId;
    const train = trains.find(t => t.id === trainId);

    return (
        <div className="order-info-staff-container">
            <Title level={2}>Chi tiết đơn hàng: {shipment.trackingCode}</Title>
            <Typography.Link
                style={{ fontSize: 18, marginBottom: 20, display: 'inline-block', fontWeight: 'bold' }}
                onClick={() => nav(PATH_NAME.DASHBOARD_STAFF_TRAIN_MAP.replace(":trainId", trainId))}
            >
                <span style={{ color: 'black' }}>Vị trí hiện tại: </span> {train ? `Tàu ${train.trainCode}` : `Tàu ${trainId}`} - Trạm {shipment.currentStationName}
            </Typography.Link>

            <Card title="Thông tin đơn hàng" style={{ marginBottom: 20 }}>
                <Descriptions column={2} bordered>
                    <Descriptions.Item label="Người gửi">{shipment.senderName} ({shipment.senderPhone})</Descriptions.Item>
                    <Descriptions.Item label="Người nhận">{shipment.recipientName} ({shipment.recipientPhone})</Descriptions.Item>
                    <Descriptions.Item label="Trạm gửi">{shipment.departureStationName}</Descriptions.Item>
                    <Descriptions.Item label="Trạm nhận">{shipment.destinationStationName}</Descriptions.Item>
                    <Descriptions.Item label="Thời điểm đặt">{dayjs(shipment.bookedAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
                    <Descriptions.Item label="Thời điểm thanh toán">{dayjs(shipment.paidAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
                    <Descriptions.Item label="Hạn chót nhận hàng lúc">{dayjs(shipment.scheduledDateTime).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
                    <Descriptions.Item label="Tổng trọng lượng (kg)">{shipment.totalWeightKg}</Descriptions.Item>
                    <Descriptions.Item label="Tổng thể tích (M³)">{shipment.totalVolumeM3}</Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền bảo hiểm">{formatCurrency(shipment.totalInsuranceFeeVnd)}</Descriptions.Item>
                    <Descriptions.Item label="Tổng phí vận chuyển">{formatCurrency(shipment.totalShippingFeeVnd)}</Descriptions.Item>
                    <Descriptions.Item label="Tổng chi phí">{formatCurrency(shipment.totalCostVnd)}</Descriptions.Item>
                    <Descriptions.Item label="Khách gửi hàng lúc">{dayjs(shipment.pickedUpAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={shipmentStatusColorMap[shipment.shipmentStatus]}>
                            {shipmentStatusMap[shipment.shipmentStatus] || "Không xác định"}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
                {shipment.shipmentMedias?.map(m => (
                    <Image
                        key={m.id}
                        src={m.mediaUrl}
                        width={200}
                        style={{ marginRight: 10, marginBottom: 10 }}
                    />
                ))}
            </Card>

            <div style={{
                backgroundColor: "#0066CC",
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
                padding: "24px 20px",
                borderRadius: "10px",
                marginBottom: "20px"
            }}>
                Thông tin kiện hàng
            </div>

            {parcels.map((res, idx) => {
                const parcel = res.data;
                return (
                    <Card title={`Kiện hàng ${idx + 1}`} style={{ marginBottom: 16 }} key={parcel.id}>
                        <Descriptions column={2}>
                            <Descriptions.Item label="Mã kiện">{parcel.parcelCode}</Descriptions.Item>
                            <Descriptions.Item label="Loại hàng">
                                {parcel.categoryInsurance?.parcelCategory?.categoryName || "Không có loại hàng"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả">
                                {parcel.categoryInsurance?.parcelCategory?.description || "Không có mô tả"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Trọng lượng">{parcel.weightKg} kg</Descriptions.Item>
                            <Descriptions.Item label="Kích thước (D x R x C)">{parcel.lengthCm} cm x {parcel.widthCm} cm x {parcel.heightCm} cm</Descriptions.Item>
                            <Descriptions.Item label="Thể tích">{parcel.volumeCm3} cm³</Descriptions.Item>
                            <Descriptions.Item label="Trọng lượng quy đổi">{parcel.chargeableWeightKg} kg</Descriptions.Item>
                            <Descriptions.Item label="Phí vận chuyển">{formatCurrency(parcel.shippingFeeVnd)}</Descriptions.Item>
                            {parcel.insuranceFeeVnd > 0 && (
                                <Descriptions.Item label="Phí bảo hiểm">
                                    {formatCurrency(parcel.insuranceFeeVnd)}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Tổng phí">{formatCurrency(parcel.priceVnd)}</Descriptions.Item>
                            <Descriptions.Item label="Tình trạng">
                                <Tag color={parcelStatusColorMap[parcel.status]}>
                                    {parcelStatusMap[parcel.status]}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                );
            })
            }
        </div >
    );
}

export default OrderInformationStaff;
