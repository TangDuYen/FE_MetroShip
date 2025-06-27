import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";

import AboutUs from "../pages/about_us/AboutUs";
import Additional from "../pages/services/additionalService/Additional";
import AdminDashboard from "../pages/dashboard/pages/admin/admin-dashboard/AdminDashboard";
import ExpressDelivery from "../pages/services/expressDelivery/ExpressDelivery";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import HistoryOrders from "../pages/history_orders/HistoryOrders";
import HistoryPayment from "../pages/history_payment/HistoryPayment";
import Homepage from "../pages/homepage/Homepage";
import Login from "../pages/login/Login";
import Main from "../pages/dashboard/layout/main-dashboard/Main";
import MetroLineManagement from "../pages/dashboard/pages/admin/admin-metroline-manage/MetroLineManagement";
import MetroTrainManagement from "../pages/dashboard/pages/admin/admin-metrotrain-manage/MetroTrainManagement";
import NoFooterLayout from "../components/no_footer_layout/NoFooterLayout";
import Order from "../pages/order/Order";
import OrderStaff from "../pages/dashboard/pages/staff/staff-order/OrderStaff";
import { PATH_NAME } from "../constants/pathname";
import Page404 from "../pages/page404/Page404";
import PaymentFail from "../pages/payment_fail/PaymentFail";
import PaymentStaff from "../pages/dashboard/pages/staff/staff-payment/PaymentStaff";
import PaymentSuccess from "../pages/payment_success/PaymentSuccess";
import Pincode from "../pages/pinCode/Pincode";
import Policy from './../pages/policy/Policy';
import Profile from "../pages/profile/Profile";
import Register from "../pages/register/Register";
import ResetPassword from "../pages/resetPassword/ResetPassword";
import RouteStaff from "../pages/dashboard/pages/staff/staff-route/RouteStaff";
import ScrollToTop from "../components/ScrollToTop";
import Service from "../pages/services/Service";
import Support from "../pages/support/Support";
import Tracking from "../pages/tracking/Tracking";
import TrackingOrder from "../pages/tracking-order/TrackingOrder";
import TrackingOrderStaff from "../pages/dashboard/pages/staff/staff-tracking-order/TrackingOrderStaff";
import UserManagement from "../pages/dashboard/pages/admin/admin-usermanage/UserManagement";
import VerifyMail from "../pages/resetPassword/VerifyMail";
import { element } from "prop-types";
import { selectUser } from "../redux/features/counterSlice";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const ProtectedRouteCustomer = ({ children }) => {
  const user = useSelector(selectUser);
  if (user?.role?.includes("Admin")) {
    toast.error("Bạn không có quyền truy cập vào trang này.");
    return <Navigate to={PATH_NAME.DASHBOARD_ADMIN} replace />;
  }
  if (user?.role?.includes("Staff")) {
    toast.error("Bạn không có quyền truy cập vào trang này.");
    return <Navigate to={PATH_NAME.DASHBOARD_STAFF_PENDING_ORDER} replace />;
  }
  return children;
};

const ProtectedDashboard = ({ children }) => {
  const user = useSelector(selectUser);
  console.log(user);

  const validRoles = ["Admin", "Staff"];

  if (!validRoles.includes(user?.role)) {
    return <Navigate to={PATH_NAME.PAGE404} replace />;
  }
  return children;
};

const ProtectedRouteAdmin = ({ children }) => {
  const user = useSelector(selectUser);
  if (!user?.role?.includes("Admin")) {
    toast.error("Bạn không có quyền truy cập vào trang này.");
    return <Navigate to={PATH_NAME.DASHBOARD_ADMIN} replace />;
  }
  return children;
};

const ProtectedRouteStaff = ({ children }) => {
  const user = useSelector(selectUser);
  if (!user?.role?.includes("Staff")) {
    toast.error("Bạn không có quyền truy cập vào trang này.");
    return <Navigate to={PATH_NAME.DASHBOARD_STAFF_PENDING_ORDER} replace />;
  }
  return children;
};

