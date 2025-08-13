import api from "./axios";
import { toast } from "react-toastify";

//SHIPMENT
export const getAllShipments = async () => {
  try {
    const res = await api.get("/shipments?PageSize=1000");
    return {
      items: res.data.data.items,
      additionalData: res.data.additionalData,
    };
  } catch (error) {
    toast.error("Không thể lấy dữ liệu đơn hàng");
  }
};

export const getAllCustomerShipments = async () => {
  try {
    const res = await api.get("/shipments/customer/history?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu đơn hàng");
  }
};

export const getShipmentByStaffStation = async (stationId) => {
  try {
    const res = await api.get(`/shipments?PageSize=1000&DepartureStationId=${stationId}`);
    return res.data.data.items;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu đơn hàng do bạn chưa được phân công trạm");
  }
};

//PARCEL
export const getAllParcels = async () => {
  try {
    const res = await api.get("/parcels?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu kiện hàng");
  }
};

//PARCEL-CATEGORY
export const getAllParcelCategories = async () => {
  try {
    const res = await api.get("/parcel-category?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu phân loại kiện hàng");
  }
};

//PRICING

//TRANSACTION
export const getAllTransactions = async () => {
  try {
    const res = await api.get("/transactions?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu giao dịch");
  }
};

export const getAllTransactionTypes = async () => {
  try {
    const res = await api.get("/transactions/types");
    return res.data;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu loại thanh toán");
  }
}

//METROROUTE
export const getMetroLines = async () => {
  try {
    const res = await api.get("/metro-lines/dropdown");
    return res.data.data;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu các tuyến metro");
  }
};

export const getMetroLinesByStation = async (stationId) => {
  try {
    const res = await api.get(`/metro-lines/dropdown?stationId=${stationId}`);
    return res.data.data;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu các tuyến metro");
  }
};

//METRO-TIMESLOT
export const getMetroTimeSlots = async () => {
  try {
    const res = await api.get("/metro-time-slots");
    return res.data.data;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu thời gian biểu của metro");
  }
};

//TRAIN
export const getAllMetroTrains = async () => {
  try {
    const res = await api.get("/metro-trains?PageSize=1000");
    return res.data;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu các tàu metro");
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
    toast.error("Không thể lấy dữ liệu tàu");
  }
}

//STATION
export const getAllStations = async () => {
  try {
    const res = await api.get("/stations");
    return res.data.data;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu các trạm metro");
  }
};

//USER
export const getAllCustomer = async () => {
  try {
    const res = await api.get("/users?PageSize=1000&role=3");
    return res.data.data.items;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu người dùng");
  }
};

export const getAllStaff = async () => {
  try {
    const res = await api.get("/users?PageSize=1000&role=2");
    return res.data.data.items;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu người dùng");
  }
};

export const getAllAsignedStaffRole = async () => {
  try {
    const res = await api.get("/users/assignment-roles");
    return res.data.data;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu vai trò của nhân viên");
  }
};

//REGION
export const getAllRegions = async () => {
  try {
    const res = await api.get("/regions?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu khu vực");
  }
}


