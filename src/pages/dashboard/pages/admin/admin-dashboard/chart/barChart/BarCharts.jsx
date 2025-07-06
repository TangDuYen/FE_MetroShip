import React from "react";
import "./BarCharts.scss";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

function BarCharts() {
  const dataImportExport = [
    { month: "T1", import: 70, export: 55 },
    { month: "T2", import: 95, export: 50 },
    { month: "T3", import: 60, export: 85 },
    { month: "T4", import: 20, export: 75 },
    { month: "T5", import: 80, export: 60 },
    { month: "T6", import: 65, export: 70 },
    { month: "T7", import: 90, export: 95 },
    { month: "T8", import: 75, export: 85 },
    { month: "T9", import: 55, export: 45 },
    { month: "T10", import: 40, export: 60 },
    { month: "T11", import: 85, export: 70 },
    { month: "T12", import: 60, export: 80 },
  ];
  return (
    <div className="bar-chart-monthly">
      <h3>Khối lượng xuất nhập khẩu theo tháng</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={dataImportExport}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `${value}`} />
          <Legend
            wrapperStyle={{ paddingTop: 10 }}
            verticalAlign="top"
            iconType="circle"
          />
          <Bar dataKey="import" name="Nhập khẩu" fill="#4285F4">
            <LabelList dataKey="import" position="top" />
          </Bar>
          <Bar dataKey="export" name="Xuất khẩu" fill="#FB8C00">
            <LabelList dataKey="export" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarCharts;