export const router = createBrowserRouter([
  {
    path: PATH_NAME.HOME,
    element: (
      <div>
        <ScrollToTop />
        <Header />
        <Outlet />
        <Footer />
      </div>
    ),
    children: [
      {
        path: PATH_NAME.HOME,
        element: (
          <ProtectedRouteCustomer>
            <Homepage />
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.ABOUT_US,
        element: (
          <ProtectedRouteCustomer>
            <AboutUs />
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.POLICY,
        element: (
          <ProtectedRouteCustomer>
            <Policy />
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.PROFILE,
        element: (
          <ProtectedRouteCustomer>
            <Profile />
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.HISTORY_ORDERS,
        element: (
          <ProtectedRouteCustomer>
            <HistoryOrders />
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.HISTORY_PAYMENT,
        element: (
          <ProtectedRouteCustomer>
            <HistoryPayment />
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.PAYMENT_SUCCESS,
        element: (
          <ProtectedRouteCustomer>
            <PaymentSuccess />
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.PAYMENT_FAILED,
        element: (
          <ProtectedRouteCustomer>
            <PaymentFail />
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.SERVICE,
        element: (
          <ProtectedRouteCustomer>
            <Service />
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.EXPRESS_DELIVERY,
        element: (
          <ProtectedRouteCustomer>
            <ExpressDelivery />
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.ADDITIONAL_SERVICE,
        element: (
          <ProtectedRouteCustomer>
            <Additional />
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.TRACKING,
        element: (
          <ProtectedRouteCustomer>
            <Tracking />
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.SUPPORT,
        element: (
          <ProtectedRouteCustomer>
            <Support />
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.TRACKING_ORDER,
        element: (
          <ProtectedRouteCustomer>
            <TrackingOrder />
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.BOOKING_ORDER,
        element: <NoFooterLayout />,
        children: [
          {
            path: PATH_NAME.BOOKING_ORDER,
            element:
              <ProtectedRouteCustomer>
                <Order />
              </ProtectedRouteCustomer>
          }
        ]
      },
    ],
  },
  {
    path: PATH_NAME.LOGIN,
    element: <Login />,
  },
  {
    path: PATH_NAME.REGISTER,
    element: <Register />,
  },
  {
    path: PATH_NAME.PIN_CODE,
    element: <Pincode />,
  },
  {
    path: PATH_NAME.RECOVERY_PASSWORD,
    element: <ResetPassword />,
  },
  {
    path: PATH_NAME.VERIFY_MAIL,
    element: <VerifyMail />,
  },
  {
    path: PATH_NAME.PAGE404,
    element: <Page404 />,
  },

  //DASHBOARD
  {
    path: PATH_NAME.DASHBOARD,
    element: (
      <ProtectedDashboard>
        <Main />
      </ProtectedDashboard>
    ),
    children: [
      //STAFF
      {
        path: PATH_NAME.DASHBOARD_STAFF_PENDING_ORDER,
        element: (
          <ProtectedRouteStaff>
            <OrderStaff />
          </ProtectedRouteStaff>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_STAFF_TRACKING_ORDER,
        element: (
          <ProtectedRouteStaff>
            <TrackingOrderStaff />
          </ProtectedRouteStaff>
        ),
      },
      { 
        path: PATH_NAME.DASHBOARD_STAFF_PAYMENT,
        element: (
          <ProtectedRouteStaff>
            <PaymentStaff />
          </ProtectedRouteStaff>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_STAFF_ROUTE_MANAGEMENT,
        element: (
          <ProtectedRouteStaff>
            <RouteStaff />
          </ProtectedRouteStaff>
        ),
      },

      //ADMIN
      {
        path: PATH_NAME.DASHBOARD_ADMIN,
        element: (
          <ProtectedRouteAdmin>
            <AdminDashboard />
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_USER_MANAGEMENT,
        element: (
          <ProtectedRouteAdmin>
            <UserManagement />
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_METRO_LINES_MANAGEMENT,
        element: (
          <ProtectedRouteAdmin>
            <MetroLineManagement />
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_METRO_TRAINS_MANAGEMENT,
        element: (
          <ProtectedRouteAdmin>
            <MetroTrainManagement />
          </ProtectedRouteAdmin>
        ),
      },
      
    ],
  },
]);
