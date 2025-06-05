import "./HistoryOrders.scss";

import React, { useState } from "react";

import { MdSearch } from "react-icons/md";
import Sidebar from "../../components/sidebar_profile/Sidebar";

function HistoryOrders() {
  const allGoods = Array.from({ length: 30 }).map((_, i) => ({
    id: i + 1,
    code: `MS00${i + 1}`,
    name: `Hàng hóa ${i + 1}`,
    weight: 100 + i * 10,
    price: 10000 + i * 500,
    size: `10x${i + 1}x5`,
    status: i % 2 === 0 ? "delivered" : "pending",
    deliveryDate: `${(i % 28) + 1 < 10 ? "0" : ""}${(i % 28) + 1}/05/2025`,
  }));

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWindowStart, setPageWindowStart] = useState(1);
  const itemsPerPage = 10;
  const pageWindowSize = 3;

  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredGoods = allGoods.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === "all" || item.status === filterStatus;

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
                  <option value="all">Tất cả trạng thái</option>
                  <option value="delivered">Đã nhận hàng</option>
                  <option value="pending">Đang chờ giao</option>
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
                    <th>Trọng lượng (gram)</th>
                    <th>Tổng phí ship</th>
                    <th>Kích thước (cm)</th>
                    <th>Ngày giao hàng</th>
                    <th>Chi tiết</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedGoods.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="no-data">
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
                          <span className="detail-link">Chi tiết</span>
                        </td>
                        <td>
                          {item.status === "delivered" ? (
                            <span className="status-delivered">
                              Đã nhận hàng
                            </span>
                          ) : (
                            <span className="status-pending">
                              Đang chờ giao
                            </span>
                          )}
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

export default HistoryOrders;
