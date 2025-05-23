import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";

import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import HistoryOrders from "../pages/history_orders/HistoryOrders";
import HistoryPayment from "../pages/history_payment/HistoryPayment";
import Homepage from "../pages/homepage/Homepage";
import Login from "../pages/login/Login";
import Order from "../pages/order/Order";
import { PATH_NAME } from "../constants/pathname";
import Page404 from "../pages/page404/Page404";
import Pincode from "../pages/pinCode/Pincode";
import Policy from './../pages/policy/Policy';
import Profile from "../pages/profile/Profile";
import Register from "../pages/register/Register";
import ResetPassword from "../pages/resetPassword/ResetPassword";
import ScrollToTop from "../components/ScrollToTop";
import VerifyMail from "../pages/resetPassword/VerifyMail";
import { message } from "antd";
import { selectUser } from "../redux/features/counterSlice";
import { useSelector } from "react-redux";

const ProtectedRouteAuth = ({ children }) => {
  const user = useSelector(selectUser);
  if (!user) {
    message.error("You need to login first!!");
    return <Navigate to="/login" replace />;
  }
  return children;
};

const ProtectedRouteCustomer = ({ children }) => {
  const user = useSelector(selectUser);
  if (
    user?.role?.includes("Admin") ||
    user?.role?.includes("Staff")
  ) {
    message.error("You do not have permission to access this page.");
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const ProtectedDashboard = ({ children }) => {
  const user = useSelector(selectUser);
  console.log(user);

  const validRoles = ["Admin", "Staff"];

  if (!user?.role?.some(r => validRoles.includes(r))) {
    return <Navigate to="*" replace />;
  }

  return children;
};

const ProtectedRouteAdmin = ({ children }) => {
  const user = useSelector(selectUser);
  if (!user?.role?.includes("Admin")) {
    message.error("You do not have permission to access this page.");
    return <Navigate to="/dashboard/admin" replace />;
  }
  return children;
};

const ProtectedRouteStaff = ({ children }) => {
  const user = useSelector(selectUser);
  if (!user?.role?.includes("Staff")) {
    message.error("You do not have permission to access this page.");
    return <Navigate to="/dashboard/staff/bookings" replace />;
  }
  return children;
};

export const router = createBrowserRouter([
  {
    path: "/",
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
        path: "/",
        element: (
          <ProtectedRouteCustomer>
            <Homepage />
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: "/policy",
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
    //   {
    //     path: "/about-us",
    //     element: (
    //       <ProtectedRouteCustomer>
    //         {" "}
    //         <AboutUs />
    //       </ProtectedRouteCustomer>
    //     ),
    //   },
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
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <Register />,
  },
  {
    path: "/pin-code",
    element: <Pincode />,
  },
  {
    path: "/recovery-password",
    element: <ResetPassword />,
  },
  {
    path: "/verify-mail",
    element: <VerifyMail />,
  },
  {
    path: "/booking-order",
    element: <Order />,
  },
  {
    path: "*",
    element: <Page404 />,
  },

  //dashboard
//   {
//     path: "/dashboard",
//     element: (
//       <ProtectedDashboard>
//         <Main />
//       </ProtectedDashboard>
//     ),
//     children: [
//       //staff
//       {
//         path: "/dashboard/staff",
//         element: (
//           <ProtectedRouteStaff>
//             <BookingManager />
//           </ProtectedRouteStaff>
//         ),
//       },
//       {
//         path: "/dashboard/manager/bookings",
//         element: (
//           <ProtectedRouteManager>
//             <BookingManager />
//           </ProtectedRouteManager>
//         ),
//       },

//       {
//         path: "/dashboard/manager/service",
//         element: (
//           <ProtectedRouteManager>
//             <ViewService />
//           </ProtectedRouteManager>
//         ),
//       },
//       {
//         path: "/dashboard/manager/add-combo",
//         element: (
//           <ProtectedRouteManager>
//             <AddCombo />
//           </ProtectedRouteManager>
//         ),
//       },
//       {
//         path: "/dashboard/manager/view-combo",
//         element: (
//           <ProtectedRouteManager>
//             <ViewCombo />
//           </ProtectedRouteManager>
//         ),
//       },
//       {
//         path: "/dashboard/manager/stylist-manage",
//         element: (
//           <ProtectedRouteManager>
//             <StylistManager />
//           </ProtectedRouteManager>
//         ),
//       },

//       //admin
//       {
//         path: "/dashboard/admin/salon-manage",
//         element: (
//           <ProtectedRouteAdmin>
//             <SalonAdmin />
//           </ProtectedRouteAdmin>
//         ),
//       },
//       {
//         path: "/dashboard/admin",
//         element: (
//           <ProtectedRouteAdmin>
//             <AdminDashboard />
//           </ProtectedRouteAdmin>
//         ),
//       },
//       {
//         path: "/dashboard/admin/user-manage",
//         element: (
//           <ProtectedRouteAdmin>
//             <UserAdmin />
//           </ProtectedRouteAdmin>
//         ),
//       },
//       {
//         path: "/dashboard/admin/members-manage",
//         element: (
//           <ProtectedRouteAdmin>
//             <MemberAdmin />
//           </ProtectedRouteAdmin>
//         ),
//       },
//       {
//         path: "/dashboard/admin/services-manage",
//         element: (
//           <ProtectedRouteAdmin>
//             <AdminServices />
//           </ProtectedRouteAdmin>
//         ),
//       },

//       //stylist
//       {
//         path: "/dashboard/stylist",
//         element: (
//           <ProtectedRouteStylist>
//             <BookingAssigned />
//           </ProtectedRouteStylist>
//         ),
//       },
//       {
//         path: "/dashboard/stylist/register-workshifts",
//         element: (
//           <ProtectedRouteStylist>
//             <RegisterWorkshifts />
//           </ProtectedRouteStylist>
//         ),
//       },

//       //staff
//       {
//         path: "/dashboard/staff",
//         element: (
//           <ProtectedRouteSalonStaff>
//             <BookingStaff />
//           </ProtectedRouteSalonStaff>
//         ),
//       },
//     ],
//   },
]);