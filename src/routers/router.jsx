import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";

import AboutUs from "../pages/about_us/AboutUs";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import HistoryOrders from "../pages/history_orders/HistoryOrders";
import HistoryPayment from "../pages/history_payment/HistoryPayment";
import Homepage from "../pages/homepage/Homepage";
import Login from "../pages/login/Login";
import Main from "../pages/dashboard/layout/main-dashboard/Main";
import NoFooterLayout from "../components/no_footer_layout/NoFooterLayout";
import Order from "../pages/order/Order";
import OrderStaff from "../pages/dashboard/pages/staff/staff-order/OrderStaff";
import { PATH_NAME } from "../constants/pathname";
import Page404 from "../pages/page404/Page404";
import Pincode from "../pages/pinCode/Pincode";
import Policy from './../pages/policy/Policy';
import Profile from "../pages/profile/Profile";
import Register from "../pages/register/Register";
import ResetPassword from "../pages/resetPassword/ResetPassword";
import ScrollToTop from "../components/ScrollToTop";
import VerifyMail from "../pages/resetPassword/VerifyMail";
import { element } from "prop-types";
import { message } from "antd";
import { selectUser } from "../redux/features/counterSlice";
import { useSelector } from "react-redux";
import PaymentSuccess from "../pages/payment_success/PaymentSuccess";
import PaymentFail from "../pages/payment_fail/PaymentFail";

const ProtectedRouteAuth = ({ children }) => {
  const user = useSelector(selectUser);
  if (!user) {
    message.error("Bạn cần phải đăng nhập trước!!");
    return <Navigate to="/login" replace />;
  }
  return children;
};

const ProtectedRouteCustomer = ({ children }) => {
  const user = useSelector(selectUser);
  if (user?.role?.includes("Admin") || user?.role?.includes("Staff")) {
    message.error("Bạn không có quyền truy cập vào trang này.");
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const ProtectedDashboard = ({ children }) => {
  const user = useSelector(selectUser);
  console.log(user);

  const validRoles = ["Admin", "Staff"];

  if (!user?.role?.some((r) => validRoles.includes(r))) {
    return <Navigate to="*" replace />;
  }

  return children;
};

const ProtectedRouteAdmin = ({ children }) => {
  const user = useSelector(selectUser);
  if (!user?.role?.includes("Admin")) {
    message.error("Bạn không có quyền truy cập vào trang này.");
    return <Navigate to="/dashboard/admin" replace />;
  }
  return children;
};

const ProtectedRouteStaff = ({ children }) => {
  const user = useSelector(selectUser);
  if (!user?.role?.includes("Staff")) {
    message.error("Bạn không có quyền truy cập vào trang này.");
    return <Navigate to="/dashboard/staff" replace />;
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
      //   {
      //     path: "/about-us",
      //     element: (
      //       <ProtectedRouteCustomer>
      //         {" "}
      //         <AboutUs />
      //       </ProtectedRouteCustomer>
      //     ),
      //   },
      // {
      //   path: PATH_NAME.BOOKING_ORDER,
      //   element: (
      //     <ProtectedRouteCustomer>
      //       <Order />
      //     </ProtectedRouteCustomer>
      //   ),
      // },
      //   {
      //     path: "/user-profile/",
      //     element: <Sidebar />,
      //     children: [
      //       {
      //         path: "profile",
      //         element: (
      //           <ProtectedRouteCustomer>
      //             <Profile />
      //           </ProtectedRouteCustomer>
      //         ),
      //       },
      //   {
      //     path: "track-booking",
      //     element: (
      //       <ProtectedRouteCustomer>
      //         <BookingCustomer />
      //       </ProtectedRouteCustomer>
      //     ),
      //   },
      //   {
      //     path: "history-bookings",
      //     element: (
      //       <ProtectedRouteCustomer>
      //         <HistoryBooking />
      //       </ProtectedRouteCustomer>
      //     ),
      //   },
      //     ],
      //   },
      //   {
      //     path: "/thank-you",
      //     element: (
      //       <ProtectedRouteCustomer>
      //         <ThanksCard />
      //       </ProtectedRouteCustomer>
      //     ),
      //   },
      //   {
      //     path: "/payment-cancelled",
      //     element: (
      //       <ProtectedRouteCustomer>
      //         <CancelCard />
      //       </ProtectedRouteCustomer>
      //     ),
      //   },
      //   {
      //     path: "/booking",
      //     element: (
      //       <ProtectedRouteCustomer>
      //         <Booking />
      //       </ProtectedRouteCustomer>
      //     ),
      //   },
      //   {
      //     path: "/feedback",
      //     element: (
      //       <ProtectedRouteCustomer>
      //         <Feedback />
      //       </ProtectedRouteCustomer>
      //     ),
      //   },
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
    ],
  },
  // {
  //   path: "/dashboard",
  //   element: (
  //     <Main />
  //   ), children: [
  //     {
  //       path: "/dashboard/staff",
  //       element: (
  //         <OrderStaff />
  //       ),
  //     }
  //   ]
  // },

  //dashboard
  {
    path: "/dashboard",
    element: (
      <ProtectedDashboard>
        <Main />
      </ProtectedDashboard>
    ),
    children: [
      //staff
      {
        path: "/dashboard/staff",
        element: (
          <ProtectedRouteStaff>
            <OrderStaff />
          </ProtectedRouteStaff>
        ),
      },

      //admin
      // {
      //   path: "/dashboard/admin/salon-manage",
      //   element: (
      //     <ProtectedRouteAdmin>
      //       <SalonAdmin />
      //     </ProtectedRouteAdmin>
      //   ),
      // },
      // {
      //   path: "/dashboard/admin",
      //   element: (
      //     <ProtectedRouteAdmin>
      //       <AdminDashboard />
      //     </ProtectedRouteAdmin>
      //   ),
      // },
      // {
      //   path: "/dashboard/admin/user-manage",
      //   element: (
      //     <ProtectedRouteAdmin>
      //       <UserAdmin />
      //     </ProtectedRouteAdmin>
      //   ),
      // },
      // {
      //   path: "/dashboard/admin/members-manage",
      //   element: (
      //     <ProtectedRouteAdmin>
      //       <MemberAdmin />
      //     </ProtectedRouteAdmin>
      //   ),
      // },
      // {
      //   path: "/dashboard/admin/services-manage",
      //   element: (
      //     <ProtectedRouteAdmin>
      //       <AdminServices />
      //     </ProtectedRouteAdmin>
      //   ),
      // },
    ],
  },
]);
