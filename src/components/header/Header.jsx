import { PATH_NAME } from "../../constants/pathname";
import "./Header.scss";
import logo from "../../assets/logo.png";
import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoPerson } from "react-icons/go";
import { BsCart3 } from "react-icons/bs";
import { GoSearch } from "react-icons/go";

function Header() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };
  return (
    <header>
      <div className="header-container">
        <div className="header-logo-img">
          <Link to={PATH_NAME.HOME}>
            <img src={logo} alt="" className="header-logo" />
          </Link>
        </div>

        <div className="header-position-relative">
          <nav className="header-nav">
            <ul className="header-items">
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
                <button className="header-btn">Tạo đơn</button>
              </li>
            </ul>
          </nav>
        </div>

        {/* <div className="header-right">
          <form method="get" className="header-form-search" role="search">
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
          </form>
          <div
            className="header-block-account"
            ref={profileDropdownRef}
            onClick={toggleProfileDropdown}
          >
            <GoPerson className="header-icons" />
            {isProfileDropdownOpen && (
              <div className="navbar-dropdowns">
                {isLoggedIn ? (
                  <>
                    <div className="navbar-profile-wrapper">
                      <Link
                        to={PATH_NAME.ACCOUNT}
                        className="navbar-profile-item"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Hồ sơ
                      </Link>
                    </div>
                    <div className="navbar-profile-wrapper">
                      <div
                        className="navbar-profile-item"
                        //onClick={handleLogout}
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
                
              </div>
            )}
          </div>
        </div> */}
      </div>
    </header>
  );
}

export default Header;
