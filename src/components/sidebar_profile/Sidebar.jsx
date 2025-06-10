import React, { useEffect, useState } from "react";
import { PATH_NAME } from "../../constants/pathname";
import "./Sidebar.scss";
import { NavLink } from "react-router-dom";
import { MdAccountCircle, MdPayments } from "react-icons/md";
import { BsFillBoxSeamFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/features/counterSlice";
import api from "../../config/axios";

function Sidebar() {
  const user = useSelector(selectUser);
  const [userData, setUserData] = useState({
    fullName: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id || !user?.token) return;

      try {
        const response = await api.get(`users/${user.id}`, {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = response.data.data;

        setUserData({
        
          fullName: data.fullName || "",
          
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <div className="profile-sidebar">
      <div className="profile-sidebar-container">
        <div className="profile-sidebar-top">
          <div className="profile-sidebar-avatar">
            <img
              src="https://as1.ftcdn.net/v2/jpg/07/03/86/10/1000_F_703861066_gNOwqrKENcaNU2eDH2El2fyhja6Nz6hv.jpg"
              alt="Avatar"
            />
          </div>
          <div className="profile-sidebar-label">Xin chào, {userData.fullName}</div>
        </div>
        <div className="profile-sidebar-bottom">
          <ul>
            <li
              className={
                location.pathname === PATH_NAME.PROFILE ? "active" : ""
              }
            >
              <NavLink to={PATH_NAME.PROFILE}>
                <MdAccountCircle className="icon" /> Thông tin tài khoản
              </NavLink>
            </li>
            <li
              className={
                location.pathname === PATH_NAME.HISTORY_ORDERS ? "active" : ""
              }
            >
              <NavLink to={PATH_NAME.HISTORY_ORDERS}>
                <BsFillBoxSeamFill className="icon" /> Lịch sử đơn hàng
              </NavLink>
            </li>
            <li
              className={
                location.pathname === PATH_NAME.HISTORY_PAYMENT ? "active" : ""
              }
            >
              <NavLink to={PATH_NAME.HISTORY_PAYMENT}>
                <MdPayments className="icon" /> Lịch sử giao dịch
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
