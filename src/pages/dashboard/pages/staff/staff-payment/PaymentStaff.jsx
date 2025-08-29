import "./PaymentStaff.scss";
import "dayjs/locale/vi";

import { Button, Col, ConfigProvider, DatePicker, Input, Row, Select, Table, Tag } from "antd";
import { MinusCircleOutlined, PlusCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { formatCurrency1, paymentStatusColorMap, paymentStatusMap, paymentTransactionTypeColorMap, paymentTransactionTypeMap } from "../../../../../constants/statusMap";
import { getAllShipments, getAllTransactions } from "../../../../../config/metroApi";
import { useEffect, useState } from "react";

import dayjs from "dayjs";
import { toast } from "react-toastify";
import viVN from "antd/lib/locale/vi_VN";

dayjs.locale("vi");
const { RangePicker } = DatePicker;
const { Search } = Input;
const { Option } = Select;

function PaymentStaff() {
  const [allPayments, setAllPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);

  //FILTER STATE
  const [dateRange, setDateRange] = useState(null);
  const [searchTracking, setSearchTracking] = useState("");
  const [searchTransaction, setSearchTransaction] = useState("");
  const [filterTransactionType, setFilterTransactionType] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shipmentsRes, paymentsRes] = await Promise.all([
          getAllShipments(),
          getAllTransactions(),
        ]);

        const shipments = shipmentsRes.items || [];
        const payments = paymentsRes || [];

        const shipmentMap = {};
        shipments.forEach((s) => {
          shipmentMap[s.id] = s.trackingCode;
        });

        const formatted = payments.map((item, index) => {
          const methodMap = {
            1: "Tiền mặt",
            2: "VNPay",
            3: "MoMo",
          };

          return {
            key: item.paymentTrackingId || index,
            stt: index + 1,
            trackingCode: shipmentMap[item.shipmentId] || "Không tìm thấy",
            shipmentId: item.shipmentId,
            paymentTrackingId: item.paymentTrackingId || "N/A",
            paymentMethod: methodMap[item.paymentMethod] || "Không rõ",
            paymentStatus: item.paymentStatus || "Không rõ",
            paymentDate: item.paymentDate,
            paymentTime: item.paymentTime,
            paymentAmount: item.paymentAmount,
            paymentCurrency: item.paymentCurrency || "VND",
            transactionType: item.transactionType,
          };
        });

        setAllPayments(formatted);
        setFilteredPayments(formatted);
      } catch (error) {
        toast.error("Lỗi khi lấy dữ liệu thanh toán hoặc đơn hàng");
        console.error(error);
      }
    };

    fetchData();
  }, []);

  //APPLY FILTER
  useEffect(() => {
    let data = [...allPayments];

    if (dateRange && dateRange.length === 2) {
      data = data.filter((p) => {
        const payTime = dayjs(p.paymentTime);
        return payTime.isAfter(dateRange[0]) && payTime.isBefore(dateRange[1]);
      });
    }

    if (searchTracking) {
      data = data.filter((p) =>
        p.trackingCode?.toLowerCase().includes(searchTracking.toLowerCase())
      );
    }

    if (searchTransaction) {
      data = data.filter((p) =>
        p.paymentTrackingId?.toLowerCase().includes(searchTransaction.toLowerCase())
      );
    }

    if (filterTransactionType) {
      data = data.filter((p) => p.transactionType === filterTransactionType);
    }

    if (filterStatus) {
      data = data.filter((p) => p.paymentStatus === filterStatus);
    }

    setFilteredPayments(data);
  }, [dateRange, searchTracking, searchTransaction, filterTransactionType, filterStatus, allPayments]);

  const resetFilter = () => {
    setDateRange(null);
    setSearchTracking("");
    setSearchTransaction("");
    setFilterTransactionType(null);
    setFilterStatus(null);
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 60,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "trackingCode",
      key: "trackingCode",
    },
    {
      title: "Mã giao dịch",
      dataIndex: "paymentTrackingId",
      key: "paymentTrackingId",
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Thời điểm tạo giao dịch",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (value) =>
        value && value !== "0001-01-01T00:00:00+00:00"
          ? dayjs(value).format("YYYY-MM-DD HH:mm:ss")
          : "Chưa xác định",
    },
    {
      title: "Thời điểm thanh toán",
      dataIndex: "paymentTime",
      key: "paymentTime",
      render: (value) =>
        value && value !== "0001-01-01T00:00:00+00:00"
          ? dayjs(value).format("YYYY-MM-DD HH:mm:ss")
          : "Chưa xác định",
    },
    {
      title: "Tổng chi phí",
      dataIndex: "paymentAmount",
      key: "paymentAmount",
      render: (value, record) => {
        if ([1, 2].includes(record.transactionType)) {
          return (
            <span style={{ color: "green" }}>
              <PlusCircleOutlined /> {formatCurrency1(value)}
            </span>
          );
        }
        if ([3, 4].includes(record.transactionType)) {
          return (
            <span style={{ color: "red" }}>
              <MinusCircleOutlined /> {formatCurrency1(value)}
            </span>
          );
        }
        return formatCurrency1(value);
      },
    },
    {
      title: "Đơn vị tiền tệ",
      dataIndex: "paymentCurrency",
      key: "paymentCurrency",
    },
    {
      title: "Loại giao dịch",
      dataIndex: "transactionType",
      key: "transactionType",
      render: (status) =>
        <Tag color={paymentTransactionTypeColorMap[status]}>
          {paymentTransactionTypeMap[status] || "N/A"}
        </Tag>
    },
    {
      title: "Trạng thái",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (payment) =>
        <Tag color={paymentStatusColorMap[payment]}>
          {paymentStatusMap[payment] || "N/A"}
        </Tag>
    },
  ];

  return (
    <div className="payment-staff-container">
      {/* FILTER UI */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={6}>
          <ConfigProvider locale={viVN}>
            <RangePicker
              style={{ width: "100%" }}
              value={dateRange}
              onChange={(val) => setDateRange(val)}
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </ConfigProvider>
        </Col>
        <Col xs={24} md={4}>
          <Search
            placeholder="Mã đơn hàng"
            allowClear
            value={searchTracking}
            onChange={(e) => setSearchTracking(e.target.value)}
          />
        </Col>
        <Col xs={24} md={4}>
          <Search
            placeholder="Mã giao dịch"
            allowClear
            value={searchTransaction}
            onChange={(e) => setSearchTransaction(e.target.value)}
          />
        </Col>
        <Col xs={24} md={4}>
          <Select
            placeholder="Loại giao dịch"
            allowClear
            style={{ width: "100%" }}
            value={filterTransactionType}
            onChange={(val) => setFilterTransactionType(val)}
          >
            {Object.entries(paymentTransactionTypeMap).map(([key, label]) => (
              <Option key={key} value={parseInt(key, 10)}>
                <Tag color={paymentTransactionTypeColorMap[key]}>
                  {label}
                </Tag>
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={4}>
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: "100%" }}
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
          >
            {Object.entries(paymentStatusMap).map(([key, label]) => (
              <Option key={key} value={parseInt(key, 10)}>
                <Tag color={paymentStatusColorMap[key]}>
                  {label}
                </Tag>
              </Option>
            ))}
          </Select>
        </Col>
        <Col flex="none">
          <Button icon={<ReloadOutlined />} onClick={resetFilter} />
        </Col>
      </Row>

      {/* TABLE */}
      <Table
        columns={columns}
        dataSource={filteredPayments}
        rowKey="key"
        pagination={{ pageSize: 10 }}
        bordered
        style={{ cursor: "pointer" }}
        locale={{ emptyText: "Không có dữ liệu" }}
      />
    </div>
  );
}

export default PaymentStaff;
