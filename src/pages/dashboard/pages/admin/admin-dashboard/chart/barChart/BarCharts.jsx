import React, { useEffect, useState } from "react";
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
import { InputNumber, Select, Spin, Typography } from "antd";
import { toast } from "react-toastify";
import api from "../../../../../../../config/axios";

const { Option } = Select;
const { Title } = Typography;

function BarCharts() {
  // const dataImportExport = [
  //   { month: "T1", import: 70, export: 55 },
  //   { month: "T2", import: 95, export: 50 },
  //   { month: "T3", import: 60, export: 85 },
  //   { month: "T4", import: 20, export: 75 },
  //   { month: "T5", import: 80, export: 60 },
  //   { month: "T6", import: 65, export: 70 },
  //   { month: "T7", import: 90, export: 95 },
  //   { month: "T8", import: 75, export: 85 },
  //   { month: "T9", import: 55, export: 45 },
  //   { month: "T10", import: 40, export: 60 },
  //   { month: "T11", import: 85, export: 70 },
  //   { month: "T12", import: 60, export: 80 },
  // ];
  const [barData, setBarData] = useState([]);
  const [filterType, setFilterType] = useState(0); // 0=default, 2=year, 3=quarter, 4=monthRange
  const [year, setYear] = useState(2025);
  const [quarter, setQuarter] = useState(1);
  const [startMonth, setStartMonth] = useState(1);
  const [endMonth, setEndMonth] = useState(12);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = "/Report/shipments/feedback-chart";

      if (filterType === 0) {
        url += `?FilterType=0`;
      } else if (filterType === 2) {
        url += `?FilterType=2&Year=${year}`;
      } else if (filterType === 3) {
        url += `?FilterType=3&Year=${year}&Quarter=${quarter}`;
      } else if (filterType === 4) {
        url += `?FilterType=4&Year=${year}&StartMonth=${startMonth}&EndMonth=${endMonth}`;
      }

      const res = await api.get(url);
      const apiData = res.data?.data || [];

      // map dữ liệu phù hợp với BarChart
      const chartData = apiData.map((item) => ({
        month: `T${item.month}`,
        shipments: item.totalShipments,
        feedbacks: item.totalFeedbacks,
        fiveStar: item.fiveStarPercent,
      }));

      setBarData(chartData);
    } catch (err) {
      console.error("Lỗi fetch bar data:", err);
      toast.error("Không thể tải dữ liệu biểu đồ");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filterType, year, quarter, startMonth, endMonth]);

  return (
    <div className="bar-chart-monthly">
      <div className="top">
        <Title level={4}>Thống kê đơn hàng & đánh giá</Title>
        <div className="filters">
          <Select
            value={filterType}
            onChange={(val) => setFilterType(val)}
            style={{ width: 150, marginRight: 10 }}
          >
            <Option value={0}>Tổng quan</Option>
            <Option value={2}>Theo năm</Option>
            <Option value={3}>Theo quý</Option>
            <Option value={4}>Theo khoảng tháng</Option>
          </Select>

          {filterType === 2 && (
            <InputNumber
              value={year}
              onChange={setYear}
              style={{ width: 100, marginRight: 10 }}
            />
          )}

          {filterType === 3 && (
            <>
              <InputNumber
                value={year}
                onChange={setYear}
                style={{ width: 100, marginRight: 10 }}
              />
              <InputNumber
                value={quarter}
                min={1}
                max={4}
                onChange={setQuarter}
                style={{ width: 50, marginRight: 10 }}
              />
            </>
          )}

          {filterType === 4 && (
            <>
              <InputNumber
                value={year}
                onChange={setYear}
                style={{ width: 100, marginRight: 10 }}
              />
              <InputNumber
                value={startMonth}
                min={1}
                max={12}
                onChange={setStartMonth}
                style={{ width: 50, marginRight: 10 }}
              />
              <InputNumber
                value={endMonth}
                min={1}
                max={12}
                onChange={setEndMonth}
                style={{ width: 50, marginRight: 10 }}
              />
            </>
          )}
        </div>
      </div>
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              verticalAlign="top"
              iconType="circle"
            />
            <Bar dataKey="shipments" name="Đơn hàng" fill="#4285F4">
              <LabelList dataKey="shipments" position="top" />
            </Bar>
            <Bar dataKey="feedbacks" name="Feedback" fill="#FB8C00">
              <LabelList dataKey="feedbacks" position="top" />
            </Bar>
            <Bar dataKey="fiveStar" name="5★ (%)" fill="#34A853">
              <LabelList dataKey="fiveStar" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Spin>
    </div>
  );
}

export default BarCharts;
