import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { Suspense, lazy, useEffect, useRef, useState } from "react";

import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import NoFooterLayout from "../components/no_footer_layout/NoFooterLayout";
import { PATH_NAME } from "../constants/pathname";
import ScrollToTop from "../components/ScrollToTop";
import { selectUser } from "../redux/features/counterSlice";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const lazyLoad = (importFn) => {
  const Component = lazy(importFn);
  return (
    <Suspense fallback={<div>Đang tải dữ liệu...</div>}>
      <Component />
    </Suspense>
  );
};

const ProtectedRouteCustomer = ({ children }) => {
  const user = useSelector(selectUser);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      const timer = setTimeout(() => {
        setRedirect(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  if (redirect) {
    return <Navigate to={PATH_NAME.LOGIN} replace />;
  }
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
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (user === null) return;
    const validRoles = ["Admin", "Staff"];
    if (!validRoles.includes(user?.role)) {
      toast.error("Bạn không có quyền truy cập vào trang này.");
      const timer = setTimeout(() => setRedirect(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (redirect) {
    return <Navigate to={PATH_NAME.HOME} replace />;
  }
  return children;
};

const ProtectedRouteAdmin = ({ children }) => {
  const user = useSelector(selectUser);
  const [redirect, setRedirect] = useState(false);
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (user === null) return;
    if (!user?.role?.includes("Admin") && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.error("Bạn cần đăng nhập với vai trò Quản trị viên để truy cập trang này.");
      const timer = setTimeout(() => setRedirect(true), 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (redirect) {
    return <Navigate to={PATH_NAME.LOGIN} replace />;
  }

  return children;
};

const ProtectedRouteStaff = ({ children }) => {
  const user = useSelector(selectUser);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (user === null) return;
    if (!user?.role?.includes("Staff")) {
      toast.error("Bạn cần đăng nhập với vai trò Nhân viên để truy cập trang này.");
      const timer = setTimeout(() => setRedirect(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);
  if (redirect) {
    return <Navigate to={PATH_NAME.LOGIN} replace />;
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
        path: "/test/:trackingCode",
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/testMap/TestMap"))}
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
        path: PATH_NAME.HISTORY_TICKET,
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/history_ticket/HistoryTicket"))}
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
        path: `${PATH_NAME.TRACKING_ORDER}`,
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/tracking-order/TrackingOrder"))}
          </ProtectedRouteCustomer>
        ),
      },
      {
        path: PATH_NAME.PRINT_ORDER,
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/print_order/PrintOrder"))}
          </ProtectedRouteCustomer>
        ),
      },
      // {
      //   path: PATH_NAME.TRACKING_ORDER,
      //   element: (
      //     <ProtectedRouteCustomer>
      //       {lazyLoad(() => import("../pages/tracking-order/TrackingOrder"))}
      //     </ProtectedRouteCustomer>
      //   ),
      // },
      {
        path: PATH_NAME.CHANGE_PASSWORD,
        element: (
          <ProtectedRouteCustomer>
            {lazyLoad(() => import("../pages/change_password/ChangePassword"))}
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
      {
        path: PATH_NAME.HOME,
        element: lazyLoad(() => import("../pages/homepage/Homepage")),
      },
      {
        path: PATH_NAME.ABOUT_US,
        element: lazyLoad(() => import("../pages/about_us/AboutUs")),
      },
      {
        path: PATH_NAME.POLICY,
        element: lazyLoad(() => import("../pages/policy/Policy")),
      },
      {
        path: PATH_NAME.SERVICE,
        element: lazyLoad(() => import("../pages/services/Service")),
      },
      {
        path: PATH_NAME.TRACKING,
        element: lazyLoad(() => import("../pages/tracking/Tracking")),
      },
      {
        path: PATH_NAME.EXPRESS_DELIVERY,
        element: lazyLoad(() =>
          import("../pages/services/expressDelivery/ExpressDelivery")
        ),
      },
      {
        path: PATH_NAME.ADDITIONAL_SERVICE,
        element: lazyLoad(() =>
          import("../pages/services/additionalService/Additional")
        ),
      },
      {
        path: PATH_NAME.PARCEL_RULES,
        element: lazyLoad(() =>
          import("../pages/services/parcelRules/ParcelRules")
        ),
      },

      {
        path: PATH_NAME.SUPPORT,
        element: lazyLoad(() => import("../pages/support/Support")),
      },
    ],
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
        path: PATH_NAME.DASHBOARD_STAFF_SUPPORT_TICKETS,
        element: (
          <ProtectedRouteStaff>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/staff/staff-support-tickets/SupportTicketStaff"
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
      {
        path: PATH_NAME.DASHBOARD_STAFF_PROFILE,
        element: (
          <ProtectedRouteStaff>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/staff/staff-profile/StaffProfile"
              )
            )}
          </ProtectedRouteStaff>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_STAFF_TRAIN_MAP,
        element: (
          <ProtectedRouteStaff>
            {lazyLoad(() =>
              import("../pages/dashboard/pages/staff/staff-map/StaffMap")
            )}
          </ProtectedRouteStaff>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_STAFF_PRINT_ORDER,
        element: (
          <ProtectedRouteStaff>
            {lazyLoad(() =>
              import("../pages/dashboard/pages/staff/staff-print-order/StaffPrintOrder")
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
              import("../pages/dashboard/pages/admin/admin-orders/AdminOrders")
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
        path: PATH_NAME.DASHBOARD_ADMIN_STAFF_MANAGEMENT,
        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/admin/admin-staff-manage/AdminStaffManage"
              )
            )}
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_STAFF_DETAILS,
        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/admin/admin-staff-manage/AdminStaffDetails"
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
      {
        path: PATH_NAME.DASHBOARD_ADMIN_PROFILE,

        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/admin/admin-profile/AdminProfile"
              )
            )}
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_METRO_STATIONS_MANAGEMENT,
        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/admin/admin-station-manage/AdminStationManage"
              )
            )}
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_PARCEL_CATEGORY_MANAGEMENT,
        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/admin/admin-parcel-category-manage/ParcelCategoryManage"
              )
            )}
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_METRO_INSURANCE,
        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/admin/admin-insurance/AdminInsurance"
              )
            )}
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_METRO_INSURANCE_DETAILS,
        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import(
                "../pages/dashboard/pages/admin/admin-details-insurance/AdminInsuranceDetails"
              )
            )}
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_PRICE_MANAGEMENT,
        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import("../pages/dashboard/pages/admin/admin-pricing/AdminPrice")
            )}
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_TRANSACTION_MANAGEMENT,
        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import("../pages/dashboard/pages/admin/admin-transaction/TransactionManagement")
            )}
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_SYSTEM_CONFIG,
        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import("../pages/dashboard/pages/admin/admin-systemconfig/AdminSystemConfig")
            )}
          </ProtectedRouteAdmin>
        ),
      },
      {
        path: PATH_NAME.DASHBOARD_ADMIN_TIME_SLOT,
        element: (
          <ProtectedRouteAdmin>
            {lazyLoad(() =>
              import("../pages/dashboard/pages/admin/admin-time-slot-management/AdminTimeSlot")
            )}
          </ProtectedRouteAdmin>
        ),
      },
    ],
  },
]);
