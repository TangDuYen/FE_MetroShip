export const PATH_NAME = {
  PAGE404: "*",
  HOME: "/",
  ABOUT_US: "/about-us",
  TRACKING: "/tracking",
  SUPPORT: "/support",
  SERVICE: "/service",
  EXPRESS_DELIVERY: "/service/express-delivery",
  ADDITIONAL_SERVICE: "/service/additional-service",
  PARCEL_RULES: "/service/parcel-rules",

  //AUTHENTICATION
  LOGIN: "/login",
  REGISTER: "/sign-up",
  PIN_CODE: "/pin-code",
  RECOVERY_PASSWORD: "/recovery-password",
  VERIFY_MAIL: "/verify-mail",

  //CUSTOMER
  PROFILE: "/profile",
  HISTORY_ORDERS: "/history-orders",
  HISTORY_PAYMENT: "/history-payment",
  PAYMENT_SUCCESS: "/payment-success",
  PAYMENT_FAILED: "/payment-fail",
  BOOKING_ORDER: "/booking-order",
  TRACKING_ORDER: "/tracking-order",
  PRINT_ORDER: "/print-order",
  POLICY: "/policy",
  CHANGE_PASSWORD: "/change-password",

  //STAFF
  DASHBOARD: "/dashboard",
  DASHBOARD_STAFF_PENDING_ORDER: "/dashboard/staff/pending-order",
  DASHBOARD_STAFF_TRACKING_ORDER: "/dashboard/staff/tracking-order",
  DASHBOARD_STAFF_HANDLED_ORDER: "/dashboard/staff/handled-order",
  DASHBOARD_STAFF_PAYMENT: "/dashboard/staff/payments",
  DASHBOARD_STAFF_TRAIN_INFORMATION: "/dashboard/staff/train-information",
  DASHBOARD_STAFF_ORDER_INFORMATION:
    "/dashboard/staff/order-information/:trackingCode",
  DASHBOARD_STAFF_PROFILE: "/dashboard/staff/profile",
  DASHBOARD_STAFF_TRAIN_MAP: "/dashboard/staff/train-map/:trainId",

  //ADMIN
  DASHBOARD_ADMIN: "/dashboard/admin",
  DASHBOARD_ADMIN_ORDERS: "/dashboard/admin/orders",
  DASHBOARD_ADMIN_USER_MANAGEMENT: "/dashboard/admin/user-management",
  DASHBOARD_ADMIN_STAFF_MANAGEMENT: "/dashboard/admin/staff-management",
  DASHBOARD_ADMIN_STAFF_DETAILS: "/dashboard/admin/staff-details/:staffId",
  DASHBOARD_ADMIN_METRO_LINES_MANAGEMENT:
    "/dashboard/admin/metroline-management",
  DASHBOARD_ADMIN_METRO_TRAINS_MANAGEMENT:
    "/dashboard/admin/metrotrain-management",
  DASHBOARD_ADMIN_PROFILE: "/dashboard/admin/profile",
  DASHBOARD_ADMIN_PARCEL_CATEGORY_MANAGEMENT:
    "/dashboard/admin/parcel-category-manage",
  DASHBOARD_ADMIN_METRO_STATIONS_MANAGEMENT:
    "/dashboard/admin/metrostation-management",
  DASHBOARD_ADMIN_METRO_INSURANCE: "/dashboard/admin/metro-insurance",
  DASHBOARD_ADMIN_METRO_INSURANCE_DETAILS:
    "/dashboard/admin/metro-insurance-details/:insuranceId",
};
