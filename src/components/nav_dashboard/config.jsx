import {
  CalendarOutlined,
  DashboardOutlined,
  OrderedListOutlined,
  ProductOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const navDashboardConfig = [
  {
    key: "1",
    icon: <DashboardOutlined />,
    label: "Summary",
  },
  {
    key: "2",
    icon: <TeamOutlined style={{ fontSize: "1.4em" }} />,
    label: "Staff Management",
  },
  {
    key: "4",
    icon: <ProductOutlined  style={{ fontSize: "1.4em" }} />,
    label: "Metro Management",
    children: [
      {
        key: "41",
        label: "View all metro line",
      },
      {
        key: "42",
        label: "Create a metro line",
      },
     
    ],
  },
  {
    key: "3",
    icon: <OrderedListOutlined  style={{ fontSize: "1.4em" }} />,
    label: "Orders",
  },
  {
    key: "5",
    icon: <UserOutlined  style={{ fontSize: "1.4em" }} />,
    label: "Users",
  },
];
export const navDashboardConfigCustomer = [
 
  
];

export const navDashboardConfigStaff = [
  {
    key: "7",
    icon: <UnorderedListOutlined />,
    label: "Orders",
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
