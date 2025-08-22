import "./Header.scss";

import { AlignLeftOutlined, BellOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Row } from "antd";

import logoPicture from "../../../../assets/logo3.png"
import { selectUser } from "../../../../redux/features/counterSlice";
import { useMediaQuery } from "react-responsive";
import { useSelector } from "react-redux";

function HeaderDashboard({ name, subName, onPress }) {
  const isDesktop = useMediaQuery({ minWidth: 991 });
  const user = useSelector(selectUser);

  return (
    <Row className="header-dashboard" align="middle" justify="space-between">
      {/* LEFT: LOGO */}
      <Col className="header-dashboard__left" style={{ display: "flex", alignItems: "center" }}>
        {!isDesktop && (
          <Button
            type="link"
            className="header-dashboard__sidebar-toggler"
            onClick={onPress}
          >
            <AlignLeftOutlined />
          </Button>
        )}
        <img
          src={logoPicture}
          alt="Logo"
          className="header-dashboard__logo"
          style={{ height: 40, marginLeft: !isDesktop ? 8 : 0 }}
        />
      </Col>

      {/* CENTER: ROLE */}
      <Col className="header-dashboard__center">
        <p className="header-dashboard__title" style={{ color: "white", margin: 0 }}>
          Chào {user?.UserName} !
        </p>
      </Col>

      {/* RIGHT: NOTIFICATIONS */}
      <Col className="header-dashboard__right">
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 20, color: "white" }} />}
          className="header-dashboard__notification-btn"
        />
      </Col>
    </Row>
  );
}

export default HeaderDashboard;
