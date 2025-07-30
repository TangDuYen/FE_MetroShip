import "./HistoryPayment.scss";

import React, { use, useEffect, useState } from "react";
import { paymentStatusMap, paymentTransactionTypeMap } from "../../constants/statusMap";

import { MdSearch } from "react-icons/md";
import Sidebar from "../../components/sidebar_profile/Sidebar";
import api from "../../config/axios";
import { getAllCustomerShipments } from "../../config/metroApi";

function HistoryPayment() {
  // const allPayments = Array.from({ length: 30 }).map((_, i) => ({
  //   id: i + 1,
  //   transactionCode: `GD00${i + 1}`,
  //   method: i % 2 === 0 ? "Ví điện tử" : "COD",
  //   amount: 50000 + i * 10000,
  //   status: i % 2 === 0 ? "completed" : "pending",
  //   date: `${(i % 28) + 1 < 10 ? "0" : ""}${(i % 28) + 1}/05/2025`,
  // }));

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWindowStart, setPageWindowStart] = useState(1);
  const itemsPerPage = 10;
  const pageWindowSize = 3;
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [allPayments, setAllPayments] = useState([]);

  const [shipmentsMap, setShipmentsMap] = useState({});

  useEffect(() => {
    async function fetchShipments() {
      try {
        const data = await getAllCustomerShipments();
        const map = {};
        data.forEach(item => {
          map[item.id] = item.trackingCode;
        });
        setShipmentsMap(map);
      } catch (err) {
        console.error("Error fetching shipments:", err);
      }
    }
    fetchShipments();
  }, []);

  useEffect(() => {
    if (Object.keys(shipmentsMap).length === 0) return; // chờ map có data

    const fetchPayments = async () => {
      try {
        const res = await api.get("/transactions?PageSize=1000");
        const items = res.data?.data?.items || [];

        const methodMap = {
          1: "Tiền mặt",
          2: "VNPay",
          3: "MoMo",
        };

        const formatted = items.map((item, index) => ({
          id: index + 1,
          trackingCode: shipmentsMap[item.shipmentId] || "Chưa rõ",
          method: methodMap[item.paymentMethod] || "Không rõ",
          status: paymentStatusMap[item.paymentStatus] || "Không rõ",
          statusEnum: item.paymentStatus,
          amount: item.paymentAmount || 0,
          date:
            item.paymentTime && item.paymentTime !== "0001-01-01T00:00:00+00:00"
              ? new Date(item.paymentTime).toLocaleDateString("vi-VN")
              : "Chưa xác định",
          rawDate: item.paymentTime,
          type: paymentTransactionTypeMap[item.transactionType] || "Không rõ",
        }));

        setAllPayments(formatted);
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử thanh toán:", error);
      }
    };

    fetchPayments();
  }, [shipmentsMap]); 

  const filteredPayments = allPayments.filter((item) => {
    const matchSearch =
      (item.paymentTrackingId?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.method?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === "all" || item.statusEnum === Number(filterStatus);
    const matchDateRange =
      (!startDate || item.date >= startDate) &&
      (!endDate || item.date <= endDate);

    return matchSearch && matchStatus && matchDateRange;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const displayedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


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
    <div className="history-payment">
      <section className="history-payment-wrapper">
        <div className="history-payment-row">
          <div className="history-payment-left">
            <Sidebar />
          </div>
          <div className="history-payment-right">
            <div className="history-payment-container">
              <div className="history-payment-header">
                <h3>DANH SÁCH GIAO DỊCH CỦA BẠN</h3>
              </div>

              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Nhập mã giao dịch, phương thức"
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
                  <option value="all">Tất cả trạng thái</option>
                  <option value="1">Đợi thanh toán</option>
                  <option value="2">Đã thanh toán</option>
                  <option value="3">Đã hủy</option>
                  <option value="4">Thất bại</option>
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

              <table className="history-payment-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã đơn hàng</th>
                    <th>Loại giao dịch</th>
                    <th>Phương thức</th>
                    <th>Số tiền</th>
                    <th>Ngày giao dịch</th>
                    <th>Chi tiết</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPayments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-data">
                        Không có bản ghi nào
                      </td>
                    </tr>
                  ) : (
                    displayedPayments.map((item, index) => (
                      <tr key={item.id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{item.trackingCode}</td>
                        <td>{item.type}</td>
                        <td>{item.method}</td>
                        <td>{item.amount.toLocaleString('vi-Vn', { maximumFractionDigits: 0 })}đ</td>
                        <td>{item.date}</td>
                        <td>
                          <span className="detail-link">Chi tiết</span>
                        </td>
                        <td>
                          <span className={`status status-${item.statusEnum}`}>
                            {item.status}
                          </span>
                        </td>


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

export default HistoryPayment;
