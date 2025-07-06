import React from "react";
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

function LineCharts() {
  const lineData = [
    { month: "Tháng 1", revenue: 3600 },
    { month: "Tháng 2", revenue: 1900 },
    { month: "Tháng 3", revenue: 800 },
    { month: "Tháng 4", revenue: 2700 },
    { month: "Tháng 5", revenue: 3900 },
    { month: "Tháng 6", revenue: 4200 },
    { month: "Tháng 7", revenue: 5247 },
    { month: "Tháng 8", revenue: 7800 },
  ];

 const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const revenue = payload[0]?.payload?.revenue;
    return (
      <div className="tooltip-box"
      >
        <p><strong>{label}</strong></p>
        <p>Doanh thu: {revenue.toLocaleString()} đ</p>
      </div>
    );
  }
  return null;
};

  return (
    <div className="card-line">
      <h3>Lịch sử doanh thu</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
        data={lineData}
        
      >
        <defs>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip content={CustomTooltip}/>

        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#3B82F6"
          fillOpacity={1}
          fill="url(#colorPv)"
        />
      </AreaChart>
      </ResponsiveContainer>
      
    </div>
  );
}

export default LineCharts;
