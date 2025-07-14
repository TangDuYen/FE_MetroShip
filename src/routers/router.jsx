import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";

import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import NoFooterLayout from "../components/no_footer_layout/NoFooterLayout";
import { PATH_NAME } from "../constants/pathname";
import ScrollToTop from "../components/ScrollToTop";
import { selectUser } from "../redux/features/counterSlice";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

// import AboutUs from "../pages/about_us/AboutUs";
// import Additional from "../pages/services/additionalService/Additional";
// import AdminDashboard from "../pages/dashboard/pages/admin/admin-dashboard/AdminDashboard";
// import ExpressDelivery from "../pages/services/expressDelivery/ExpressDelivery";

// import HistoryOrders from "../pages/history_orders/HistoryOrders";
// import HistoryPayment from "../pages/history_payment/HistoryPayment";
// import Homepage from "../pages/homepage/Homepage";
// import Login from "../pages/login/Login";
// import Main from "../pages/dashboard/layout/main-dashboard/Main";
// import MetroLineManagement from "../pages/dashboard/pages/admin/admin-metroline-manage/MetroLineManagement";
// import MetroTrainManagement from "../pages/dashboard/pages/admin/admin-metrotrain-manage/MetroTrainManagement";

// import Order from "../pages/order/Order";
// import OrderStaff from "../pages/dashboard/pages/staff/staff-order/OrderStaff";

// import Page404 from "../pages/page404/Page404";
// import PaymentFail from "../pages/payment_fail/PaymentFail";
// import PaymentStaff from "../pages/dashboard/pages/staff/staff-payment/PaymentStaff";
// import PaymentSuccess from "../pages/payment_success/PaymentSuccess";
// import Pincode from "../pages/pinCode/Pincode";
// import Policy from './../pages/policy/Policy';
// import Profile from "../pages/profile/Profile";
// import Register from "../pages/register/Register";
// import ResetPassword from "../pages/resetPassword/ResetPassword";
// import RouteStaff from "../pages/dashboard/pages/staff/staff-route/RouteStaff";

// import Service from "../pages/services/Service";
// import Support from "../pages/support/Support";
// import Tracking from "../pages/tracking/Tracking";
// import TrackingOrder from "../pages/tracking-order/TrackingOrder";
// import TrackingOrderStaff from "../pages/dashboard/pages/staff/staff-tracking-order/TrackingOrderStaff";
// import UserManagement from "../pages/dashboard/pages/admin/admin-usermanage/UserManagement";
// import VerifyMail from "../pages/resetPassword/VerifyMail";
// import { element } from "prop-types";

