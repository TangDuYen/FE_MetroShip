import api from "./axios";
import { toast } from "react-toastify";

export const getAllShipments = async () => {
    try {
        const res = await api.get('/shipments?PageSize=1000');
        return res.data.data.items;
    } catch (error) {
        toast.error("Không thể lấy dữ liệu đơn hàng");
    }
};

export const getAllCustomerShipments = async () => {
    try {
        const res = await api.get('/shipments/customer/history?PageSize=1000');
        return res.data.data.items;
    } catch (error) {
        toast.error("Không thể lấy dữ liệu đơn hàng");
    }
};

export const getAllParcels = async () => {
    try {
        const res = await api.get('/parcels?PageSize=1000');
        return res.data.data.items;
    } catch (error) {
        toast.error("Không thể lấy dữ liệu kiện hàng");
    }
};

export const getAllParcelCategories = async () => {
    try {
        const res = await api.get('/parcel-category?PageSize=1000');
        return res.data.data.items;
    } catch (error) {
        toast.error("Không thể lấy dữ liệu phân loại kiện hàng");
    }
};

export const getAllStations = async () => {
    try {
        const res = await api.get('/stations');
        return res.data.data;
    } catch (error) {
        toast.error("Không thể lấy dữ liệu các trạm metro");
    }
};

export const getMetroLines = async () => {
    try {
        const res = await api.get('/metro-lines');
        return res.data.data;
    } catch (error) {
        toast.error("Không thể lấy dữ liệu các tuyến metro");
    }
};

export const getMetroTimeSlots = async () => {
    try {
        const res = await api.get('/metro-time-slots');
        return res.data.data;
    } catch (error) {
        toast.error("Không thể lấy dữ liệu thời gian biểu của metro");
    }
};
