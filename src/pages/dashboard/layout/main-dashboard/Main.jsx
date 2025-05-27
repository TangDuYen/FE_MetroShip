import { Layout, Drawer } from "antd";
import "./Main.scss";
import NavDashboard from "../../../../components/nav-dashboard/NavDashboard";
import HeaderDashboard from "../header-dasboard/Header"; // Changed Header to HeaderDashboard to avoid conflict
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SideNav from "../side-nav/SideNav";

const { Content, Sider, Header } = Layout;

function Main({ children }) {
  const [isExpand, setIsExpand] = useState(false);
  const [visible, setVisible] = useState(false);

  const openDrawer = () => setVisible(!visible);

  let { pathname } = useLocation();
  pathname = pathname.replace("/", "");

  return (
    <Layout className="layout-dashboard">
      {/* Drawer for mobile view */}
      <Drawer
        title={false}
        placement="left"
        closable={false}
        onClose={() => setVisible(false)}
        open={visible}
        key="left"
        width={300}
        className="drawer-sidebar"
        style={{ backgroundColor: "#1f1f1f" }}
      >
        <Layout>
          <SideNav />
        </Layout>
      </Drawer>

      {/* Add the Header here */}
      <Header className="header-dashboard">
        <HeaderDashboard />
      </Header>

      <Layout>
        <Sider
          collapsed={isExpand}
          collapsedWidth={90}
          trigger={null}
          width={300}
          style={{
            backgroundColor: "transparent",
            transition: "all 0.5s ease-out",
          }}
          className="sider-primary ant-layout-sider-primary sider-toggle"
        >
          <SideNav style={{ width: "100%" }} />
        </Sider>

        <Layout>
          <div className="div-ant" style={{ height: "86vh", overflowY: "scroll" }}>
            <Outlet />
          </div>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default Main;
