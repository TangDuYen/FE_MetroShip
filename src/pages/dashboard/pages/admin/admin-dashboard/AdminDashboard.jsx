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
import api from "../../../../../config/axios";

function AdminDashboard() {

  const [statsCards, setStatsCards] = useState([]);
  useEffect(() => {
  const fetchStats = async () => {
    try {
      const [usersRes, shipmentsRes, transactionsRes] = await Promise.all([
        api.get("/Report/users/stats"),
        api.get("/Report/shipments/stats"),
        api.get("/Report/transactions/stats"),
      ]);

      const { percentageNewUsers, totalUsersWithRoleUser } = usersRes.data.data;
      const { totalShipments, percentageNewShipments, totalCompleteShipments, percentageNewCompleteShipments } = shipmentsRes.data.data;
      const { growthPaidAmount, totalPaidAmount } = transactionsRes.data.data;

      const statsData = [
        { value: `${totalPaidAmount.toLocaleString()} VND`, change: `${growthPaidAmount}%` },
        { value: `${totalShipments} đơn`, change: `${percentageNewShipments}%` },
        { value: `${totalUsersWithRoleUser} người`, change: `${percentageNewUsers}%` },
        { value: `${totalCompleteShipments} đơn`, change: `${percentageNewCompleteShipments}%` },
      ];

      const cards = [
        { title: "Doanh thu tháng này", icon: <FaSackDollar />, className: "card blue" },
        { title: "Số đơn hàng", icon: <FaBoxOpen />, className: "card pink" },
        { title: "Người dùng mới", icon: <FaUsers />, className: "card purple" },
        { title: "Giao hàng thành công", icon: <FaClipboardCheck />, className: "card orange" },
      ];

      const combined = cards.map((card, index) => ({
        ...card,
        ...statsData[index],
      }));

      setStatsCards(combined);
    } catch (err) {
      console.error(err);
    }
  };

  fetchStats();
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
