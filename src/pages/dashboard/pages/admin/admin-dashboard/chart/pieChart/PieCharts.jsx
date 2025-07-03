import React, { useState } from "react";
import "./PieCharts.scss";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
} from "recharts";

const COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#FF9F40",
  "#4BC0C0",
  "#9966FF",
];

const dataProducts = [
  { name: "Quần áo", value: 400, change: +4.21 },
  { name: "Đồ điện tử", value: 300, change: +3.5 },
  { name: "Hàng dễ vỡ", value: 200, change: -2.58 },
  { name: "Tài liệu", value: 100, change: -1.37 },
  { name: "Hàng cồng kềnh", value: 150, change: +2.8 },
  { name: "Khác", value: 80, change: +1.1 },
];

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
  const totalOrders = dataProducts.reduce((sum, item) => sum + item.value, 0);
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="pie-chart">
      <h3>Biểu đồ doanh số theo loại hàng</h3>

      <div className="chart-container">
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataProducts}
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                labelLine={false}
                label={false}
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {dataProducts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
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
          {dataProducts.map((item, index) => (
            <li key={index} className="change-item">
              <span
                className="dot"
                style={{ backgroundColor: COLORS[index] }}
              ></span>
              <span className="label">{item.name}:</span>
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
