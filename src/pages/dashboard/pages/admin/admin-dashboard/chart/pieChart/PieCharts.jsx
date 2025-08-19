import React, { useEffect, useState } from "react";
import "./PieCharts.scss";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
} from "recharts";
import api from "../../../../../../../config/axios";
import { Select } from "antd";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"];

// const dataProducts = [
//   { name: "Quần áo", value: 400, change: +4.21 },
//   { name: "Đồ điện tử", value: 300, change: +3.5 },
//   { name: "Hàng dễ vỡ", value: 200, change: -2.58 },
//   { name: "Tài liệu", value: 100, change: -1.37 },
//   { name: "Hàng cồng kềnh", value: 150, change: +2.8 },
//   { name: "Khác", value: 80, change: +1.1 },
// ];

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

function PieCharts() {
  const [chartData, setChartData] = useState([]);
  const [rangeType, setRangeType] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);

  const totalOrders = chartData.reduce((sum, item) => sum + item.value, 0);

  const fetchStatistics = async () => {
    try {
      const res = await api.get(
        `/Report/category-statistics?RangeType=${rangeType}`
      );
      if (res.data?.categories) {
        const chart = res.data.categories.map((item) => ({
          categoryName: item.name,
          value: item.orders,
          change: item.growth,
        }));
        setChartData(chart);
      }
    } catch (err) {
      console.error("Lỗi khi lấy statistics:", err);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [rangeType]);

  return (
    <div className="pie-chart">
      <div className="pie-chart-top">
        <h3>Biểu đồ doanh số theo loại hàng</h3>

        <Select
          value={rangeType}
          style={{ width: 160 }}
          onChange={(value) => setRangeType(value)}
          options={[
            { value: 0, label: "Hôm nay" },
            { value: 1, label: "Tuần này" },
            { value: 2, label: "Tháng này" },
            { value: 3, label: "Năm nay" },
          ]}
        />
      </div>
      <div className="chart-container">
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                nameKey="categoryName"
                labelLine={false}
                label={false}
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} đơn`} />
            </PieChart>
          </ResponsiveContainer>

          <div className="center-label">
            <p className="total">{totalOrders}</p>
            <span>Đơn hàng</span>
          </div>
        </div>

        <ul className="change-info">
          {chartData.map((item, index) => (
            <li key={index} className="change-item">
              <span
                className="dot"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              <span className="label">{item.categoryName}:</span>
              <span
                className={`change ${
                  item.change >= 0 ? "positive" : "negative"
                }`}
              >
                {item.change >= 0 ? "📈" : "📉"} {item.change.toFixed(2)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PieCharts;
