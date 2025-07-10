import {
  CarOutlined,
  DashboardOutlined,
  OrderedListOutlined,
  ProductOutlined,
  TeamOutlined,
  TransactionOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { PATH_NAME } from "../../constants/pathname";

export const navDashboardConfig = [
  {
    key: "1",
    icon: <DashboardOutlined />,
    label: "Tổng quan",
  },
  {
    key: "2",
    icon: <TeamOutlined style={{ fontSize: "1.4em" }} />,
    label: "Quản lý Người dùng",
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
        label: "Danh sách tàu Metro",
      },
     
    ],
  },
  {
    key: "3",
    icon: <OrderedListOutlined  style={{ fontSize: "1.4em" }} />,
    label: "Đơn hàng",
  },
  // {
  //   key: "5",
  //   icon: <UserOutlined  style={{ fontSize: "1.4em" }} />,
  //   label: "Người dùng",
  // },
];
export const navDashboardConfigCustomer = [
 
  
];

export const navDashboardConfigStaff = [
  {
    key: "7",
    icon: <UnorderedListOutlined />,
    label: "Quản lý đơn hàng",
    children: [
      {
        key: "71",
        label: "Đơn hàng cần xử lý"
      },
      {
        key: "72",
        label: "Theo dõi đơn hàng"
      },
      {
        key: "73",
        label: "Đơn hàng đã hoàn thành"
      }
    ]
  },
  {
    key: "8",
    icon: <TransactionOutlined />,
    label: "Giao dịch",
  },  
  {
    key: "9",
    icon: <CarOutlined />,
    label: "Tàu Metro",
  },  
];
  

export const navpath = {
  1: {
    path: PATH_NAME.DASHBOARD_ADMIN,
  },
  2: {
    path: PATH_NAME.DASHBOARD_ADMIN_USER_MANAGEMENT,
  },
  3: {
    path: PATH_NAME.DASHBOARD_ADMIN_ORDERS,
  },
  41: {
    path: PATH_NAME.DASHBOARD_ADMIN_METRO_LINES_MANAGEMENT,
  },
  42: {
    path: PATH_NAME.DASHBOARD_ADMIN_METRO_TRAINS_MANAGEMENT,
  },
  // 5: {
  //   path: "/dashboard/admin/users",
  // },
  71: {
    path: PATH_NAME.DASHBOARD_STAFF_PENDING_ORDER,
  },
  72: {
    path: PATH_NAME.DASHBOARD_STAFF_TRACKING_ORDER,
  },
  73: {
    path: PATH_NAME.DASHBOARD_STAFF_HANDLED_ORDER,
  },
  8: {
    path: PATH_NAME.DASHBOARD_STAFF_PAYMENT,
  },
  9: {
    path: PATH_NAME.DASHBOARD_STAFF_TRAIN_INFORMATION,
  },
};

export default navDashboardConfig;
