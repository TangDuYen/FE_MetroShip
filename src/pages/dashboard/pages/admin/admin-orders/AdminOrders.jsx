import "./AdminOrders.scss";

import { Button, DatePicker, Input, Select, Space, Spin, Table } from "antd";
import { useEffect, useState } from "react";

import { getAllShipments } from "../../../../../config/metroApi";
import moment from "moment";
import { ReloadOutlined } from "@ant-design/icons";

const { Option } = Select;
const { RangePicker } = DatePicker;

function AdminOrders() {
  const [shipments, setShipments] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState([]);
  const [stationFilter, setStationFilter] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [searchCode, setSearchCode] = useState("");

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

  const filteredData = shipments.filter((item) => {
    let match = true;
    if (
      statusFilter.length > 0 &&
      !statusFilter.includes(item.shipmentStatus)
    ) {
      match = false;
    }
    if (
      stationFilter.length > 0 &&
      !stationFilter.includes(item.departureStationName)
    ) {
      match = false;
    }

    if (
      searchCode &&
      !item.trackingCode.toLowerCase().includes(searchCode.toLowerCase())
    ) {
      match = false;
    }

    return match;
  });

  const statusMapping = {
    0: "Đợi thanh toán",
    1: "Từ chối",
    2: "Không thanh toán",
    3: "Đã hủy",
    4: "Đợi hoàn tiền",
    5: "Đã hoàn tiền",
    6: "Không xuất hiện",
    7: "Đợi gửi hàng",
    8: "Đã lấy hàng",
    9: "Đang vận chuyển",
    10: "Đợi lấy hàng",
    11: "Thu phí tồn kho",
    12: "Quá hạn",
    13: "Hoàn đơn",
    14: "Đang hoàn đơn",
    15: "Đã hoàn đơn",
    16: "Đợi phản hồi",
    17: "Đã hoàn thành",
    18: "Delayed",
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "trackingCode",
      key: "trackingCode",
    },
    {
      title: "Trạng thái",
      dataIndex: "shipmentStatus",
      key: "shipmentStatus",
      render: (status) => {
        return statusMapping[status] || "Không xác nhận";
      },
    },
    {
      title: "Người gửi",
      dataIndex: "senderName",
      key: "senderName",
    },
    {
      title: "Người nhận",
      dataIndex: "recipientName",
      key: "recipientName",
    },
    {
      title: "Trạm gửi",
      dataIndex: "departureStationName",
      key: "departureStationName",
    },
    {
      title: "Trạm đích",
      dataIndex: "destinationStationName",
      key: "destinationStationName",
    },
    {
      title: "Chi phí (₫)",
      dataIndex: "totalCostVnd",
      key: "totalCostVnd",
      render: (value) => value.toLocaleString("vi-VN"),
    },
    {
      title: "Ngày đặt",
      dataIndex: "bookedAt",
      key: "bookedAt",
      render: (val) => moment(val).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày giao dự kiến",
      dataIndex: "scheduledDateTime",
      key: "scheduledDateTime",
      render: (val) => moment(val).format("DD/MM/YYYY HH:mm"),
    },
  ];

  // Unique station names for filter
  const uniqueStations = [
    ...new Set(shipments.map((s) => s.departureStationName)),
  ];

  return (
    <div className="admin-orders-container">
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Tìm theo mã đơn"
          allowClear
          value={searchCode}
          onSearch={(val) => setSearchCode(val)}
          onChange={(e) => setSearchCode(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          mode="multiple"
          placeholder="Tất cả"
          style={{ width: 200 }}
          allowClear
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
        >
          {Object.entries(statusMapping).map(([key, label]) => (
            <Option key={key} value={Number(key)}>
              {label}
            </Option>
          ))}
        </Select>

        <Select
          mode="multiple"
          placeholder="Chọn trạm gửi"
          style={{ width: 200 }}
          allowClear
          value={stationFilter}
          onChange={(val) => setStationFilter(val)}
        >
          {uniqueStations.map((s) => (
            <Option key={s} value={s}>
              {s}
            </Option>
          ))}
        </Select>

        <DatePicker
          value={dateRange}
          onChange={(val) => setDateRange(val || [])}
          placeholder="Chon ngày đặt"
        />
        <Button
          className="clear-filter-button"
          icon={<ReloadOutlined />}
          onClick={() => {
            setSearchCode("");
            setStatusFilter([]);
            setStationFilter([]);
            setDateRange([]);
          }}
        ></Button>
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
