import {
  CarOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  DollarOutlined,
  IdcardOutlined,
  InboxOutlined,
  ProductOutlined,
  ProfileOutlined,
  SafetyOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
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
    icon: <UserOutlined style={{ fontSize: "1.4em" }} />,
    label: "Quản lý Người dùng",
  },
  {
    key: "5",
    icon: <TeamOutlined style={{ fontSize: "1.4em" }} />,
    label: "Quản lý Nhân viên",
  },
  {
    key: "4",
    icon: <ProductOutlined style={{ fontSize: "1.4em" }} />,
    label: "Quản lý Metro",
    children: [
      {
        key: "41",
        label: "Quản lý tuyến Metro",
      },
      {
        key: "42",
        label: "Quản lý tàu Metro",
      },
      {
        key: "43",
        label: "Quản lý trạm Metro",
      },
    ],
  },
  {
    key: "3",
    icon: <ShoppingCartOutlined style={{ fontSize: "1.4em" }} />,
    label: "Quản lý Đơn hàng",
  },
  {
    key: "14",
    icon: <TransactionOutlined style={{ fontSize: "1.4em" }} />,
    label: "Quản lý Giao dịch",
  },
  {
    key: "11",
    icon: <InboxOutlined style={{ fontSize: "1.4em" }} />,
    label: "Quản lý Loại bưu kiện",
  },
  {
    key: "13",
    icon: <DollarOutlined style={{ fontSize: "1.4em" }} />,
    label: "Quản lý Giá vận chuyển",
  },
  {
    key: "12",
    icon: <SafetyOutlined style={{ fontSize: "1.4em" }} />,
    label: "Quản lý Bảo hiểm",
  },
  {
    key: "15",
    icon: <ClockCircleOutlined style={{ fontSize: "1.4em" }} />,
    label: "Quản lý Time Slot",
  },
  {
    key: "6",
    icon: <SettingOutlined style={{ fontSize: "1.4em" }} />,
    label: "Hệ thống",
    children: [
      {
        key: "61",
        label: "Thông tin tài khoản",
      },
      {
        key: "62",
        label: "Cấu hình hệ thông",
      },
    ],
  },

  // {
  //   key: "5",
  //   icon: <UserOutlined  style={{ fontSize: "1.4em" }} />,
  //   label: "Người dùng",
  // },
];
export const navDashboardConfigCustomer = [];

export const navDashboardConfigStaff = [
  {
    key: "7",
    icon: <UnorderedListOutlined />,
    label: "Quản lý đơn hàng",
    children: [
      {
        key: "71",
        label: "Đơn hàng cần xử lý",
      },
      {
        key: "72",
        label: "Theo dõi đơn hàng",
      },
      {
        key: "73",
        label: "Đơn hàng đã hoàn thành",
      },
      {
        key: "74",
        label: "Yêu cầu hỗ trợ",
      },
    ],
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
  {
    key: "10",
    icon: <IdcardOutlined />,
    label: "Hồ sơ",
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
  43: {
    path: PATH_NAME.DASHBOARD_ADMIN_METRO_STATIONS_MANAGEMENT,
  },
  5: {
    path: PATH_NAME.DASHBOARD_ADMIN_STAFF_MANAGEMENT,
  },
  61: {
    path: PATH_NAME.DASHBOARD_ADMIN_PROFILE,
  },
  11: {
    path: PATH_NAME.DASHBOARD_ADMIN_PARCEL_CATEGORY_MANAGEMENT,
  },
  12: {
    path: PATH_NAME.DASHBOARD_ADMIN_METRO_INSURANCE,
  },
  13: {
    path: PATH_NAME.DASHBOARD_ADMIN_PRICE_MANAGEMENT,
  },
  14: {
    path: PATH_NAME.DASHBOARD_ADMIN_TRANSACTION_MANAGEMENT,
  },
  62: {
    path: PATH_NAME.DASHBOARD_ADMIN_SYSTEM_CONFIG,
  },
  15: {
    path: PATH_NAME.DASHBOARD_ADMIN_TIME_SLOT,
  },
  71: {
    path: PATH_NAME.DASHBOARD_STAFF_PENDING_ORDER,
  },
  72: {
    path: PATH_NAME.DASHBOARD_STAFF_TRACKING_ORDER,
  },
  73: {
    path: PATH_NAME.DASHBOARD_STAFF_HANDLED_ORDER,
  },
  74: {
    path: PATH_NAME.DASHBOARD_STAFF_SUPPORT_TICKETS,
  },
  8: {
    path: PATH_NAME.DASHBOARD_STAFF_PAYMENT,
  },
  9: {
    path: PATH_NAME.DASHBOARD_STAFF_TRAIN_INFORMATION,
  },
  10: {
    path: PATH_NAME.DASHBOARD_STAFF_PROFILE,
  },
};

export default navDashboardConfig;
