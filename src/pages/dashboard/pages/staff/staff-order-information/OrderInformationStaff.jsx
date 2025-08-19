import './OrderInformationStaff.scss';

import { Button, Card, Col, Descriptions, Divider, Image, Row, Tag, Typography } from "antd";
import { formatCurrency, parcelStatusMap } from './../../../../../constants/statusMap';
import { getAllParcels, getMetroTrainsByStation, getParcelCategoryById } from "../../../../../config/metroApi";
import { parcelStatusColorMap, shipmentStatusMap } from "../../../../../constants/statusMap";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PATH_NAME } from '../../../../../constants/pathname';
import api from "../../../../../config/axios";
import dayjs from "dayjs";
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const { Title } = Typography;

function OrderInformationStaff() {
    const { trackingCode } = useParams();
    const [shipment, setShipment] = useState(null);
    const [parcels, setParcels] = useState([]);
    const [userId, setUserId] = useState('');
    const [user, setUser] = useState(null);
    const nav = useNavigate();
    const canClaim = (status) => status === 4;
    const transactionType = 4;
    const token = localStorage.getItem("token");
    const decodedUser = token ? jwtDecode(token) : null;
    const staffAssignments = JSON.parse(localStorage.getItem("staffAssignments") || "[]");
    const [trains, setTrains] = useState([]);
    const [parcelCategories, setParcelCategories] = useState({});

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/shipments/${trackingCode}`);
                const shipmentData = res.data?.data;
                setShipment(shipmentData);
                setUserId(res.data?.data?.pickedUpBy);

                const parcelRes = await getAllParcels();
                const related = parcelRes.filter(p => p.shipmentId === res.data?.data?.id);
                setParcels(related);

                if (shipmentData?.pickedUpBy) {
                    const userRes = await api.get(`/users/${shipmentData.pickedUpBy}`);
                    setUser(userRes.data?.data);
                }

                const trainRes = await getMetroTrainsByStation(decodedUser?.StationId);
                const trainData = trainRes.items;
                setTrains(trainData);

            } catch (err) {
                console.error("Lỗi lấy chi tiết đơn:", err);
            }
        };
        fetchDetails();
    }, [trackingCode]);

    const fetchCategories = async () => {
        const categoriesMap = {};
        for (const parcel of parcels) {
            if (parcel.parcelCategoryId && !categoriesMap[parcel.parcelCategoryId]) {
                const cat = await getParcelCategoryById(parcel.parcelCategoryId);
                categoriesMap[parcel.parcelCategoryId] = cat;
            }
        }
        setParcelCategories(categoriesMap);
    };

    useEffect(() => {
        fetchCategories();
    }, [parcels]);

    const handleCreatePaymentUrl = async () => {
        if (!shipment?.id) return;
        try {
            const currentDomain = window.location.origin;
            const payload = {
                shipmentId: shipment.id,
                transactionType,
                returnUrl: `${currentDomain}/dashboard/staff/order-information/${shipment.trackingCode}`,
                cancelUrl: `${currentDomain}/dashboard/staff/order-information/${shipment.trackingCode}`,
            };

            const res = await api.post('/shipments/vnpay/payment-url', payload);
            const url = res?.data?.data;
            if (res?.data?.statusCode === 200 && url) {
                window.location.href = url; // redirect đến VNPay
            } else {
                toast.error('Không lấy được link thanh toán!');
            }
        } catch (err) {
            console.error(err);
            toast.error('Lỗi tạo link thanh toán: ' + (err.response?.data?.message || err.message));
        }
    };
    
    if (!shipment) return <p>Đang tải dữ liệu đơn hàng...</p>;

    const trainId = shipment.shipmentItineraries?.[0]?.trainId;
    const train = trains.find(t => t.id === trainId);

    return (
        <div className="order-info-staff-container">
            <Title level={2}>Chi tiết đơn hàng: {shipment.trackingCode}</Title>
            <Typography.Link
                style={{ fontSize: 18, marginBottom: 20, display: 'inline-block', fontWeight: 'bold' }}
                onClick={() => nav(PATH_NAME.DASHBOARD_STAFF_TRAIN_INFORMATION)}
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
                    <Descriptions.Item label="Trạng thái">{shipmentStatusMap[shipment.shipmentStatus] || "Không xác định"}</Descriptions.Item>
                    {/* <Descriptions.Item label="Nhận bởi"> {user?.fullName || shipment.pickedUpBy || "Chưa xác định"}</Descriptions.Item> */}
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
                            <Descriptions.Item label="Loại hàng">
                                {parcel.categoryInsurance?.parcelCategory?.categoryName || parcelCategories[parcel.parcelCategoryId]?.categoryName || "Không có loại hàng"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả">
                                {parcel.categoryInsurance?.parcelCategory?.description || parcelCategories[parcel.parcelCategoryId]?.description || "Không có mô tả"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Trọng lượng">{parcel.weightKg} kg</Descriptions.Item>
                            <Descriptions.Item label="Kích thước (D x R x C)">{parcel.lengthCm} cm x {parcel.widthCm} cm x {parcel.heightCm} cm</Descriptions.Item>
                            <Descriptions.Item label="Thể tích">{parcel.volumeCm3} cm³</Descriptions.Item>
                            <Descriptions.Item label="Trọng lượng quy đổi">{parcel.chargeableWeightKg} kg</Descriptions.Item>
                            <Descriptions.Item label="Phí vận chuyển">{formatCurrency(parcel.shippingFeeVnd)}</Descriptions.Item>
                            <Descriptions.Item label="Phí bảo hiểm">{formatCurrency(parcel.insuranceFeeVnd)}</Descriptions.Item>
                            <Descriptions.Item label="Tổng phí">{formatCurrency(parcel.priceVnd)}</Descriptions.Item>
                            <Descriptions.Item label="Tình trạng">
                                <Tag color={parcelStatusColorMap[parcel.status]}>
                                    {parcelStatusMap[parcel.status]}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item>
                                {canClaim(parcel.status) && (
                                    <Button danger onClick={() => handleCreatePaymentUrl()}>
                                        Bồi thường
                                    </Button>
                                )}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                ))}
            </Card>
        </div>
    );
}

export default OrderInformationStaff;
