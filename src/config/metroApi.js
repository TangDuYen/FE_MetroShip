import api from "./axios";
import { toast } from "react-toastify";

export const getAllShipments = async () => {
    try {
        const res = await api.get('/shipments?PageSize=1000');
        return res.data.data.items;
    } catch (error) {
        toast.error("Không thể lấy dữ liệu đơn hàng")
    }
};

export const getAllParcels = async () => {
    const res = await api.get('/parcels?PageSize=1000');
    return res.data.data.items;
};

export const getAllStations = async () => {
    const res = await api.get('/stations');
    return res.data.data;
};

export const getMetroLines = async () => {
    const res = await api.get('/metro-lines');
    return res.data.data;
};

export const getMetroTimeSlots = async () => {
    const res = await api.get('/metro-time-slots');
    return res.data.data;
};
