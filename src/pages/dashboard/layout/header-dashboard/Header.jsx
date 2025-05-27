import "./Header.scss";

import { AlignLeftOutlined, LogoutOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Col,
  Dropdown,
  Menu,
  Row,
  Space,
  Typography,
} from "antd";
import { logout, selectUser } from "../../../../redux/features/counterSlice";
import { useDispatch, useSelector } from "react-redux";

import { AiOutlineLogout } from "react-icons/ai";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router-dom";

function HeaderDashboard({ name, subName, onPress }) {
  const isDesktop = useMediaQuery({ minWidth: 991 });
  const isMobile = useMediaQuery({ maxWidth: 630 });
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    navigate("/");
  };


  return (
    <Row className="header-dashboard">
      <Col
        xl={1}
        lg={1}
        md={1}
        sm={1}
        xs={1}
        className="header-dashboard__header-control"
      >
        {!isDesktop && (
          <Button
            type="link"
            className="header-dashboard__header-control__sidebar-toggler"
            onClick={onPress}
          >
            <AlignLeftOutlined />
          </Button>
        )}
      </Col>
      <Col
        xl={23}
        lg={23}
        md={23}
        sm={23}
        xs={23}
        className="header-dashboard__header-control dash-info"
      >
    
        <p className="header-dashboard__title" style={{color:'white'}}>
          {/* Hi {user.Role}!  */}
          Welcome to Dashboard
        </p>
        
  
      </Col>
    </Row>
  );
}

export default HeaderDashboard;
