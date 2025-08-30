import React, { useEffect, useMemo, useState } from "react";
import "./TransactionManagement.scss";
import {
  getAllShipments,
  getAllTransactions,
} from "../../../../../config/metroApi";
import {
  Button,
  ConfigProvider,
  DatePicker,
  Empty,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
} from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  paymentStatusColorMap,
  paymentStatusMap,
  paymentTransactionTypeColorMap,
  paymentTransactionTypeMap,
} from "../../../../../constants/statusMap";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

function TransactionManagement() {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [shipments, setShipments] = useState({});
  const [filters, setFilters] = useState({
    transactionType: null,
    paymentStatus: null,
    orderCode: "",
    date: null,
    dateRange: [],
  });
  const [activeTab, setActiveTab] = useState("today");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const shipmentRes = await getAllShipments();
      const map = {};
      shipmentRes.items.forEach((s) => {
        map[s.id] = s.trackingCode;
      });
      setShipments(map);

      const data = await getAllTransactions();
      setTransactions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const paymentDateStr = t.paymentDate
        ? dayjs(t.paymentDate).format("YYYY-MM-DD")
        : null;
      // filter theo tab
      if (activeTab === "today") {
        const today = dayjs().format("YYYY-MM-DD");
        if (paymentDateStr !== today) return false;
      } else if (activeTab === "others") {
        if (filters.date) {
          const filterDate = filters.date.format("YYYY-MM-DD");
          if (paymentDateStr !== filterDate) return false;
        }

        if (filters.dateRange?.length === 2) {
          const [from, to] = filters.dateRange;
          if (
            !dayjs(paymentDateStr).isBetween(
              from.startOf("day"),
              to.endOf("day"),
              "day",
              "[]"
            )
          ) {
            return false;
          }
        }
      }

      // filter theo transactionType
      if (
        filters.transactionType &&
        t.transactionType !== filters.transactionType
      )
        return false;

      // filter theo paymentStatus
      if (filters.paymentStatus && t.paymentStatus !== filters.paymentStatus)
        return false;

      // filter theo orderCode
      if (filters.orderCode) {
        const trackingCode = shipments[t.shipmentId] || "";
        if (!trackingCode.includes(filters.orderCode)) return false;
      }

      return true;
    });
  }, [transactions, filters, activeTab, shipments]);

  const clearFilters = () => {
    setFilters({
      transactionType: null,
      paymentStatus: null,
      orderCode: "",
      date: null,
      dateRange: [],
    });
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "shipmentId",
      render: (val) => shipments[val] || "-",
      width: 300,
    },
    {
      title: "Mã giao dịch",
      dataIndex: "paymentTrackingId",
      width: 200,
    },
    {
      title: "Loại giao dịch",
      dataIndex: "transactionType",
      render: (val) => (
        <Tag color={paymentTransactionTypeColorMap[val]}>
          {paymentTransactionTypeMap[val] || val}
        </Tag>
      ),
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "paymentStatus",
      render: (val) => (
        <Tag color={paymentStatusColorMap[val]}>
          {paymentStatusMap[val] || val}
        </Tag>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "paymentAmount",
      render: (_, record) =>
        record.paymentAmount
          ? record.paymentAmount.toLocaleString() +
            " " +
            (record.paymentCurrency || "")
          : "-",
    },

    {
      title: "Ngày thanh toán",
      dataIndex: "paymentDate",
      render: (val) => (val ? dayjs(val).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Giờ thanh toán",
      dataIndex: "paymentDate",
      render: (val) => (val ? dayjs(val).format("HH:mm") : "-"),
    },
  ];

  const renderFilters = () => (
    <Space wrap style={{ marginBottom: 16 }}>
      <Input.Search
        placeholder="Tìm mã đơn hàng"
        allowClear
        style={{ width: 200 }}
        value={filters.orderCode}
        onChange={(e) => setFilters({ ...filters, orderCode: e.target.value })}
      />

      <Select
        allowClear
        placeholder="Loại giao dịch"
        style={{ width: 180 }}
        value={filters.transactionType}
        onChange={(v) => setFilters({ ...filters, transactionType: v })}
        options={Object.keys(paymentTransactionTypeMap).map((key) => ({
          label: (
            <Tag color={paymentTransactionTypeColorMap[key]}>
              {paymentTransactionTypeMap[key]}
            </Tag>
          ),
          value: Number(key),
        }))}
      />

      <Select
        allowClear
        placeholder="Trạng thái thanh toán"
        style={{ width: 200 }}
        value={filters.paymentStatus}
        onChange={(v) => setFilters({ ...filters, paymentStatus: v })}
        options={Object.keys(paymentStatusMap).map((key) => ({
          label: (
            <Tag color={paymentStatusColorMap[key]}>
              {paymentStatusMap[key]}
            </Tag>
          ),
          value: Number(key),
        }))}
      />

      {activeTab === "others" && (
        <>
          <DatePicker
            placeholder="Chọn ngày"
            format="DD/MM/YYYY"
            value={filters.date}
            onChange={(date) => setFilters({ ...filters, date })}
          />
          <RangePicker
            format="DD/MM/YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
            value={filters.dateRange}
            onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
          />
        </>
      )}

      <Button icon={<ReloadOutlined />} onClick={clearFilters}></Button>
    </Space>
  );
  return (
    <div className="transaction-management-container">
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={[
            { key: "today", label: "Hôm nay" },
            { key: "others", label: "Những ngày khác" },
          ]}
        />
      </div>
      {renderFilters()}

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <ConfigProvider
          renderEmpty={() => (
            <Empty
              description="Không có giao dịch"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        >
          <Table
            columns={columns}
            dataSource={filteredTransactions}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </ConfigProvider>
      </Spin>
    </div>
  );
}

export default TransactionManagement;
