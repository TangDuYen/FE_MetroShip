import "./HistoryPayment.scss";
import React, { useEffect, useState } from "react";
import {
  paymentStatusColorMap,
  paymentStatusMap,
  paymentTransactionTypeMap,
} from "../../constants/statusMap";
import { MdSearch } from "react-icons/md";
import Sidebar from "../../components/sidebar_profile/Sidebar";
import api from "../../config/axios";
import { getAllCustomerShipments } from "../../config/metroApi";
import {
  Button,
  Card,
  ConfigProvider,
  DatePicker,
  Empty,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title } = Typography;

function HistoryPayment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [dateRange, setDateRange] = useState([]);
  const [filterStatus, setFilterStatus] = useState(null);
  const [allPayments, setAllPayments] = useState([]);
  const [shipmentsMap, setShipmentsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [quickDateFilter, setQuickDateFilter] = useState(null);
  const [showRangePicker, setShowRangePicker] = useState(false);

  useEffect(() => {
    async function fetchShipments() {
      try {
        setLoading(true);
        const data = await getAllCustomerShipments();
        const map = {};
        data.forEach((item) => {
          map[item.id] = item.trackingCode;
        });
        setShipmentsMap(map);
      } catch (err) {
        console.error("Error fetching shipments:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchShipments();
  }, []);

  useEffect(() => {
    if (Object.keys(shipmentsMap).length === 0) return; // chờ map có data

    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await api.get("/transactions?PageSize=1000");
        const items = res.data?.data?.items || [];

        const methodMap = {
          1: "Tiền mặt",
          2: "VNPay",
          3: "MoMo",
        };

        const formatted = items.map((item, index) => ({
          id: index + 1,
          trackingCode: shipmentsMap[item.shipmentId] || "Chưa rõ",
          method: methodMap[item.paymentMethod] || "Không rõ",
          status: paymentStatusMap[item.paymentStatus] || "Không rõ",
          statusEnum: item.paymentStatus,
          amount: item.paymentAmount || 0,
          date:
            item.paymentTime && item.paymentTime !== "0001-01-01T00:00:00+00:00"
              ? new Date(item.paymentTime).toLocaleDateString("vi-VN")
              : "Chưa xác định",
          rawDate: item.paymentTime,
          type: paymentTransactionTypeMap[item.transactionType] || "Không rõ",
        }));

        setAllPayments(formatted);
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử thanh toán:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [shipmentsMap]);

  const filteredPayments = allPayments.filter((item) => {
    const matchSearch =
      (item.trackingCode?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (item.method?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchStatus =
      !filterStatus || item.statusEnum === Number(filterStatus);

    const matchDateRange =
      dateRange.length === 0 ||
      (item.rawDate &&
        dayjs(item.rawDate).isAfter(dayjs(dateRange[0]).startOf("day")) &&
        dayjs(item.rawDate).isBefore(dayjs(dateRange[1]).endOf("day")));

    return matchSearch && matchStatus && matchDateRange;
  });

  const getDateRange = (filter) => {
    const today = dayjs();
    switch (filter) {
      case "today": {
        return [today.startOf("day"), today.endOf("day")];
      }
      case "yesterday": {
        const yesterday = today.subtract(1, "day");
        return [yesterday.startOf("day"), yesterday.endOf("day")];
      }
      case "7days": {
        return [today.subtract(6, "day").startOf("day"), today.endOf("day")];
      }
      case "14days": {
        return [today.subtract(13, "day").startOf("day"), today.endOf("day")];
      }
      case "30days": {
        return [today.subtract(29, "day").startOf("day"), today.endOf("day")];
      }
      case "thisMonth": {
        return [today.startOf("month"), today.endOf("month")];
      }
      case "lastMonth": {
        const lastMonth = today.subtract(1, "month");
        return [lastMonth.startOf("month"), lastMonth.endOf("month")];
      }
      default: {
        return [];
      }
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => (currentPage - 1) * itemsPerPage + index + 1,
      width: 60,
    },
    { title: "Mã đơn hàng", dataIndex: "trackingCode" },
    { title: "Loại giao dịch", dataIndex: "type" },
    { title: "Phương thức", dataIndex: "method" },
    {
      title: "Số tiền",
      dataIndex: "amount",
      render: (val) => `${val.toLocaleString("vi-VN")}đ`,
    },
    { title: "Ngày giao dịch", dataIndex: "date" },
    // {
    //   title: "Chi tiết",
    //   render: () => <Button type="link">Chi tiết</Button>,
    // },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (_, record) => (
        <Tag color={paymentStatusColorMap[record.statusEnum] || "default"}>
          {paymentStatusMap[record.statusEnum] || "Không rõ"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="history-payment">
      <section className="history-payment-wrapper">
        <div className="history-payment-row">
          <div className="history-payment-left">
            <Sidebar />
          </div>
          <div className="history-payment-right">
            <Card title="DANH SÁCH GIAO DỊCH CỦA BẠN" bordered={false}>
              <Space style={{ marginBottom: 16 }}>
                <Input.Search
                  placeholder="Nhập mã giao dịch, phương thức"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: 300 }}
                />
                <Select
                  style={{ width: 200 }}
                  placeholder="Trạng thái"
                  allowClear
                  value={filterStatus}
                  onChange={(val) => setFilterStatus(val)}
                >
                  {Object.entries(paymentStatusMap).map(([key, label]) => (
                    <Option key={key} value={key}>
                      <Tag color={paymentStatusColorMap[key]}>{label}</Tag>
                    </Option>
                  ))}
                </Select>
                <Select
                  style={{ width: 200 }}
                  placeholder="Chọn khoảng thời gian"
                  allowClear
                  value={quickDateFilter}
                  onChange={(val) => {
                    setQuickDateFilter(val);

                    if (val === "custom") {
                      setShowRangePicker(true);
                      setDateRange([]);
                    } else {
                      setDateRange(getDateRange(val));
                      setShowRangePicker(true);
                    }
                  }}
                >
                  <Option value="today">Hôm nay</Option>
                  <Option value="yesterday">Hôm qua</Option>
                  <Option value="7days">7 ngày trước</Option>
                  <Option value="14days">14 ngày trước</Option>
                  <Option value="30days">30 ngày trước</Option>
                  <Option value="thisMonth">Tháng này</Option>
                  <Option value="lastMonth">Tháng trước</Option>
                  <Option value="custom">Tùy chọn</Option>
                </Select>

                {showRangePicker && (
                  <RangePicker
                    format="DD/MM/YYYY"
                    placeholder={["Từ ngày", "Đến ngày"]}
                    value={dateRange}
                    onChange={(values) => setDateRange(values || [])}
                    style={{ width: 300, marginLeft: 8 }}
                  />
                )}

                <Button
                  className="clear-filter-button"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus(null);
                    setDateRange([]);
                    setQuickDateFilter(null);
                    setShowRangePicker(false);
                  }}
                ></Button>
              </Space>
              <Spin spinning={loading} tip="Đang tải dữ liệu...">
                <ConfigProvider
                  renderEmpty={() => (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_DEFAULT}
                      description="Không có dữ liệu"
                    />
                  )}
                >
                  <Table
                    columns={columns}
                    dataSource={filteredPayments}
                    pagination={{ pageSize: 10 }}
                    bordered
                  />
                </ConfigProvider>
              </Spin>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HistoryPayment;
