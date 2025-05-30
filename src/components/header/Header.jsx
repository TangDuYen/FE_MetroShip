import "./Header.scss";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout, selectUser } from "../../redux/features/counterSlice";
import { useDispatch, useSelector } from "react-redux";
import { useRef, useState } from "react";

import { BsCart3 } from "react-icons/bs";
import { GoPerson } from "react-icons/go";
import { GoSearch } from "react-icons/go";
import { PATH_NAME } from "../../constants/pathname";
import logo from "../../assets/logo.png";

function Header() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  return (
    <>
      <header className="header">
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
                  className={`header-nav-item ${location.pathname === PATH_NAME.HOME ? "active" : ""
                    }`}
                >
                  <Link to={PATH_NAME.HOME}>Trang chủ</Link>
                </li>
                <li
                  className={`header-nav-item ${location.pathname === PATH_NAME.ABOUT_US ? "active" : ""
                    }`}
                >
                  <Link to={PATH_NAME.ABOUT_US}>Về chúng tôi</Link>
                </li>
                <li
                  className={`header-nav-item ${location.pathname === PATH_NAME.SERVICE ? "active" : ""
                    }`}
                >
                  <Link to={PATH_NAME.SERVICE}>Dịch vụ</Link>
                </li>
                <li
                  className={`header-nav-item ${location.pathname === PATH_NAME.TRACKING ? "active" : ""
                    }`}
                >
                  <Link to={PATH_NAME.TRACKING}>Theo dõi</Link>
                </li>
                <li
                  className={`header-nav-item ${location.pathname === PATH_NAME.SUPPORT ? "active" : ""
                    }`}
                >
                  <Link to={PATH_NAME.SUPPORT}>Hỗ trợ</Link>
                </li>
                <li>
                  <Link to={PATH_NAME.BOOKING_ORDER}>
                    <button className="header-btn">Tạo đơn</button>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
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
                          onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("userData");
                            dispatch(logout());
                            navigate("/");
                          }}
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
          </div >
        </div >
      </header >
    </>
  );
}

export default Header;
