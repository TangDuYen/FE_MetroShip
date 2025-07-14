import './AdminOrders.scss';

import { DatePicker, Select, Space, Spin, Table } from 'antd';
import { useEffect, useState } from 'react';

import { getAllShipments } from '../../../../../config/metroApi';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

function AdminOrders() {
    const [shipments, setShipments] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState(null);
    const [stationFilter, setStationFilter] = useState(null);
    const [dateRange, setDateRange] = useState([]);

    useEffect(() => {
        fetchShipments();
    }, []);

    const fetchShipments = async () => {
        setLoading(true);
        try {
            const data = await getAllShipments();
            setShipments(data.items || []);
            setStatusOptions(data.additionalData || []);
        } catch (err) {
            console.error("Lỗi khi tải đơn hàng", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = shipments.filter(item => {
        let match = true;
        if (statusFilter !== null && item.shipmentStatus !== statusFilter) match = false;
        if (stationFilter && item.departureStationName !== stationFilter) match = false;
        
        return match;
    });

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: 'trackingCode',
            key: 'trackingCode',
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
            title: 'Người gửi',
            dataIndex: 'senderName',
            key: 'senderName',
        },
        {
            title: 'Người nhận',
            dataIndex: 'recipientName',
            key: 'recipientName',
        },
        {
            title: 'Trạm gửi',
            dataIndex: 'departureStationName',
            key: 'departureStationName',
        },
        {
            title: 'Trạm đích',
            dataIndex: 'destinationStationName',
            key: 'destinationStationName',
        },
        {
            title: 'Chi phí (₫)',
            dataIndex: 'totalCostVnd',
            key: 'totalCostVnd',
            render: (value) => value.toLocaleString('vi-VN'),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'bookedAt',
            key: 'bookedAt',
            render: (val) => moment(val).format('DD/MM/YYYY'),
        },
        {
            title: 'Ngày giao dự kiến',
            dataIndex: 'scheduledDateTime',
            key: 'scheduledDateTime',
            render: (val) => moment(val).format('DD/MM/YYYY HH:mm'),
        },
    ];

    // Unique station names for filter
    const uniqueStations = [...new Set(shipments.map(s => s.departureStationName))];

    return (
        <div className="admin-orders-container">

            <Space style={{ marginBottom: 16 }} wrap>
                <Select
                    placeholder="Tất cả"
                    style={{ width: 200 }}
                    allowClear
                    onChange={(val) => setStatusFilter(val)}
                >
                    {statusOptions.map((s) => (
                        <Option key={s.id} value={s.id}>{s.value}</Option>
                    ))}
                </Select>

                <Select
                    placeholder="Chọn trạm gửi"
                    style={{ width: 200 }}
                    allowClear
                    onChange={(val) => setStationFilter(val)}
                >
                    {uniqueStations.map((s) => (
                        <Option key={s} value={s}>{s}</Option>
                    ))}
                </Select>

                <DatePicker onChange={(val) => setDateRange(val || [])} />
            </Space>

            <Spin spinning={loading} tip="Đang tải dữ liệu...">
                <Table
                    dataSource={filteredData}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Spin>
        </div>
    );
}

export default AdminOrders;
