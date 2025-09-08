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
const now = new Date();
  const [lineData, setLineData] = useState([]);
  const [filterType, setFilterType] = useState(0);
  const [year, setYear] = useState(now.getFullYear());
  const [quarter, setQuarter] = useState(1);
  const [startMonth, setStartMonth] = useState(now.getMonth() + 1);
  const [endMonth, setEndMonth] = useState(now.getMonth() + 1);
  const [week, setWeek] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      let url = "/Report/transaction-chart";

      if (filterType === 0) {
        url += `?FilterType=0`;
      } else if (filterType === 2) {
        url += `?FilterType=2&Week=${week}&StartMonth=${startMonth}`;
      } else if (filterType === 3) {
        url += `?FilterType=3&Year=${year}`;
      } else if (filterType === 4) {
        url += `?FilterType=4&Year=${year}&Quarter=${quarter}`;
      } else if (filterType === 5) {
        url += `?FilterType=5&Year=${year}&StartMonth=${startMonth}&EndMonth=${endMonth}`;
      }

      const res = await api.get(url);
      const apiData = res.data?.data || [];

      let chartData;
      if (apiData.length === 0) {
        chartData = Array.from({ length: 12 }, (_, i) => ({
          month: `T${i + 1}`,
          income: 0,
          refund: 0,
          compensation: 0,
          growth: 0,
        }));
      } else {
        if (filterType === 2) {
          // theo tuần → hiển thị từng ngày
          chartData = apiData.map((item) => ({
            day: `${item.day}/${item.month}`, // nhãn XAxis
            income: item.totalIncome,
            refund: item.refund,
            compensation: item.compensation,
            growth: item.netGrowthPercent,
          }));
        } else {
          // mặc định theo tháng
          chartData = apiData.map((item) => ({
            month: `T${item.month}`,
            income: item.totalIncome,
            refund: item.refund,
            compensation: item.compensation,
            growth: item.netGrowthPercent,
          }));
        }
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
  }, [filterType, year, quarter, startMonth, endMonth, week]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const income = payload[0]?.payload?.income;
      const refund = payload[0]?.payload?.refund;
      const compensation = payload[0]?.payload?.compensation;
      const growth = payload[0]?.payload?.growth;
      return (
        <div className="tooltip-box">
          <p>
            <strong>{label}</strong>
          </p>
          <p>Doanh thu: {income.toLocaleString()} đ</p>
          <p>Hoàn tiền: {refund.toLocaleString()} đ</p>
          <p>Bồi thường: {compensation.toLocaleString()} đ</p>
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
            <Option value={0}>Tổng quan</Option>
            <Option value={2}>Theo tuần</Option>
            <Option value={3}>Theo năm</Option>
            <Option value={4}>Theo quý</Option>
            <Option value={5}>Theo khoảng tháng</Option>
          </Select>

          {filterType === 2 && (
            <>
              <InputNumber
                value={week}
                min={1}
                max={53}
                onChange={(val) => setWeek(val)}
                style={{ width: 100, marginRight: 10 }}
                placeholder="Tuần"
              />
              <InputNumber
                value={startMonth}
                min={1}
                max={12}
                onChange={(val) => setStartMonth(val)}
                style={{ width: 100, marginRight: 10 }}
                placeholder="Tháng"
              />
            </>
          )}
          {filterType === 3 && (
            <InputNumber
              value={year}
              onChange={(val) => setYear(val)}
              style={{ width: 100, marginRight: 10 }}
            />
          )}

          {filterType === 4 && (
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

          {filterType === 5 && (
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
        <div className="legend-container">
          <div className="legend-items">
            <div className="legend-item revenue">
              <div className="color-box" />
              <span>Doanh thu</span>
            </div>
            <div className="legend-item refund">
              <div className="color-box" />
              <span>Hoàn tiền</span>
            </div>
            <div className="legend-item compensation">
              <div className="color-box" />
              <span>Bồi thường</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={lineData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRefund" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="colorCompensation"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey={filterType === 2 ? "day" : "month"} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip content={CustomTooltip} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="refund"
              stroke="#EF4444"
              fillOpacity={1}
              fill="url(#colorRefund)"
            />
            <Area
              type="monotone"
              dataKey="compensation"
              stroke="#F59E0B"
              fillOpacity={1}
              fill="url(#colorCompensation)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Spin>
    </div>
  );
}

export default LineCharts;
