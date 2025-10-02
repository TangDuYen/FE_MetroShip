import api from "./axios";
import { toast } from "react-toastify";

//SHIPMENT
export const getShipmentGuest = async (trackingCode) => {
  try {
    const res = await api.get(`/shipments/guest/${trackingCode}`);
    return {
      data: res.data.data,
      additionalData: res.data.additionalData,
    };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Không thể lấy dữ liệu đơn hàng";
    toast.error(errorMessage);
    throw error;
  }
}

export const getAllShipments = async () => {
  try {
    const res = await api.get("/shipments?PageSize=1000");
    return {
      items: res.data.data.items,
      additionalData: res.data.additionalData,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu đơn hàng";

    toast.error(errorMessage);
    throw error;
  }
};

export const getShipmentByTrackingCode = async (trackingCode) => {
  try {
    const res = await api.get(`/shipments/${trackingCode}`);
    return {
      data: res.data.data,
      additionalData: res.data.additionalData,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu đơn hàng";
    toast.error(errorMessage);
    throw error;
  }
};

export const getAllCustomerShipments = async () => {
  try {
    const res = await api.get("/shipments/customer/history?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu đơn hàng";

    toast.error(errorMessage);
    throw error;
  }
};

export const getShipmentByStaffStation = async (stationId) => {
  try {
    const res = await api.get(`/shipments?PageSize=1000&DepartureStationId=${stationId}`);
    return res.data.data.items;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu đơn hàng do bạn chưa phân công trạm";

    toast.error(errorMessage);
    throw error;
  }
};

export const getShipmentByStaffDestinationStation = async (stationId) => {
  try {
    const res = await api.get(`/shipments?PageSize=1000&ItineraryIncludeStationId=${stationId}`);
    return res.data.data.items;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu đơn hàng do bạn chưa phân công trạm";

    toast.error(errorMessage);
    throw error;
  }
};

export const getShipmentByStaffIncludedStation = async (stationId) => {
  try {
    const res = await api.get(`/shipments?PageSize=1000&DestinationStationId=${stationId}`);
    return res.data.data.items;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu đơn hàng do bạn chưa phân công trạm";

    toast.error(errorMessage);
    throw error;
  }
};

//PARCEL
export const getAllParcels = async () => {
  try {
    const res = await api.get("/parcels?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu kiện hàng";

    toast.error(errorMessage);
    throw error;
  }
};

export const getParcelsByTrackingCode = async (parcelCode) => {
  try {
    const res = await api.get(`/parcels/${parcelCode}`);
    return {
      data: res.data.data,
      additionalData: res.data.additionalData,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu đơn hàng";
    toast.error(errorMessage);
    throw error;
  }
};

//PARCEL-CATEGORY
export const getAllParcelCategories = async () => {
  try {
    const res = await api.get("/parcel-category?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu phân loại kiện hàng";

    toast.error(errorMessage);
    throw error;
  }
};

export const getParcelCategoryById = async (parcelCategoryId) => {
  try {
    const res = await api.get(`/parcel-category/${parcelCategoryId}`);
    return res.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu phân loại kiện hàng";

    toast.error(errorMessage);
    throw error;
  }
};

//TRANSACTION
export const getAllTransactions = async () => {
  try {
    const res = await api.get("/transactions?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu giao dịch";

    toast.error(errorMessage);
    throw error;
  }
};

export const getAllTransactionTypes = async () => {
  try {
    const res = await api.get("/transactions/types");
    return res.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu loại thanh toán";
    toast.error(errorMessage);
    throw error;
  }
}

export const getBanks = async () => {
  try {
    const res = await api.get('/transactions/vietqr/banks');
    return res.data?.data || [];
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu loại thanh toán";
    toast.error(errorMessage);
    throw error;
  }
};

//METROROUTE
export const getMetroLines = async () => {
  try {
    const res = await api.get("/metro-lines");
    return res.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu các tuyến metro";

    toast.error(errorMessage);
    throw error;
  }
};
export const getMetroLinesAdmin = async () => {
  try {
    const res = await api.get("/metro-lines?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu các tuyến metro";

    toast.error(errorMessage);
    throw error;
  }
};

export const getMetroLinesByStation = async (stationId) => {
  try {
    const res = await api.get(`/metro-lines/dropdown?stationId=${stationId}`);
    return res.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu các tuyến metro";

    toast.error(errorMessage);
    throw error;
  }
};

//METRO-TIMESLOT
export const getMetroTimeSlots = async () => {
  try {
    const res = await api.get("/metro-time-slots");
    return res.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu thời gian biểu của metro";

    toast.error(errorMessage);
    throw error;
  }
};

export const getAllTimeSlot = async () => {
  try {
    const res = await api.get("/metro-time-slots/all?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu time slot";
    toast.error(errorMessage);
    throw error;
  }
}

//TRAIN
export const getAllMetroTrains = async () => {
  try {
    const res = await api.get("/metro-trains?PageSize=1000");
    return res.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu các tàu metro";

    toast.error(errorMessage);
    throw error;
  }
};

export const getMetroTrainsByStation = async (stationId) => {
  try {
    const res = await api.get(`/metro-trains?StationId=${stationId}&PageSize=1000`);
    return {
      items: res.data.data.items,
      additionalData: res.data.additionalData,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu tàu";

    toast.error(errorMessage);
    throw error;
  }
}

//STATION
export const getAllStations = async () => {
  try {
    const res = await api.get("/stations");
    return res.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu các trạm metro";

    toast.error(errorMessage);
    throw error;
  }
};

export const getAllStationsAdmin = async () => {
  try {
    const res = await api.get("/stations/all?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu các trạm metro";

    toast.error(errorMessage);
    throw error;
  }
};

export const getAllStationsByRegion = async (regionId) => {
  try {
    const res = await api.get(`/stations?regionId=${regionId}`);
    return res.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu các trạm metro thuộc khu vực này";
    toast.error(errorMessage);
    throw error;
  }
};

export const getNearbyStations = async ({ userLatitude, userLongitude }) => {
  try {
    const res = await api.post("/stations/nearby", { userLatitude, userLongitude });
    return res.data?.data || [];
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Không thể lấy danh sách trạm gần bạn";
    toast.error(errorMessage);
    throw error;
  }
};


//USER
export const getAllCustomer = async () => {
  try {
    const res = await api.get("/users?PageSize=1000&role=3");
    return res.data.data.items;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu khách hàng";

    toast.error(errorMessage);
    throw error;
  }
};

export const getAllStaff = async () => {
  try {
    const res = await api.get("/users?PageSize=1000&role=2");
    return res.data.data.items;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu nhân viên";

    toast.error(errorMessage);
    throw error;
  }
};

export const getAllAsignedStaffRole = async () => {
  try {
    const res = await api.get("/users/assignment-roles");
    return res.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu vai trò của nhân viên";

    toast.error(errorMessage);
    throw error;
  }
};

//REGION
export const getAllRegions = async () => {
  try {
    const res = await api.get("/regions?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu khu vực";

    toast.error(errorMessage);
    throw error;
  }
}

//SUPPORT_TICKETS 
export const getAllSupportTickets = async () => {
  try {
    const res = await api.get("/support-tickets?PageSize=1000");
    return {
      items: res.data.data.items,
      additionalData: res.data.additionalData,
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu phiếu hỗ trợ";

    toast.error(errorMessage);
    throw error;
  }
}

export const getAllSupportTicketsById = async (supportTicketId) => {
  try {
    const res = await api.get(`support-tickets/${supportTicketId}`);
    return res.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu phiếu hỗ trợ";

    toast.error(errorMessage);
    throw error;
  }
}

export const getAllSupportTicketsType = async () => {
  try {
    const res = await api.get("support-tickets/type");
    return res.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu phiếu hỗ trợ";

    toast.error(errorMessage);
    throw error;
  }
}

export const getAllSupportTicketsStatus = async () => {
  try {
    const res = await api.get("support-tickets/status");
    return res.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu phiếu hỗ trợ";

    toast.error(errorMessage);
    throw error;
  }
}

//INSURANCE
export const getAllInsurance = async () => {
  try {
    const res = await api.get("/insurance-policies?PageSize=1000");
    return res.data.items;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu chính sách bảo hiểm";

    toast.error(errorMessage);
    throw error;
  }
}

//PRICE
export const getAllPrice = async () => {
  try {
    const res = await api.get("/pricing?PageSize=1000");
    return res.data.items;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu giá vận chuyển";

    toast.error(errorMessage);
    throw error;
  }
}

//BUSINESS-MEDIA-TYPE
export const getAllBusinessMediaTypes = async () => {
  try {
    const res = await api.get("/media/business-media-type");
    return res.data.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu loại phương tiện kinh doanh";

    toast.error(errorMessage);
    throw error;
  }
}
//STATION BY ID
export const getStationById = async (stationId) => {
  try {
    const res = await api.get(`/stations/${stationId}`);
    return res.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể lấy dữ liệu chi tiết trạm metro";
    toast.error(errorMessage);
    throw error;
  }
};



