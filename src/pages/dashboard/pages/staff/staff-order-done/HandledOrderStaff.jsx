import './HandledOrderStaff.scss';

import { Button, Card, Col, ConfigProvider, DatePicker, Flex, Modal, Row, Select, Table } from 'antd';
import { getAllParcels, getAllShipments, getAllStations, getMetroLines, getMetroTimeSlots } from '../../../../../config/metroApi';
import { useEffect, useState } from 'react';

import { ClockCircleOutlined } from '@ant-design/icons';
import Title from 'antd/es/skeleton/Title';
import dayjs from 'dayjs';
import moment from 'moment';

function HandledOrderStaff() {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [shipments, setShipments] = useState([]);
    const [parcels, setParcels] = useState([]);
    const [stations, setStations] = useState([]);
    const [filteredShipments, setFilteredShipments] = useState([]);
    const [dateFilter, setDateFilter] = useState(null);
    const [stationFilter, setStationFilter] = useState(null);
    const [routeFilter, setRouteFilter] = useState(null);
    const [parcelMap, setParcelMap] = useState(new Map());
    const [metroLines, setMetroLine] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [verifyingParcel, setVerifyingParcel] = useState(null);
    const [verifyImage, setVerifyImage] = useState(null);
    const today = dayjs();

    //FORMAT TIỀN
    const formatCurrency = (value) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    //API ONE TIME
    useEffect(() => {
        Promise.all([getAllShipments(), getAllParcels(), getMetroTimeSlots(), getAllStations(), getMetroLines()]).then(
            ([shipmentsData, parcelsData, timeSlotsData, stationData, metroLineData]) => {
                setMetroLine(metroLineData)
                setStations(stationData);
                setShipments(shipmentsData.items);
                setParcels(parcelsData);
                setTimeSlots(timeSlotsData);
            }
        );
    }, []);

    useEffect(() => {
        const map = new Map();
        parcels.forEach((parcel) => {
            if (!map.has(parcel.shipmentId)) {
                map.set(parcel.shipmentId, []);
            }
            map.get(parcel.shipmentId).push(parcel);
        });
        setParcelMap(map);
    }, [parcels]);

    const getParcelsByShipmentId = (shipmentId) => {
        return parcels.filter(parcel => parcel.shipmentId === shipmentId);
    };

    const getCurrentShift = (slots) => {
        const now = moment();
        return slots.find(slot => {
            const start = moment(slot.openTime, 'HH:mm:ss');
            const end = moment(slot.closeTime, 'HH:mm:ss');

            //NIGHT SHIFT
            if (end.isBefore(start)) {
                return now.isAfter(start) || now.isBefore(end);
            }
            return now.isBetween(start, end);
        });
    };

    const handleFilterChange = () => {
        let filtered = shipments.filter(order =>
            order.shipmentStatus === 1
            || order.shipmentStatus === 2
            || order.shipmentStatus === 3
            || order.shipmentStatus === 5
            || order.shipmentStatus === 6
            || order.shipmentStatus === 12
            || order.shipmentStatus === 17
        );

        // CHỈNH SỬA FILTER
        if (dateFilter) {
            filtered = filtered.filter(order =>
                dayjs(order.scheduledDateTime).isSame(dayjs(dateFilter), 'day')
            );
        }

        if (stationFilter) {
            filtered = filtered.filter(order => order.departureStationName === stationFilter);
        }

        if (routeFilter) {
            filtered = filtered.filter(order => order.route === routeFilter);
        }

        setFilteredShipments(filtered);
    };


    useEffect(() => {
        if (shipments.length > 0) {
            handleFilterChange();
        }
    }, [shipments, dateFilter, stationFilter, routeFilter]);
    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            render: (_, __, index) => index + 1,
            width: 60,
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: 'trackingCode',
            key: 'trackingCode',
        },
        {
            title: 'Trạm gửi',
            dataIndex: 'departureStationName',
            key: 'departureStation',
        },
        {
            title: 'Trạm nhận',
            dataIndex: 'destinationStationName',
            key: 'destinationStation',
        },
        {
            title: 'Ngày gửi',
            dataIndex: 'scheduledDateTime',
            key: 'scheduledDateTime',
            render: (_, record) => dayjs(record.scheduledDateTime).format('DD/MM/YYYY'),
        },
        {
            title: 'Giờ gửi',
            dataIndex: 'scheduledDateTime',
            key: 'scheduledTime',
            render: (_, record) => dayjs(record.scheduledDateTime).format('HH:mm'),
        },
        {
            title: 'Thời điểm tạo yêu cầu',
            dataIndex: 'bookedAt',
            key: 'bookedAt',
            render: (_, record) => dayjs(record.bookedAt).format('YYYY-MM-DD HH:mm:ss') || 'N/A',
        },
        {
            title: 'Tổng chi phí',
            key: 'totalCost',
            render: (_, record) => formatCurrency(record.totalCostVnd),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'shipmentStatus',
            key: 'shipmentStatus',
            render: (status) => {
                const statusMapping = {
                    0: 'Đợi thanh toán',
                    1: 'Từ chối',
                    2: 'Không thanh toán',
                    3: 'Đã hủy',
                    4: 'Đợi hoàn tiền',
                    5: 'Đã hoàn tiền',
                    6: 'Không xuất hiện',
                    7: 'Đợi gửi hàng',
                    8: 'Đã lấy hàng',
                    9: 'Đang vận chuyển',
                    10: 'Đợi lấy hàng',
                    11: 'Thu phí tồn kho',
                    12: 'Quá hạn',
                    13: 'Hoàn đơn',
                    14: 'Đang hoàn đơn',
                    15: 'Đã hoàn đơn',
                    16: 'Đợi phản hồi',
                    17: 'Đã hoàn thành',
                    18: 'Delayed',
                };
                return statusMapping[status] || 'Không xác nhận';
            },
        },
        {
            title: 'Xem chi tiết',
            key: 'action',
            render: (_, record) => (
                <ConfigProvider
                    theme={{
                        components: {
                            Button: {
                                defaultColor: "white",
                                defaultBg: "#0066CC",
                                defaultBorderColor: "#0066CC",
                                defaultHoverBorderColor: "#FFC107",
                                defaultHoverColor: "black",
                                defaultHoverBg: "#FFC107",
                                defaultActiveBg: "#4CAF50",
                                defaultActiveBorderColor: "#4CAF50",
                                defaultActiveColor: "white",
                            }
                        }
                    }}>
                    <Button className='booking-table-staff_button' onClick={() => onRowClick(record)}>
                        Xem chi tiết
                    </Button>
                </ConfigProvider>
            ),
        },
    ];

    const onRowClick = (record) => {
        const relatedParcels = getParcelsByShipmentId(record.id);
        setSelectedOrder({ ...record, relatedParcels });
        setModalOpen(true);
    };
    return (
        <>
            <div className="order-staff-container">
                <div className="filter-sort" style={{ marginBottom: "1em" }}>
                    <Card>
                        <Title level={3}>Thời gian</Title>
                        <Row gutter={16}>
                            <Col span={6}>
                                <DatePicker
                                    value={dateFilter ?? today}
                                    onChange={(date) => setDateFilter(date)}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col span={18}>
                                <Flex gap="small" align="middle">
                                    {timeSlots.map(slot => {
                                        const current = getCurrentShift(timeSlots);
                                        const isActive = current?.shift === slot.shift;
                                        return (
                                            <div
                                                key={slot.id}
                                                style={{
                                                    padding: '0.5em 1em',
                                                    borderRadius: '8px',
                                                    background: isActive ? '#0066CC' : '#f0f0f0',
                                                    color: isActive ? 'white' : '#000',
                                                    fontWeight: isActive ? 600 : 400,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5em'
                                                }}
                                            >
                                                <ClockCircleOutlined />
                                                Ca {slot.shift} ({slot.openTime.slice(0, 5)} - {slot.closeTime.slice(0, 5)})
                                            </div>
                                        );
                                    })}
                                </Flex>
                            </Col>
                        </Row>
                    </Card>
                </div>
                <div className="table-data">
                    <Card>
                        <Title level={3}>Đơn hàng</Title>
                        <div className="staion-sort" style={{ marginBottom: "1.5em" }}>
                            <Row>
                                <Col span={6} style={{ marginRight: "1em" }}>
                                    <Select
                                        value={stationFilter}
                                        onChange={(value) => { setStationFilter(value); handleFilterChange(); }}
                                        placeholder="Chọn trạm"
                                        style={{ width: '100%' }}
                                    >
                                        {stations.map(station => (
                                            <Option key={station.id} value={station.stationNameVi}>
                                                {station.stationNameVi}
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>
                                <Col span={6}>
                                    <Select
                                        value={routeFilter}
                                        onChange={(value) => { setRouteFilter(value); handleFilterChange(); }}
                                        placeholder="Chọn tuyến"
                                        style={{ width: '100%' }}
                                    >
                                        {metroLines.map(metros => (
                                            <Option key={metros.id} value={metros.id}>
                                                {metros.lineNameVi}
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>
                            </Row>
                        </div>
                        <Table
                            columns={columns}
                            dataSource={filteredShipments}
                            rowKey="trackingCode"
                            pagination={{ pageSize: 10 }}
                            bordered
                            style={{ cursor: 'pointer' }}
                        />
                        <Modal
                            title={`Chi tiết đơn hàng: ${selectedOrder?.trackingCode || ''}`}
                            open={modalOpen}
                            onCancel={() => setModalOpen(false)}
                            footer={null}
                            width={700}
                        >
                            {selectedOrder && selectedOrder.relatedParcels && (
                                <Tabs defaultActiveKey="0">
                                    {selectedOrder.relatedParcels.map((parcel, index) => (
                                        <TabPane tab={`Kiện hàng ${index + 1}`} key={index}>
                                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                                <Table
                                                    dataSource={[
                                                        {
                                                            key: 'parcelCode',
                                                            label: 'Mã kiện hàng',
                                                            value: parcel.parcelCode || 'N/A',
                                                        },
                                                        {
                                                            key: 'parcelCategory',
                                                            label: 'Loại hàng',
                                                            value: parcel.parcelCategory?.categoryName || 'N/A',
                                                        },
                                                        {
                                                            key: 'chargeableWeightKg',
                                                            label: 'Trọng lượng quy đổi',
                                                            value: `${parcel.chargeableWeightKg || 'N/A'} kg`,
                                                        },
                                                        {
                                                            key: 'volumeCm3',
                                                            label: 'Thể tích',
                                                            value: `${parcel.volumeCm3 || 'N/A'} cm³`,
                                                        },
                                                        {
                                                            key: 'departureStationName',
                                                            label: 'Trạm gửi',
                                                            value: selectedOrder.departureStationName || 'N/A',
                                                        },
                                                        {
                                                            key: 'destinationStationName',
                                                            label: 'Trạm nhận',
                                                            value: selectedOrder.destinationStationName || 'N/A',
                                                        },
                                                        {
                                                            key: 'departureDate',
                                                            label: 'Ngày gửi',
                                                            value: dayjs(selectedOrder.scheduledDateTime).format('YYYY-MM-DD') || 'N/A',
                                                        },
                                                        {
                                                            key: 'departureTime',
                                                            label: 'Giờ gửi',
                                                            value: dayjs(selectedOrder.scheduledDateTime).format('HH:mm') || 'N/A',
                                                        },
                                                        {
                                                            key: 'createdAt',
                                                            label: 'Thời điểm tạo yêu cầu',
                                                            value: dayjs(selectedOrder.bookedAt).format('YYYY-MM-DD HH:mm:ss') || 'N/A',
                                                        },
                                                        {
                                                            key: 'totalCost',
                                                            label: 'Tổng chi phí',
                                                            value: formatCurrency(selectedOrder.totalCostVnd || 0),
                                                        },
                                                        {
                                                            key: 'parcelStatus',
                                                            label: 'Trạng thái kiện hàng',
                                                            value: ({
                                                                0: "Đang xử lý",
                                                                1: "Đợi thanh toán",
                                                                2: "Đợi gửi hàng",
                                                                3: "Từ chối",
                                                                4: "Chưa thanh toán",
                                                                5: "Đã hủy",
                                                                6: "Chờ hoàn tiền",
                                                                7: "Đã hoàn tiền",
                                                                8: "Không đến gửi hàng",
                                                                9: "Đã nhận hàng tại trạm",
                                                                10: "Đang trên đường vận chuyển - Tuyến ",
                                                                11: "Chuyển sang tuyến ",
                                                                12: "Đã nhận hàng ở trạm",
                                                                13: "Đợi khách đến lấy hàng",
                                                                14: "Hết hạn",
                                                                15: "Lưu kho lâu",
                                                                16: "Hoàn thành"
                                                            })[parcel.parcelStatus] || "Không xác nhận"
                                                        },
                                                    ]}
                                                    columns={[
                                                        {
                                                            title: 'Thông tin',
                                                            dataIndex: 'label',
                                                            key: 'label',
                                                        },
                                                        {
                                                            title: 'Chi tiết',
                                                            dataIndex: 'value',
                                                            key: 'value',
                                                        },
                                                    ]}
                                                    pagination={false}
                                                    bordered
                                                    showHeader={false}
                                                    rowClassName="order-detail-row"
                                                />
                                            </Space>
                                        </TabPane>
                                    ))}
                                </Tabs>
                            )}
                        </Modal>

                    </Card>
                </div>
            </div>
        </>
    )
}

export default HandledOrderStaff
