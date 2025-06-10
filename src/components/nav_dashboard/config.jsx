import {
  DashboardOutlined,
  OrderedListOutlined,
  ProductOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const navDashboardConfig = [
  {
    key: "1",
    icon: <DashboardOutlined />,
    label: "Tổng quan",
  },
  {
    key: "2",
    icon: <TeamOutlined style={{ fontSize: "1.4em" }} />,
    label: "Quản lý Staff",
  },
  {
    key: "4",
    icon: <ProductOutlined  style={{ fontSize: "1.4em" }} />,
    label: "Quản lý Metro",
    children: [
      {
        key: "41",
        label: "Danh sách tuyến Metro",
      },
      {
        key: "42",
        label: "Tạo tuyến Metro mới",
      },
     
    ],
  },
  {
    key: "3",
    icon: <OrderedListOutlined  style={{ fontSize: "1.4em" }} />,
    label: "Đơn hàng",
  },
  {
    key: "5",
    icon: <UserOutlined  style={{ fontSize: "1.4em" }} />,
    label: "Người dùng",
  },
];
export const navDashboardConfigCustomer = [
 
  
];

export const navDashboardConfigStaff = [
  {
    key: "7",
    icon: <UnorderedListOutlined />,
    label: "Đơn hàng",
  },
];

export const navpath = {
  1: {
    path: "/dashboard/admin",
  },
  2: {
    path: "/dashboard/admin/staff-manage",
  },
  3: {
    path: "/dashboard/admin/orders",
  },
  41: {
    path: "/dashboard/admin/view-metro-line",
  },
  42: {
    path: "/dashboard/admin/add-metro-line",
  },
  5: {
    path: "/dashboard/admin/users",
  },
  7: {
    path: "/dashboard/staff",
  },
};

export default navDashboardConfig;
