import './OrderInformationStaff.scss';

import { Card, Descriptions, Divider, Image, Typography } from "antd";
import { useEffect, useState } from "react";

import api from "../../../../../config/axios";
import dayjs from "dayjs";
import { getAllParcels } from "../../../../../config/metroApi";
import { shipmentStatusMap } from "../../../../../constants/statusMap";
import { useParams } from "react-router-dom";

const { Title } = Typography;

function OrderInformationStaff() {
    const { trackingCode } = useParams();
    const [shipment, setShipment] = useState(null);
    const [parcels, setParcels] = useState([]);
    const [userId, setUserId] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/shipments/${trackingCode}`);
                const shipmentData = res.data?.data;
                setShipment(shipmentData);
                setUserId(res.data?.data?.pickedUpBy)
                const parcelRes = await getAllParcels();
                const related = parcelRes.filter(p => p.shipmentId === res.data?.data?.id);
                setParcels(related);
                if (shipmentData?.pickedUpBy) {
                    const userRes = await api.get(`/users/${shipmentData.pickedUpBy}`);
                    setUser(userRes.data?.data);
                }

            } catch (err) {
                console.error("Lỗi lấy chi tiết đơn:", err);
            }
        };
        fetchDetails();
    }, [trackingCode]);

    if (!shipment) return <p>Đang tải dữ liệu đơn hàng...</p>;

    return (
        <div className="order-info-staff-container">
            <Title level={3}>Chi tiết đơn hàng: {shipment.trackingCode}</Title>

            <Card title="Thông tin đơn hàng" style={{ marginBottom: 20 }}>
                <Descriptions column={2} bordered>
                    <Descriptions.Item label="Người gửi">{shipment.senderName} ({shipment.senderPhone})</Descriptions.Item>
                    <Descriptions.Item label="Người nhận">{shipment.recipientName} ({shipment.recipientPhone})</Descriptions.Item>
                    <Descriptions.Item label="Trạm gửi">{shipment.departureStationName}</Descriptions.Item>
                    <Descriptions.Item label="Trạm nhận">{shipment.destinationStationName}</Descriptions.Item>
                    <Descriptions.Item label="Thời điểm đặt">{dayjs(shipment.bookedAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
                    <Descriptions.Item label="Thời điểm thanh toán">{dayjs(shipment.paidAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
                    <Descriptions.Item label="Thời gian giao">{dayjs(shipment.scheduledDateTime).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
                    <Descriptions.Item label="Tổng trọng lượng (kg)">{shipment.totalWeightKg}</Descriptions.Item>
                    <Descriptions.Item label="Tổng thể tích (M³)">{shipment.totalVolumeM3}</Descriptions.Item>
                    <Descriptions.Item label="Tổng chi phí">{shipment.totalCostVnd?.toLocaleString()} VND</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">{shipmentStatusMap[shipment.shipmentStatus] || "Không xác định"}</Descriptions.Item>
                    <Descriptions.Item label="Lộ trình">{shipment.shipmentItineraries?.[0].route?.routeName}</Descriptions.Item>
                    <Descriptions.Item label="Vị trí hiện tại">{shipment.currentStationName}</Descriptions.Item>
                    <Descriptions.Item label="Nhận bởi"> {user?.fullName || shipment.pickedUpBy || "Chưa xác định"}</Descriptions.Item>
                </Descriptions>
                {shipment.pickedUpImageLink && (
                    <>
                        <Divider />
                        <Image
                            width={400}
                            height={200}
                            src={shipment.pickedUpImageLink}
                            alt={`Ảnh đơn hàng ${shipment.trackingCode}`} />
                    </>
                )}
            </Card>

            <Card title="Thông tin các kiện hàng">
                {parcels.map((parcel, idx) => (
                    <Card type="inner" title={`Kiện hàng ${idx + 1}`} style={{ marginBottom: 16 }} key={parcel.id}>
                        <Descriptions column={2}>
                            <Descriptions.Item label="Mã kiện">{parcel.parcelCode}</Descriptions.Item>
                            <Descriptions.Item label="Loại hàng">{parcel.parcelCategory?.categoryName}</Descriptions.Item>
                            <Descriptions.Item label="Mô tả">{parcel.parcelCategory?.description}</Descriptions.Item>
                            <Descriptions.Item label="Trọng lượng">{parcel.weightKg} kg</Descriptions.Item>
                            <Descriptions.Item label="Kích thước (D x R x C)">{parcel.lengthCm} cm x {parcel.widthCm} cm x {parcel.heightCm} cm</Descriptions.Item>
                            <Descriptions.Item label="Thể tích">{parcel.volumeCm3} cm³</Descriptions.Item>
                            <Descriptions.Item label="Trọng lượng quy đổi">{parcel.chargeableWeightKg} kg</Descriptions.Item>
                            <Descriptions.Item label="Phí vận chuyển">{parcel.shippingFeeVnd?.toLocaleString()} VND</Descriptions.Item>
                            <Descriptions.Item label="Phí bảo hiểm">{parcel.insuranceFeeVnd?.toLocaleString()} VND</Descriptions.Item>
                            <Descriptions.Item label="Tổng phí">{parcel.priceVnd?.toLocaleString()} VND</Descriptions.Item>
                        </Descriptions>

                    </Card>
                ))}
            </Card>
        </div>
    );
}

export default OrderInformationStaff;