const lazyLoad = (importFn) => {
  const Component = lazy(importFn);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  );
};

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
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <ScrollToTop />
        <Header />
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
        <Footer />
      </div>
    ),
    children: [
      {
        path: PATH_NAME.HOME,
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/homepage/Homepage"))}
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: "/test/:trackingCode",
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/testMap/TestMap"))}
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.ABOUT_US,
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/about_us/AboutUs"))}
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.POLICY,
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/policy/Policy"))}
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.PROFILE,
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/profile/Profile"))}
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.HISTORY_ORDERS,
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/history_orders/HistoryOrders"))}
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.HISTORY_PAYMENT,
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/history_payment/HistoryPayment"))}
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.PAYMENT_SUCCESS,
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/payment_success/PaymentSuccess"))}
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.PAYMENT_FAILED,
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/payment_fail/PaymentFail"))}
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: `${PATH_NAME.TRACKING_ORDER}/:trackingCode`,
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/tracking-order/TrackingOrder"))}
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.TRACKING_ORDER,
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/tracking-order/TrackingOrder"))}
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.BOOKING_ORDER,
        element: <NoFooterLayout />,
        children: [
          {
            path: PATH_NAME.BOOKING_ORDER,
            element: (
              <ProtectedRouteCustomer>
                {lazyLoad(() => import("../pages/order/Order"))}
              </ProtectedRouteCustomer>
            ),
          },
        ],
      },
    ],
  },
  {
    path: PATH_NAME.SERVICE,
    element: lazyLoad(() => import("../pages/services/Service")),
  },
  {
    path: PATH_NAME.EXPRESS_DELIVERY,
    element: lazyLoad(() => import("../pages/services/expressDelivery/ExpressDelivery")),
  },
  {
    path: PATH_NAME.ADDITIONAL_SERVICE,
    element: lazyLoad(() => import("../pages/services/additionalService/Additional")),
  },
  {
    path: PATH_NAME.PARCEL_RULES,
    element: lazyLoad(() => import("../pages/services/parcelRules/ParcelRules")),
  },
  {
    path: PATH_NAME.TRACKING,
    element: lazyLoad(() => import("../pages/tracking/Tracking")),
  },
  {
    path: PATH_NAME.SUPPORT,
    element: lazyLoad(() => import("../pages/support/Support")),
  },
  {
    path: PATH_NAME.LOGIN,
    element: lazyLoad(() => import("../pages/login/Login")),
  },
  {
    path: PATH_NAME.REGISTER,
    element: lazyLoad(() => import("../pages/register/Register")),
  },
  {
    path: PATH_NAME.PIN_CODE,
    element: lazyLoad(() => import("../pages/pinCode/Pincode")),
  },
  {
    path: PATH_NAME.RECOVERY_PASSWORD,
    element: lazyLoad(() => import("../pages/resetPassword/ResetPassword")),
  },
  {
    path: PATH_NAME.VERIFY_MAIL,
    element: lazyLoad(() => import("../pages/resetPassword/VerifyMail")),
  },
  {
    path: PATH_NAME.PAGE404,
    element: lazyLoad(() => import("../pages/page404/Page404")),
  },

  //DASHBOARD ROUTES
  {
    path: PATH_NAME.DASHBOARD,
    element: (
      <ProtectedDashboard>
        {lazyLoad(() =>
          import("../pages/dashboard/layout/main-dashboard/Main")
        )}
      </ProtectedDashboard>
    ),
    children: [

      //STAFF ROUTES
      {
        path: PATH_NAME.DASHBOARD_STAFF_PENDING_ORDER,
        element: (
          <ProtectedRouteStaff>
            {lazyLoad(() =>
              import("../pages/dashboard/pages/staff/staff-order/OrderStaff")
            )}
          </ProtectedRouteStaff>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_STAFF_TRACKING_ORDER,
        element: (
          <ProtectedRouteStaff>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/staff/staff-tracking-order/TrackingOrderStaff"
              )
            )}
          </ProtectedRouteStaff>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_STAFF_ORDER_INFORMATION,
        element: (
          <ProtectedRouteStaff>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/staff/staff-order-information/OrderInformationStaff"
              )
            )}
          </ProtectedRouteStaff>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_STAFF_HANDLED_ORDER,
        element: (
          <ProtectedRouteStaff>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/staff/staff-order-done/HandledOrderStaff"
              )
            )}
          </ProtectedRouteStaff>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_STAFF_PAYMENT,
        element: (
          <ProtectedRouteStaff>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/staff/staff-payment/PaymentStaff"
              )
            )}
          </ProtectedRouteStaff>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_STAFF_TRAIN_INFORMATION,
        element: (
          <ProtectedRouteStaff>
            {lazyLoad(() =>
              import("../pages/dashboard/pages/staff/staff-train/TrainStaff")
            )}
          </ProtectedRouteStaff>
        ),
      },

      //ADMIN ROUTES
      {
        path: PATH_NAME.DASHBOARD_ADMIN,
        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/admin/admin-dashboard/AdminDashboard"
              )
            )}
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_ORDERS,
        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/admin/admin-orders/AdminOrders"
              )
            )}
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_USER_MANAGEMENT,
        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/admin/admin-usermanage/UserManagement"
              )
            )}
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_METRO_LINES_MANAGEMENT,
        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/admin/admin-metroline-manage/MetroLineManagement"
              )
            )}
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_METRO_TRAINS_MANAGEMENT,
        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/admin/admin-metrotrain-manage/MetroTrainManagement"
              )
            )}
          </ProtectedRouteAdmin>
        ),
      },
    ],
  },
]);
