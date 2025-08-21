import './HandledOrderStaff.scss';

import { Button, Card, Col, ConfigProvider, DatePicker, Flex, Input, Modal, Pagination, Row, Select, Space, Table, Tabs, Tag, Typography } from 'antd';
import { formatCurrency, shipmentStatusColorMap, shipmentStatusMap } from '../../../../../constants/statusMap';
import { getAllParcelCategories, getAllParcels, getAllShipments, getAllStations, getMetroLines, getMetroTimeSlots, getMetroTrainsByStation } from '../../../../../config/metroApi';
import { useEffect, useState } from 'react';

import { ClockCircleOutlined } from '@ant-design/icons';
import MetroStation from '../../../../../assets/metro_station.png';
import { PATH_NAME } from '../../../../../constants/pathname';
import { ReloadOutlined } from '@ant-design/icons';
import StaffIcon from '../../../../../assets/profile.webp';
import TabPane from 'antd/es/tabs/TabPane';
import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import viVN from 'antd/lib/locale/vi_VN';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

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
    const [expiredShipment, setExpiredShipment] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const token = localStorage.getItem("token");
    const decodedUser = token ? jwtDecode(token) : null;
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 2;
    const staffAssignments = JSON.parse(localStorage.getItem("staffAssignments") || "[]");
    const [metroTrains, setMetroTrains] = useState([]);
    const [maxCapacity, setMaxCapacity] = useState(0);
    const [maxVolume, setMaxVolume] = useState(0);
    const startIndex = (currentPage - 1) * pageSize;
    const currentData = metroTrains.slice(startIndex, startIndex + pageSize);
    const [statusOptions, setStatusOptions] = useState([]);
    const [statusFilter, setStatusFilter] = useState(null);
    const ALLOWED_STATUSES = [1, 2, 3, 5, 6, 20, 21, 22, 24, 27];
    const [dateRange, setDateRange] = useState([]);
    const [searchCode, setSearchCode] = useState('');
    const getOrderDate = (o) => dayjs(o.createdAt || o.scheduledDateTime);
    const today = dayjs();
    const [parcelCate, setParcelCate] = useState([]);
    const navigate = useNavigate();

    if (!decodedUser?.StationId) {
        return (
            <div style={{
                display: 'flex',
                height: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 600,
            }}>
                Bạn chưa được phân công vào trạm
            </div>
        );
    }

    const onConfirmReturn = (record) => {
        const relatedParcels = getParcelsByShipmentId(record.id);
        setSelectedOrder({ ...record, relatedParcels });
        setConfirmModalOpen(true);
    };

    //API ONE TIME
    useEffect(() => {
        Promise.all([getAllShipments(), getAllParcels(), getMetroTimeSlots(), getAllStations(), getMetroLines(), getMetroTrainsByStation(decodedUser?.StationId), getAllParcelCategories()]).then(
            ([shipmentsData, parcelsData, timeSlotsData, stationData, metroLineData, metroTrainData, parcelCateData]) => {
                setMetroLine(metroLineData)
                setStations(stationData);
                setShipments(shipmentsData.items);
                setParcels(parcelsData);
                setTimeSlots(timeSlotsData);
                setMetroTrains(metroTrainData.items);
                setParcelCate(parcelCateData);

                //ADDITIONAL DATA TRAIN
                const additional = metroTrainData.additionalData?.[0] || [];
                const maxCapacityKg = additional.find(cfg => cfg.configKey === "MAX_CAPACITY_PER_LINE_KG")?.configValue || "N/A";
                const maxVolumeM3 = additional.find(cfg => cfg.configKey === "MAX_CAPACITY_PER_LINE_M3")?.configValue || "N/A";

                setMaxCapacity(maxCapacityKg);
                setMaxVolume(maxVolumeM3);
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


    useEffect(() => {
        const opts = ALLOWED_STATUSES.map(id => ({
            id,
            label: shipmentStatusMap[id] || `Trạng thái ${id}`,
        }));
        setStatusOptions(opts);
    }, []);
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
        //ALLOWED STATUS SHIPMENT FILTER
        //JUST APPEAR THE SHIPMENT DONE
        let filtered = shipments.filter(o => ALLOWED_STATUSES.includes(o.shipmentStatus));

        //STATUS FILTER
        if (statusFilter !== null && statusFilter !== undefined) {
            filtered = filtered.filter(o => o.shipmentStatus === Number(statusFilter));
        }

        //DATE RANGE FILTER
        if (dateRange && dateRange[0] && dateRange[1]) {
            const [start, end] = dateRange;
            filtered = filtered.filter(o => {
                const d = getOrderDate(o);
                return d.isSame(start, 'day') || d.isSame(end, 'day') || (d.isAfter(start, 'day') && d.isBefore(end, 'day'));
            });
        }

        //SEARCH TRACKING CODE
        if (searchCode && searchCode.trim()) {
            const q = searchCode.trim().toLowerCase();
            filtered = filtered.filter(o => (o.trackingCode || '').toLowerCase().includes(q));
        }

        //EXPIRED SHIPMENT
        const hasExpired = shipments.some((item) => item.shipmentStatus === 17);
        setExpiredShipment(hasExpired);

        setFilteredShipments(filtered);
    };

    useEffect(() => {
        if (shipments.length > 0) {
            handleFilterChange();
        }
    }, [shipments, dateFilter, stationFilter, routeFilter, statusFilter, dateRange, searchCode]);


    const baseColumns = [
        {
            title: 'STT',
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
            title: 'Hạn chót gửi hàng',
            dataIndex: 'scheduledDateTime',
            key: 'scheduledTime',
            render: (_, record) => dayjs(record.scheduledDateTime).format('HH:mm'),
        },
        {
            title: 'Thời điểm tạo yêu cầu',
            key: 'createdAt',
            render: (_, record) => dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: 'Tổng chi phí',
            key: 'totalCost',
            render: (_, record) => formatCurrency(record.totalCostVnd),
        },
        {
            title: "Trạng thái",
            dataIndex: "shipmentStatus",
            key: "shipmentStatus",
            render: (status) => (
                <Tag color={shipmentStatusColorMap[status] || "default"}>
                    {shipmentStatusMap[status] || "Không rõ"}
                </Tag>
            ),
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
                                defaultHoverBorderColor: "#0759acff",
                                defaultHoverColor: "white",
                                defaultHoverBg: "#0759acff",
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

    const actionColumn = {
        title: 'Hành động',
        key: 'action',
        render: (_, record) =>
            record.shipmentStatus === 12 && (
                <ConfigProvider
                    theme={{
                        components: {
                            Button: {
                                defaultColor: "black",
                                defaultBg: "#FFC107",
                                defaultBorderColor: "#FFC107",
                                defaultHoverBorderColor: "#ffcb31ff",
                                defaultHoverColor: "black",
                                defaultHoverBg: "#ffcb31ff",
                                defaultActiveBg: "#4CAF50",
                                defaultActiveBorderColor: "#4CAF50",
                                defaultActiveColor: "white",
                            }
                        }
                    }}>
                    <Button className='booking-table-staff_button' onClick={() => onConfirmReturn(record)}>
                        Hoàn đơn
                    </Button>
                </ConfigProvider>

            ),
    };

    const columns = expiredShipment
        ? [...baseColumns, actionColumn]
        : baseColumns;


    const onRowClick = (record) => {
        const relatedParcels = getParcelsByShipmentId(record.id);
        setSelectedOrder({ ...record, relatedParcels });
        navigate(
            PATH_NAME.DASHBOARD_STAFF_ORDER_INFORMATION.replace(
                ":trackingCode",
                record.trackingCode
            )
        );
    };

    const handleResetFilters = () => {
        setDateRange(null);
        setStatusFilter(null);
        setSearchCode('');
        const base = shipments.filter(o => ALLOWED_STATUSES.includes(o.shipmentStatus));
        setFilteredShipments(base);
    };

    return (
        <>
            <div className="order-staff-container">
                <div className="metro-info">
                    <Card style={{ marginBottom: '1em' }}>
                        <Title level={3}>Thông tin nhân viên</Title>
                        <Row gutter={24}>
                            {/* AVATAR */}
                            <Col span={6}>
                                <img
                                    src={StaffIcon}
                                    alt="Metro_Subway"
                                    style={{ width: "5em" }}
                                />
                            </Col>
                            {/* STAFF ASSIGNMENT */}
                            <Col span={18}>
                                <Flex justify="space-between" align="center" style={{ flexWrap: "wrap" }}>
                                    <div className="metro-line-description">
                                        Vai trò
                                        <div className="data">
                                            {decodedUser?.AssignmentRole || "N/A"}
                                        </div>
                                    </div>

                                    <div className="metro-line-description">
                                        Làm việc tại trạm
                                        <div className="data">
                                            {
                                                stations.find(station => station.stationId === decodedUser?.StationId)?.stationNameVi || "N/A"
                                            }
                                        </div>
                                    </div>

                                    <div className="metro-line-description">
                                        Thời gian bắt đầu
                                        <div className="data">
                                            {staffAssignments?.[0]?.fromTime
                                                ? dayjs(staffAssignments[0].fromTime).format("DD/MM/YYYY")
                                                : "N/A"}
                                        </div>
                                    </div>

                                    <div className="metro-line-description">
                                        Thời gian kết thúc
                                        <div className="data">
                                            {staffAssignments?.[0]?.toTime
                                                ? dayjs(staffAssignments[0].toTime).format("DD/MM/YYYY")
                                                : "N/A"}
                                        </div>
                                    </div>
                                </Flex>
                            </Col>
                        </Row>
                    </Card>
                    {/* <Card style={{ marginBottom: '1em' }}>
                        <Title level={3}> {metroTrains.length} tàu hoạt động hiện tại</Title>
                        <Row gutter={16}>
                            {currentData.map((train) => (
                                <Col span={24} key={train.id}>
                                    <Card className="metro-subway-info" style={{ marginBottom: '1em' }}>
                                        <Flex justify="space-between" align="center">
                                            <Flex align="center" gap="small">
                                                <img
                                                    src={MetroStation}
                                                    alt="Metro_Subway"
                                                    style={{ width: "3em" }}
                                                />
                                                <div className="metro-subway-description" style={{ marginLeft: '0.5em' }}>
                                                    Tàu
                                                    <div className="subway-data">{train.trainCode}</div>
                                                </div>
                                            </Flex>
                                            <div className="metro-subway-description">
                                                Trọng tải tàu (kg)
                                                <div className="subway-data">
                                                    {maxCapacity} kg
                                                </div>
                                            </div>
                                            <div className="metro-subway-description">
                                                Dung tích tàu (m³)
                                                <div className="subway-data">
                                                    {maxVolume} m³
                                                </div>
                                            </div>
                                        </Flex>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        <Flex justify="center" style={{ marginTop: "1em" }}>
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={metroTrains.length}
                                onChange={(page) => setCurrentPage(page)}
                            />
                        </Flex>
                    </Card> */}
                </div>

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
                            <Row gutter={[16, 16]}>
                                <Col span={6}>
                                    <ConfigProvider locale={viVN}>
                                        <RangePicker
                                            value={dateRange}
                                            onChange={(v) => setDateRange(v)}
                                            allowClear
                                            style={{ width: '100%' }}
                                        />
                                    </ConfigProvider>
                                </Col>
                                <Col span={6}>
                                    <Select
                                        placeholder="Trạng thái"
                                        style={{ width: '100%' }}
                                        allowClear
                                        value={statusFilter}
                                        onChange={(v) => setStatusFilter(v)}
                                    >
                                        {statusOptions.map((s) => (
                                            <Option key={s.id} value={s.id}>
                                                <Tag color={shipmentStatusColorMap[s.id]}>
                                                    {s.label}
                                                </Tag>
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>
                                <Col span={6}>
                                    <Input.Search
                                        placeholder="Tìm theo mã đơn hàng"
                                        value={searchCode}
                                        onChange={(e) => setSearchCode(e.target.value)}
                                        onSearch={(v) => setSearchCode(v)}
                                        allowClear
                                    />
                                </Col>
                                <Col span={6}>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={handleResetFilters}>
                                    </Button>
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
                            locale={{ emptyText: 'Không có dữ liệu' }}
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
                                                            label: 'Hạn chót gửi hàng',
                                                            value: dayjs(selectedOrder.scheduledDateTime).format('HH:mm') || 'N/A',
                                                        },
                                                        {
                                                            key: 'createdAt',
                                                            label: 'Thời điểm tạo yêu cầu',
                                                            value: dayjs(selectedOrder.createdAt).format('YYYY-MM-DD HH:mm:ss') || 'N/A',
                                                        },
                                                        {
                                                            key: 'totalCost',
                                                            label: 'Tổng chi phí',
                                                            value: formatCurrency(parcel.priceVnd || 0),
                                                        },
                                                        {
                                                            key: 'parcelStatus',
                                                            label: 'Trạng thái kiện hàng',
                                                            value: shipmentStatusMap[selectedOrder.shipmentStatus] || "Không xác nhận"
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
                        <Modal
                            title="Xác nhận hoàn đơn"
                            open={confirmModalOpen}
                            onCancel={() => setConfirmModalOpen(false)}
                            onOk={() => {
                                // Giả sử sau này sẽ gọi API ở đây
                                toast.success('Tạo đơn hàng hoàn thành công!');
                                setConfirmModalOpen(false);
                            }}
                            okText="Xác nhận hoàn đơn"
                            cancelText="Hủy"
                            width={700}
                        >
                            {selectedOrder && (
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <p><strong>Mã đơn hàng:</strong> {selectedOrder.trackingCode}</p>
                                    <p><strong>Trạm gửi:</strong> {selectedOrder.destinationStationName}</p>
                                    <p><strong>Trạm nhận:</strong> {selectedOrder.departureStationName}</p>
                                    <p><strong>Ngày gửi:</strong> {dayjs(selectedOrder.scheduledDateTime).format('DD/MM/YYYY')}</p>
                                    <p><strong>Hạn chót gửi hàng:</strong> {dayjs(selectedOrder.scheduledDateTime).format('HH:mm')}</p>
                                    <p><strong>Tổng chi phí:</strong> {formatCurrency(selectedOrder.totalCostVnd)}</p>

                                    <h4>Danh sách kiện hàng:</h4>
                                    <Table
                                        dataSource={selectedOrder.relatedParcels}
                                        rowKey={(record, index) => record.parcelCode + index}
                                        columns={[
                                            {
                                                title: 'Mã kiện hàng',
                                                dataIndex: 'parcelCode',
                                                key: 'parcelCode',
                                            },
                                            {
                                                title: 'Loại hàng',
                                                dataIndex: ['parcelCategory', 'categoryName'],
                                                key: 'parcelCategory',
                                                render: (_, record) => record.parcelCategory?.categoryName || 'N/A'
                                            },
                                            {
                                                title: 'Trọng lượng quy đổi (kg)',
                                                dataIndex: 'chargeableWeightKg',
                                                key: 'chargeableWeightKg',
                                            },
                                            {
                                                title: 'Thể tích (cm³)',
                                                dataIndex: 'volumeCm3',
                                                key: 'volumeCm3',
                                            },
                                        ]}
                                        pagination={false}
                                        bordered
                                        size="small"
                                    />
                                </Space>
                            )}
                        </Modal>
                    </Card>
                </div>
            </div>
        </>
    )
}

export default HandledOrderStaff
