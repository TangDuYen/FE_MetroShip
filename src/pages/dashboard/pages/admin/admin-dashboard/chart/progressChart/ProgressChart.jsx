import React, { useEffect, useState } from "react";
import "./ProgressChart.scss";
import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import {
  Button,
  DatePicker,
  InputNumber,
  Select,
  Spin,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import api from "../../../../../../../config/axios";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title } = Typography;
function ProgressChart() {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);

  // filter states
  const [filterType, setFilterType] = useState(0);
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [year, setYear] = useState(dayjs().year());
  const [quarter, setQuarter] = useState(1);
  const [startMonth, setStartMonth] = useState(dayjs().month() + 1);
  const [endMonth, setEndMonth] = useState(12);
  const [week, setWeek] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = "/Report/activity-metrics";

      if (filterType === 0) {
        url += `?FilterType=0`;
      } else if (filterType === 1) {
        url += `?FilterType=1&Date=${date || dayjs().format("YYYY-MM-DD")}`;
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
      setChartData(res.data || []);
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType, date, year, quarter, startMonth, endMonth]);

  const handleReset = () => {
    setFilterType(0);
    setDate(null);
    setYear(dayjs().year());
    setQuarter(1);
    setStartMonth(1);
    setEndMonth(12);
  };

  const totalOrders = Number(chartData?.totalOrders ?? 0);
  const completedOrders = Number(chartData?.completedOrders ?? 0);
  const refundedOrders = Number(chartData?.refundedOrders ?? 0);
  const compensatedOrders = Number(chartData?.compensatedOrders ?? 0);
  const satisfactionPercent = Number(chartData?.satisfactionPercent ?? 0);

  // vòng tròn hiển thị tổng đơn (theo thiết kế cũ chia 10k để ra % vòng tròn)
  const circleValuePercent = (totalOrders / 1000) * 100;

  // progress bars hiển thị theo % để không bị tràn >100%
  const successRate =
    totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const progressList = [
    { label: "Tỉ lệ giao thành công", value: successRate, color: "#3b82f6" },
    { label: "Tỉ lệ hài lòng", value: satisfactionPercent, color: "#22c55e" },
  ];

  return (
    <div className="sales-record-card">
      <div className="top">
        <Title level={4}>Chỉ số hoạt động</Title>
        <div className="filters">
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 120, marginRight: 10 }}
          >
            <Option value={0}>Tổng quan</Option>
            <Option value={1}>Theo ngày</Option>
            <Option value={2}>Theo tuần</Option>
            <Option value={3}>Theo năm</Option>
            <Option value={4}>Theo quý</Option>
            <Option value={5}>Theo khoảng tháng</Option>
          </Select>
          {filterType === 1 && (
            <DatePicker
              format="DD/MM/YYYY"
              value={date ? dayjs(date, "YYYY-MM-DD") : null}
              onChange={(d) => setDate(d ? d.format("YYYY-MM-DD") : null)}
              placeholder="Chọn ngày"
              allowClear
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              style={{ width: 120 }}
            />
          )}
          {filterType === 2 && (
            <>
              <InputNumber
                value={week}
                min={1}
                max={4}
                onChange={(val) => setWeek(val)}
                style={{ width: 70, marginRight: 10 }}
                placeholder="Tuần"
              />
              <InputNumber
                value={startMonth}
                min={1}
                max={12}
                onChange={(val) => setStartMonth(val)}
                style={{ width: 70 }}
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
                style={{ width: 70, marginRight: 10 }}
              />
              <InputNumber
                value={quarter}
                min={1}
                max={4}
                onChange={(val) => setQuarter(val)}
                style={{ width: 50 }}
              />
            </>
          )}

          {filterType === 5 && (
            <>
              <InputNumber
                value={year}
                onChange={(val) => setYear(val)}
                style={{ width: 60, marginRight: 10 }}
              />
              <InputNumber
                value={startMonth}
                min={1}
                max={12}
                onChange={(val) => setStartMonth(val)}
                style={{ width: 40, marginRight: 4 }}
              />
              <InputNumber
                value={endMonth}
                min={1}
                max={12}
                onChange={(val) => setEndMonth(val)}
                style={{ width: 40 }}
              />
            </>
          )}

          {/* <Button type="primary" onClick={fetchData}>
            Xem
          </Button> */}

          {/* <Button onClick={handleReset}>Reset</Button> */}
        </div>
      </div>

      <Spin spinning={loading}>
        <div className="top-section">
          <div className="circle-chart">
            <CircularProgressbarWithChildren
              value={Math.max(0, Math.min(100, circleValuePercent))}
              styles={buildStyles({
                pathColor: "#a855f7",
                trailColor: "#e5e7eb",
              })}
            >
              <div className="score-text">
                <div className="score">{totalOrders.toLocaleString()}</div>
                <div className="label">Tổng đơn hàng</div>
              </div>
            </CircularProgressbarWithChildren>
          </div>

          <div className="stats">
            <div>
              <span className="label">Đơn thành công</span>
              <span className="value">{completedOrders.toLocaleString()}</span>
            </div>
            <div>
              <span className="label">Hoàn đơn</span>
              <span className="value">{refundedOrders.toLocaleString()}</span>
            </div>
            <div>
              <span className="label">Đơn bồi thường</span>
              <span className="value">
                {compensatedOrders.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="progress-section">
          {progressList.map((item, i) => (
            <div className="progress-item" key={i}>
              <div className="row">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="fill"
                  style={{
                    width: `${Math.max(0, Math.min(100, item.value))}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Spin>
    </div>
  );
}

export default ProgressChart;
