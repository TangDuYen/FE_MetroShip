import "./SideNav.scss";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout, selectUser } from "../../../../redux/features/counterSlice";
import navDashboardConfig, { navDashboardConfigCustomer, navDashboardConfigStaff, navpath } from "../../../../components/nav_dashboard/config";
import { useDispatch, useSelector } from "react-redux";

import { AiOutlineLogout } from "react-icons/ai";
import { LogoutOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { toast } from "react-toastify";

function SideNav({ }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const page = pathname.replace("/", "");
  const dispatch = useDispatch();
  const onClick = (e) => {
    if (e.key === "logout") {
      handleLogout();
    } else {
      navigate(navpath[e.key].path);
    }
  };
  const user = useSelector(selectUser);
  const handleLogout = async () => {
    toast.success("Đăng xuất thành công");
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    await dispatch(logout());
    navigate('/');
  }

  return (


    <div className="menu-side-nav-container">
      <Menu
        onClick={onClick}
        defaultOpenKeys={["sub1"]}
        mode="inline"
        theme="dark"
        items={
          user?.role == "Admin"
            ? navDashboardConfig
            : user?.role == "Staff"
              ? navDashboardConfigStaff
              : user?.role == "Customer"
                ? navDashboardConfigCustomer
                : null
        }

        className="menu-sidenav"
      />
      <Menu
        onClick={onClick}
        defaultOpenKeys={["sub1"]}
        mode="inline"
        theme="dark"
        items={[
          {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
          },
        ]}
        className="menu-sidenav2"
      />

    </div>
  );
}

export default SideNav;
