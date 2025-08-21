import "./Header.scss";

import { GoBell, GoPerson } from "react-icons/go";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout, selectUser } from "../../redux/features/counterSlice";
import { useDispatch, useSelector } from "react-redux";
import { useRef, useState } from "react";

import { BsCart3 } from "react-icons/bs";
import { GoSearch } from "react-icons/go";
import { PATH_NAME } from "../../constants/pathname";
import logo from "../../assets/logo.png";
import { toast } from "react-toastify";

function Header() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };
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
          <Link to={PATH_NAME.BOOKING_ORDER}>
            <button className="header-btn">Tạo đơn</button>
          </Link>
        ) : (
          <Link to={PATH_NAME.LOGIN}>
            <button className="header-btn" onClick={handleClick}>
              Tạo đơn
            </button>
          </Link>
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

          <div className="header-right">
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
            {/* <div
              className="header-block-notification"
              onClick={() => console.log("Mở thông báo")}
            >
              <GoBell className="header-icons" />
              
              <span className="notification-badge">3</span>
            </div> */}
            <div
              className="header-block-account"
              ref={profileDropdownRef}
              onClick={toggleProfileDropdown}
            >
              <GoPerson className="header-icons" />
              {isProfileDropdownOpen && (
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
