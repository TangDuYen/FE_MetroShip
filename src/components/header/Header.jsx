import "./Header.scss";

import { GoBell, GoPerson } from "react-icons/go";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout, selectUser } from "../../redux/features/counterSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";

import { BsCart3 } from "react-icons/bs";
import { GoSearch } from "react-icons/go";
import { PATH_NAME } from "../../constants/pathname";
import logo from "../../assets/logo.png";
import { toast } from "react-toastify";
import connection, { startConnection } from "../../config/signalR";
import { message, Spin } from "antd";
import api from "../../config/axios";
import * as signalR from "@microsoft/signalr";
function Header() {
  const [openDropdown, setOpenDropdown] = useState(null); // null | "notification" | "profile"
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

 useEffect(() => {
  if (!user) return;

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications?PageSize=1000");
      const items = res.data.data.items || [];

      setNotifications(prev => {
        const newNoti = items.filter(i => !prev.some(p => p.id === i.id));
        if (newNoti.length === 0) return prev;
        return [...newNoti, ...prev];
      });

      const newUnread = items.filter(i => !i.isRead).length;
      setUnreadCount(newUnread);

    } catch (err) {
      console.error(err);
    }
  };

  loadNotifications();
  const interval = setInterval(loadNotifications, 2000);
  return () => clearInterval(interval);
}, [user?.id]);


  useEffect(() => {
  if (!connection || !user?.id) return; // chỉ check id

  const handleNotification = (notification) => {
    const newNoti = {
      id: notification.id || Date.now(),
      message: notification.message,
      isRead: false,
      sentAt: notification.sentAt || new Date().toISOString(),
    };

    setNotifications(prev => [newNoti, ...prev]);
    setUnreadCount(prev => prev + 1);

    toast.info(notification.message, { autoClose: 3000 });
  };

  connection.on("ReceiveNotification", handleNotification);

  startConnection().then(() => {
    if (connection.state === signalR.HubConnectionState.Connected) {
      connection.invoke("JoinNotificationGroup")
        .then(() => console.log("✅ Joined notification group"))
        .catch(err => console.error("JoinNotificationGroup error:", err));
    }
  });

  return () => connection.off("ReceiveNotification", handleNotification);
}, [user?.id]); // dùng user?.id thay vì user object




  const handleToggleNotification = async () => {
    if (openDropdown === "notification") {
      setOpenDropdown(null);
    } else {
      setOpenDropdown("notification");

      // Khi mở dropdown, đánh dấu tất cả là đã đọc
      // setNotifications((prev) =>
      //   prev.map((n) => ({ ...n, isRead: true }))
      // );
      // setUnreadCount(0);
    }
  };




  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("refreshTokenExpiredTime");
    localStorage.removeItem("userLatitude");
    localStorage.removeItem("userLongitude");
    localStorage.removeItem("staffAssignments");
    sessionStorage.removeItem("parcelFormData");
    dispatch(logout());
    navigate(PATH_NAME.HOME);
  };

  const handleClick = () => {
    toast.info("Bạn cần phải đăng nhập để sử dụng chức năng này", 3000);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // const toggleNotifications = () => {
  //   setIsNotificationOpen((prev) => !prev);
  //   setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  // };

  // const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navItems = (
    <>
      <li
        className={`header-nav-item ${
          location.pathname === PATH_NAME.HOME ? "active" : ""
        }`}
      >
        <Link to={PATH_NAME.HOME}>Trang chủ</Link>
      </li>
      <li
        className={`header-nav-item ${
          location.pathname === PATH_NAME.ABOUT_US ? "active" : ""
        }`}
      >
        <Link to={PATH_NAME.ABOUT_US}>Về chúng tôi</Link>
      </li>
      <li
        className={`header-nav-item ${
          location.pathname === PATH_NAME.SERVICE ? "active" : ""
        }`}
      >
        <Link to={PATH_NAME.SERVICE}>Dịch vụ</Link>
      </li>
      <li
        className={`header-nav-item ${
          location.pathname === PATH_NAME.TRACKING ? "active" : ""
        }`}
      >
        <Link to={PATH_NAME.TRACKING}>Theo dõi</Link>
      </li>
      <li
        className={`header-nav-item ${
          location.pathname === PATH_NAME.SUPPORT ? "active" : ""
        }`}
      >
        <Link to={PATH_NAME.SUPPORT}>Hỗ trợ</Link>
      </li>
      <li>
        {user ? (
          <button
            className="header-btn"
            onClick={() => navigate(PATH_NAME.BOOKING_ORDER)}
          >
            Tạo đơn
          </button>
        ) : (
          <button
            className="header-btn"
            onClick={() => {
              handleClick();
              navigate(PATH_NAME.LOGIN);
            }}
          >
            Tạo đơn
          </button>
        )}
      </li>
    </>
  );

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-logo-img">
            <Link to={PATH_NAME.HOME}>
              <img src={logo} alt="" className="header-logo" />
            </Link>
          </div>

          {/* Desktop menu */}
          <nav className="header-nav">
            <ul className="header-items">{navItems}</ul>
          </nav>

          {/* Mobile menu */}
          <nav
            className={`header-mobile-menu ${isMobileMenuOpen ? "open" : ""}`}
          >
            <ul className="header-items" onClick={closeMobileMenu}>
              {navItems}
            </ul>
          </nav>

          <div className="header-right" ref={dropdownRef}>
            {/* <form method="get" className="header-form-search" role="search">
            <input
              type="text"
              name="query"
              className="header-search-auto"
              placeholder="Tìm kiếm sản phẩm"
              autoComplete="off"
            />
            <button
              type="submit"
              className="header-btn-search"
              aria-label="Tìm kiếm"
            >
              <GoSearch />
            </button>
          </form> */}
            <button className="hamburger-icon" onClick={toggleMobileMenu}>
              ☰
            </button>
            {/* Notification Bell */}
            <div
              className="header-block-notification"
              onClick={(e) => {
                e.stopPropagation();
                if (!user) {
                  handleClick();
                  navigate(PATH_NAME.LOGIN);
                  return;
                }
                handleToggleNotification();
              }}
            >
              <GoBell className="header-icons" />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}

              {openDropdown === "notification" && (
                <div className="notification-dropdown">
                  {loading ? (
                    <Spin />
                  ) : notifications.length === 0 ? (
                    <div className="notification-empty">Không có thông báo</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="notification-item">
                        <div className="noti-content">{n.message}</div>
                        <div className="noti-time">
                          {new Date(n.sentAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* ACCOUNT */}
            <div
              className="header-block-account"
              onClick={() =>
                setOpenDropdown(openDropdown === "profile" ? null : "profile")
              }
            >
              <GoPerson className="header-icons" />
              {openDropdown === "profile" && (
                <div className="navbar-dropdowns">
                  {user ? (
                    <>
                      <div className="navbar-profile-wrapper">
                        <Link
                          to={PATH_NAME.PROFILE}
                          className="navbar-profile-item"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Hồ sơ
                        </Link>
                      </div>
                      <div className="navbar-profile-wrapper">
                        <div
                          className="navbar-profile-item"
                          onClick={handleLogout}
                        >
                          Đăng xuất
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="navbar-profile-wrapper">
                        <Link
                          to={PATH_NAME.LOGIN}
                          className="navbar-profile-item"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Đăng nhập
                        </Link>
                      </div>
                      <div className="navbar-profile-wrapper">
                        <Link
                          to={PATH_NAME.REGISTER}
                          className="navbar-profile-item"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Đăng ký
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
