import "./Header.scss";

import * as signalR from "@microsoft/signalr";

import { GoBell, GoPerson } from "react-icons/go";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Badge, Button, Spin, Tooltip, message } from "antd";
import connection, { startConnection } from "../../config/signalR";
import { logout, selectUser } from "../../redux/features/counterSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";

import { BsCart3 } from "react-icons/bs";
import { GoSearch } from "react-icons/go";
import { PATH_NAME } from "../../constants/pathname";
import api from "../../config/axios";
import logo from "../../assets/logo.png";
import { toast } from "react-toastify";
import { DeleteOutlined } from "@ant-design/icons";
import { BiCheckDouble } from "react-icons/bi";

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

  const fetchUnreadCount = async () => {
  try {
    const res = await api.get("/notifications/unread-count");
    setUnreadCount(res.data?.data || 0);
  } catch (err) {
    console.error("Lỗi fetch unread count:", err);
    const errorMessage = err.response?.data?.message || err.message || "Không thể tải số thông báo chưa đọc";
    toast.error(errorMessage);
  }
};

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        // lấy danh sách thông báo
        const res = await api.get("/notifications?PageSize=1000");
        const items = res.data.data.items || [];
        setNotifications(items);

        // fetch count
        await fetchUnreadCount();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user?.id]);

 const markAllAsRead = async () => {
  try {
    const res = await api.put("/notifications/read-all");
    if (res.data?.statusCode === 200) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await fetchUnreadCount();

      const successMessage = res.data?.message || "Đã đánh dấu tất cả là đã đọc";
      toast.success(successMessage);
    }
  } catch (err) {
    console.error("Lỗi đọc tất cả:", err);
    const errorMessage = err.response?.data?.message || err.message || "Đánh dấu tất cả thất bại";
    toast.error(errorMessage);
  }
};

  const deleteNotification = async (id) => {
  try {
    const res = await api.delete(`/notifications/${id}`);
    if (res.data?.statusCode === 200) {
      setNotifications((prev) => prev.filter((x) => x.id !== id));
      await fetchUnreadCount();

      const successMessage = res.data?.message || "Đã xóa thông báo";
      toast.success(successMessage);
    } else {
      const failMessage = res.data?.message || "Xóa thông báo thất bại";
      toast.error(failMessage);
    }
  } catch (err) {
    console.error("Lỗi xóa thông báo:", err);
    const errorMessage = err.response?.data?.message || err.message || "Có lỗi xảy ra khi xóa";
    toast.error(errorMessage);
  }
};

  const deleteAllNotifications = async () => {
  try {
    const res = await api.delete("/notifications/delete-all");

    if (res.data?.statusCode === 200) {
      setNotifications([]);
      await fetchUnreadCount();

      const successMessage = res.data?.message || "Đã xóa tất cả thông báo";
      toast.success(successMessage);
    }
  } catch (err) {
    console.error("Lỗi xóa tất cả:", err);
    const errorMessage = err.response?.data?.message || err.message || "Xóa tất cả thất bại";
    toast.error(errorMessage);
  }
};


  useEffect(() => {
    if (!connection || !user?.id) return;

    const handleNotification = (notification) => {
      const newNoti = {
        id: notification.id || Date.now(),
        message: notification.message,
        isRead: false,
        sentAt: notification.sentAt || new Date().toISOString(),
      };

      setNotifications((prev) => [newNoti, ...prev]);
      fetchUnreadCount(); // fetch lại count khi hub push noti
      toast.info(notification.message, { autoClose: 3000 });
    };

    connection.on("ReceiveNotification", handleNotification);

    startConnection().then(() => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection
          .invoke("JoinNotificationGroup")
          .then(() => console.log("✅ Joined notification group"))
          .catch((err) => console.error("JoinNotificationGroup error:", err));
      }
    });

    return () => connection.off("ReceiveNotification", handleNotification);
  }, [user?.id]);

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
    localStorage.removeItem("departureStationLocation");
    localStorage.removeItem("staffAssignments");
    sessionStorage.removeItem("parcelFormData");
    dispatch(logout());
    toast.success("Đăng xuất thành công");
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
              <Badge count={unreadCount} overflowCount={9}>
                <GoBell className="header-icons" />
              </Badge>

              {openDropdown === "notification" && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAllNotifications();
                      }}
                    >
                      Xóa tất cả
                    </Button>

                    <Button
                      type="text"
                      size="small"
                      icon={<BiCheckDouble style={{ fontSize: 20 }} />}
                      style={{
                        color: notifications.some((n) => !n.isRead)
                          ? "green"
                          : "gray",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                    >
                      Đánh dấu tất cả đã đọc
                    </Button>
                  </div>
                  {loading ? (
                    <Spin />
                  ) : notifications.length === 0 ? (
                    <div className="notification-empty">Không có thông báo</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`notification-item ${
                          n.isRead ? "read" : "unread"
                        }`}
                      >
                        <Tooltip title={n.message} placement="topLeft">
                          <div className="noti-content">{n.message}</div>
                        </Tooltip>
                        <div className="noti-time">
                          <span className="time">
                            {new Date(n.sentAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="date">
                            {new Date(n.sentAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>

                        <button
                          className="noti-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.id);
                          }}
                        >
                          <DeleteOutlined />
                        </button>
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
