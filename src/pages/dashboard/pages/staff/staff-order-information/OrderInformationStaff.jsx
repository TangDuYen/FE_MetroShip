import './OrderInformationStaff.scss';

import { Card, Col, Descriptions, Divider, Image, Row, Typography } from "antd";
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
            <Title level={2}>Chi tiết đơn hàng: {shipment.trackingCode}</Title>
            <Title level={3} style={{ marginBottom: 10}}>Vị trí đơn hàng hiện tại: Trạm {shipment.currentStationName}</Title>

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
                    <Descriptions.Item label="Nhận vào">{dayjs(shipment.pickedUpAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
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

            <Card title="Thông tin các kiện hàng" style={{ marginBottom: 20 }}>
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

            {/* <Card title="Lộ trình vận chuyển">
                <Row gutter={[16, 16]}>
                    {shipment?.itineraryGraph?.routes?.map((route) => {
                        const fromStation = shipment.itineraryGraph.stations.find(s => s.stationId === route.fromStationId);
                        const toStation = shipment.itineraryGraph.stations.find(s => s.stationId === route.toStationId);
                        const line = shipment.itineraryGraph.metroLines.find(l => l.id === route.lineId);

                        const actualLeg = shipment.shipmentItineraries.find(i => i.legOrder === route.legOrder);

                        return (
                            <Col span={12} key={route.routeId}>
                                <Card
                                    title={
                                        <span style={{ color: 'white' }}>
                                            Chặng {route.legOrder}: {fromStation?.stationNameVi} → {toStation?.stationNameVi}
                                        </span>
                                    }
                                    size="small"
                                    headStyle={{ backgroundColor: line?.colorHex || '#fafafa', color: 'white' }}
                                >
                                    <Descriptions column={1} size="small" bordered>
                                        <Descriptions.Item label="Tuyến metro">{line?.lineNameVi}</Descriptions.Item>
                                        <Descriptions.Item label="Chiều dài">{route.lengthKm} km</Descriptions.Item>
                                        <Descriptions.Item label="Thời gian di chuyển">{route.travelTimeMin} phút</Descriptions.Item>
                                        <Descriptions.Item label="Ngày vận chuyển">
                                            {actualLeg?.date ? dayjs(actualLeg.date).format("YYYY-MM-DD") : 'Chưa có'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Ca">
                                            {actualLeg?.timeSlotId ? `Ca ${shipment.scheduledShift}` : 'Chưa xác định'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Trạng thái">
                                            {actualLeg?.isCompleted ? 'Hoàn tất' : 'Đang chờ'}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </Card> */}
        </div>
    );
}

export default OrderInformationStaff;
