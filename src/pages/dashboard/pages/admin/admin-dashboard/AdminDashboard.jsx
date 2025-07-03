import {
  FaBoxOpen,
  FaClipboardCheck,
  FaSackDollar,
  FaUsers,
} from "react-icons/fa6";
import "./AdminDashboard.scss";
import { useEffect, useState } from "react";
import LineCharts from "./chart/lineChart/LineCharts";
import ProgressChart from "./chart/progressChart/ProgressChart";
import PieCharts from "./chart/pieChart/PieCharts";
import BarCharts from "./chart/barChart/BarCharts";

function AdminDashboard() {
  const [statsCards, setStatsCards] = useState([]);
  const statsData = [
    { value: "804,561 ", change: "+2.5%" },
    { value: "1,204 đơn", change: "+3.1%" },
    { value: "235 người", change: "+1.8%" },
    { value: "982 đơn", change: "+4.6%" },
  ];

  const cards = [
    {
      title: "Doanh thu tháng này",
      icon: <FaSackDollar />,
      className: "card blue",
    },
    {
      title: "Số đơn hàng",
      icon: <FaBoxOpen />,
      className: "card pink",
    },
    {
      title: "Người dùng mới",
      icon: <FaUsers />,
      className: "card purple",
    },
    {
      title: "Giao hàng thành công",
      icon: <FaClipboardCheck />,
      className: "card orange",
    },
  ];

  useEffect(() => {
    const combined = cards.map((card, index) => ({
      ...card,
      ...statsData[index],
    }));
    setStatsCards(combined);
  }, []);
  return (
    <div className="admin-dashboard">
      <div className="card-container">
        {statsCards.map((stat, index) => (
          <div key={index} className={stat.className}>
            <div className="card-content">
              <h3>{stat.title}</h3>
              <p className="value">{stat.value}</p>
              <p className="change">{stat.change} so với tháng trước</p>
            </div>
            <div className="icon">{stat.icon}</div>
          </div>
        ))}
      </div>
      <div className="chart-grid">
        <LineCharts />
        <ProgressChart />
      </div>
      <div className="chart-grid-1">
        <PieCharts />
        <BarCharts />
      </div>
    </div>
  );
}

export default AdminDashboard;
