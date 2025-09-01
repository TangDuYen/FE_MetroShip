import React, { useEffect, useState } from "react";
import "./LineCharts.scss";
import {
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Area,
  AreaChart,
} from "recharts";
import api from "../../../../../../../config/axios";
import { Button, InputNumber, message, Select, Spin, Typography } from "antd";

const { Title } = Typography;

function LineCharts() {
  // const lineData = [
  //   { month: "Tháng 1", revenue: 3600 },
  //   { month: "Tháng 2", revenue: 1900 },
  //   { month: "Tháng 3", revenue: 800 },
  //   { month: "Tháng 4", revenue: 2700 },
  //   { month: "Tháng 5", revenue: 3900 },
  //   { month: "Tháng 6", revenue: 4200 },
  //   { month: "Tháng 7", revenue: 5247 },
  //   { month: "Tháng 8", revenue: 7800 },
  // ];

  const [lineData, setLineData] = useState([]);
  const [filterType, setFilterType] = useState(0); // 0=default, 1=year, 2=quarter, 3=monthRange
  const [year, setYear] = useState(2025);
  const [quarter, setQuarter] = useState(1);
  const [startMonth, setStartMonth] = useState(1);
  const [endMonth, setEndMonth] = useState(12);
  const [loading, setLoading] = useState(false);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      let url = "/Report/transaction-chart";

      if (filterType === 0) {
        url += `?FilterType=0`; // default
      } else if (filterType === 1) {
        url += `?FilterType=2&Year=${year}`;
      } else if (filterType === 2) {
        url += `?FilterType=3&Year=${year}&Quarter=${quarter}`;
      } else if (filterType === 3) {
        url += `?FilterType=4&Year=${year}&StartMonth=${startMonth}&EndMonth=${endMonth}`;
      }

      const res = await api.get(url);
      const apiData = res.data?.data || [];

      let chartData;
      if (apiData.length === 0) {
        chartData = Array.from({ length: 12 }, (_, i) => ({
          month: `T${i + 1}`,
          revenue: 0,
          growth: 0,
        }));
      } else {
        chartData = apiData.map((item) => ({
          month: `T${item.month}`,
          revenue: item.totalPaidAmount,
          growth: item.paidAmountGrowthPercent,
        }));
      }

      setLineData(chartData);
    } catch (err) {
      console.error("Lỗi fetch revenue:", err);
      message.error("Không thể tải dữ liệu");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRevenue();
  }, [filterType, year, quarter, startMonth, endMonth]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const revenue = payload[0]?.payload?.revenue;
      const growth = payload[0]?.payload?.growth;
      return (
        <div className="tooltip-box">
          <p>
            <strong>{label}</strong>
          </p>
          <p>Doanh thu: {revenue.toLocaleString()} đ</p>
          <p>Tăng trưởng: {growth}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-line">
      <div className="line-top">
        
        <Title level={4}>Lịch sử doanh thu</Title>

        <div className="filter-section">
          <Select
            value={filterType}
            onChange={(val) => setFilterType(val)}
            style={{ width: 150, marginRight: 10 }}
          >
            <Option value={0}>Tất cả</Option>
            <Option value={1}>Theo năm</Option>
            <Option value={2}>Theo quý</Option>
            <Option value={3}>Theo khoảng tháng</Option>
          </Select>

          {filterType === 1 && (
            <InputNumber
              value={year}
              onChange={(val) => setYear(val)}
              style={{ width: 100, marginRight: 10 }}
            />
          )}

          {filterType === 2 && (
            <>
              <InputNumber
                value={year}
                onChange={(val) => setYear(val)}
                style={{ width: 100, marginRight: 10 }}
              />
              <InputNumber
                value={quarter}
                min={1}
                max={4}
                onChange={(val) => setQuarter(val)}
                style={{ width: 100, marginRight: 10 }}
              />
            </>
          )}

          {filterType === 3 && (
            <>
              <InputNumber
                value={year}
                onChange={(val) => setYear(val)}
                style={{ width: 100, marginRight: 10 }}
              />
              <InputNumber
                value={startMonth}
                min={1}
                max={12}
                onChange={(val) => setStartMonth(val)}
                style={{ width: 100, marginRight: 10 }}
              />
              <InputNumber
                value={endMonth}
                min={1}
                max={12}
                onChange={(val) => setEndMonth(val)}
                style={{ width: 100, marginRight: 10 }}
              />
            </>
          )}

          {/* <Button type="primary" onClick={fetchRevenue}>
            Xem
          </Button> */}
        </div>
      </div>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={lineData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip content={CustomTooltip} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Spin>
    </div>
  );
}

export default LineCharts;
