import "./HistoryOrders.scss";

import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";
import { MdSearch } from "react-icons/md";
import { PATH_NAME } from "../../constants/pathname";
import Sidebar from "../../components/sidebar_profile/Sidebar";
import api from "../../config/axios";
import { toast } from "react-toastify";

function HistoryOrders() {

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWindowStart, setPageWindowStart] = useState(1);
  const itemsPerPage = 10;
  const pageWindowSize = 3;

  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const shipmentStatusMap = {
    0: "Đang xử lý",
    1: "Đã từ chối",
    2: "Xác nhận một phần",
    3: "Đã xác nhận",
    4: "Chưa thanh toán",
    5: "Đã hủy",
    6: "Chờ hoàn tiền",
    7: "Đã hoàn tiền",
    8: "Không có điểm gửi hàng",
    9: "Đã thanh toán",
    10: "Đã lấy hàng",
    11: "Đang vận chuyển",
    12: "Chờ giao hàng",
    13: "Đang áp dụng phụ phí",
    14: "Hết hạn",
    15: "Chờ phản hồi",
    16: "Hoàn thành",
  };
  const statusOptions = Object.entries(shipmentStatusMap).map(([value, label]) => ({
    value,
    label,
  }));


  // useEffect(() => {
  //   const fetchParcels = async () => {
  //     try {
  //       const res = await api.get("parcels");
  //       const items = res.data?.data?.items || [];

  //       // Chuyển đổi dữ liệu API sang định dạng mong muốn
  //       const convertedGoods = items.map((item, index) => ({
  //         id: index + 1,
  //         shipmentId: item.shipmentId,
  //         code: item.parcelCode || "N/A",
  //         name: item.parcelCategory?.categoryName || "Chưa rõ",
  //         weight: item.chargeableWeightKg || 0,
  //         price: parseFloat(item.priceVnd || "0"),
  //         size: item.volumeCm3,
  //         status: item.parcelTrackings?.[0]?.status || "Unknown",
  //       }));

  //       setGoods(convertedGoods);
  //     } catch (error) {
  //       console.error("Error fetching parcels:", error);
  //     }
  //   };

  //   fetchParcels();
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parcelsRes, shipmentsRes] = await Promise.all([
          api.get("parcels?PageSize=1000"),
          api.get("/shipments/customer/history?PageSize=1000"),
        ]);

        const parcelItems = parcelsRes.data?.data?.items || [];
        const shipmentItems = shipmentsRes.data?.data?.items || [];


        const shipmentMap = new Map(
          shipmentItems.map((item) => [
            item.trackingCode,
            {
              date: item.scheduledDateTime
                ? new Date(item.scheduledDateTime).toLocaleDateString("vi-VN")
                : "",

              status: item.shipmentStatus,
              bookedAt: item.bookedAt,
            }
          ])
        );
        const convertedGoods = parcelItems.map((item, index) => {
          // Lấy trackingCode từ parcelCode: loại bỏ phần hậu tố (vd "-01")
          const baseTrackingCode = item.parcelCode
            ? item.parcelCode.split("-").slice(0, -1).join("-")
            : "";
          const shipmentInfo = shipmentMap.get(baseTrackingCode) || {};
          return {
            id: index + 1,
            shipmentId: item.shipmentId,
            code: item.parcelCode || "N/A",
            name: item.parcelCategory?.categoryName || "Chưa rõ",
            weight: item.chargeableWeightKg || 0,
            price: parseFloat(item.priceVnd || "0"),
            size: item.volumeCm3,
            // status: item.parcelTrackings?.[0]?.status || "Unknown",
            deliveryDate: shipmentInfo.date || "N/A",
            shipmentStatus: shipmentInfo.status,
            bookedAt: shipmentInfo.bookedAt,
          };
        });

        setOrders(convertedGoods.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt)));
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();
  }, []);

  const handlePayment = async (shipmentId) => {
    try {
      const payload = {
        shipmentId,
        returnUrl: "http://localhost:5173/payment-success",
        cancelUrl: "http://localhost:5173/payment-fail",
      };

      const res = await api.post("/shipments/vnpay/payment-url", payload);
      console.log(res.data);

      // statusCode nằm trực tiếp trong res.data
      if (res.data?.statusCode === 200 && res.data.data) {
        window.location.href = res.data.data; // Redirect to VNPay
      } else {
        toast.error("Không lấy được link thanh toán!");
      }
    } catch (err) {
      console.error("Lỗi khi thanh toán:", err);
      toast.error("Đã xảy ra lỗi khi tạo liên kết thanh toán.");
    }
  };


  const filteredGoods = orders.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === "all" || item.shipmentStatus === parseInt(filterStatus, 10);


    const matchDateRange =
      (!startDate || item.deliveryDate >= startDate) &&
      (!endDate || item.deliveryDate <= endDate);

    return matchSearch && matchStatus && matchDateRange;
  });

  const totalPages = Math.ceil(filteredGoods.length / itemsPerPage);

  const displayedGoods = filteredGoods.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const hasPayment = displayedGoods.some((item) => item.status === 3);

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleNextWindow = () => {
    const newStart = Math.min(
      pageWindowStart + 1,
      totalPages - pageWindowSize + 1
    );
    setPageWindowStart(newStart);
    setCurrentPage(newStart);
  };

  const handlePrevWindow = () => {
    const newStart = Math.max(pageWindowStart - 1, 1);
    setPageWindowStart(newStart);
    setCurrentPage(newStart);
  };

  const paginationButtons = [];
  for (
    let i = pageWindowStart;
    i < pageWindowStart + pageWindowSize && i <= totalPages;
    i++
  ) {
    paginationButtons.push(
      <button
        key={i}
        className={currentPage === i ? "active" : ""}
        onClick={() => handlePageClick(i)}
      >
        {i}
      </button>
    );
  }
  return (
    <div className="history-order">
      <section className="history-order-wrapper">
        <div className="history-order-row">
          <div className="history-order-left">
            <Sidebar />
          </div>
          <div className="history-order-right">
            <div className="goods-container">
              <div className="goods-header">
                <h3>DANH SÁCH ĐƠN HÀNG CỦA BẠN</h3>
              </div>

              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Nhập mã hàng hóa, tên hàng hóa"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // reset về trang 1 khi tìm
                  }}
                />
                <button className="btn-search">
                  <MdSearch className="icon-search" />
                </button>
              </div>

              <div className="filter-bar">
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <span>đến</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <table className="goods-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã hàng hóa</th>
                    <th>Tên hàng hóa</th>
                    <th>Trọng lượng (kilogram)</th>
                    <th>Tổng chi phí (vnd)</th>
                    <th>Thể tích (cm³)</th>
                    <th>Ngày gửi hàng</th>
                    <th>Chi tiết</th>
                    <th>Trạng thái</th>
                    {hasPayment && <th>Hành động</th>}
                  </tr>
                </thead>
                <tbody>
                  {displayedGoods.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="no-data">
                        Không có bản ghi nào
                      </td>
                    </tr>
                  ) : (
                    displayedGoods.map((item, index) => (
                      <tr key={item.id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{item.code}</td>
                        <td>{item.name}</td>
                        <td>{item.weight}</td>
                        <td>{item.price.toLocaleString()}</td>
                        <td>{item.size}</td>
                        <td>{item.deliveryDate}</td>
                        <td>
                          <Link to={PATH_NAME.TRACKING_ORDER}>
                            <span className="detail-link">Chi tiết</span>
                          </Link>
                        </td>
                        <td>
                          <span className={`status-${item.shipmentStatus}`}>
                            {shipmentStatusMap[item.shipmentStatus] || "Không rõ"}
                          </span>
                        </td>


                        {item.shipmentStatus === 3 ? (
                          <td>
                            <button
                              className="pay-button"
                              onClick={() => handlePayment(item.shipmentId)}
                            >
                              Thanh toán
                            </button>
                          </td>
                        ) : hasPayment ? (
                          <td>-</td>
                        ) : null}

                        {/* <td><button className="pay-button" onClick={() => handlePayment(item.shipmentId)}>Thanh toán</button></td> */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* PHÂN TRANG */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={handlePrevWindow}
                    disabled={pageWindowStart === 1}
                  >
                    «
                  </button>
                  {paginationButtons}
                  <button
                    onClick={handleNextWindow}
                    disabled={
                      pageWindowStart + pageWindowSize - 1 >= totalPages
                    }
                  >
                    »
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HistoryOrders;
