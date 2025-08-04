import api from "./axios";
import { toast } from "react-toastify";

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

export const getAllParcels = async () => {
  try {
    const res = await api.get("/parcels?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu kiện hàng");
  }
};

export const getAllParcelCategories = async () => {
  try {
    const res = await api.get("/parcel-category?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu phân loại kiện hàng");
  }
};

export const getAllStations = async () => {
  try {
    const res = await api.get("/stations");
    return res.data.data;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu các trạm metro");
  }
};

export const getMetroLines = async () => {
  try {
    const res = await api.get("/metro-lines/dropdown");
    return res.data.data;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu các tuyến metro");
  }
};

export const getMetroTimeSlots = async () => {
  try {
    const res = await api.get("/metro-time-slots");
    return res.data.data;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu thời gian biểu của metro");
  }
};

export const getAllTransactions = async () => {
  try {
    const res = await api.get("/transactions?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu giao dịch");
  }
};

export const getAllMetroTrains = async () => {
  try {
    const res = await api.get("/metro-trains?PageSize=1000");
    return res.data;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu các tàu metro");
  }
};

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

export const getShipmentByStaffStation = async (stationId) => {
  try {
    const res = await api.get(`/shipments?PageSize=1000&DepartureStationId=${stationId}`);
    return res.data.data.items;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu đơn hàng do bạn chưa được phân công trạm");
  }
};

export const getAllRegions = async () => {
  try {
    const res = await api.get("/regions?PageSize=1000");
    return res.data.data.items;
  } catch (error) {
    toast.error("Không thể lấy dữ liệu khu vực");
  }
}