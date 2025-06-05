import React, { useState } from "react";
import "./HistoryPayment.scss";
import Sidebar from "../../components/sidebar_profile/Sidebar";
import { MdSearch } from "react-icons/md";

function HistoryPayment() {
  const allPayments = Array.from({ length: 30 }).map((_, i) => ({
    id: i + 1,
    transactionCode: `GD00${i + 1}`,
    method: i % 2 === 0 ? "Ví điện tử" : "COD",
    amount: 50000 + i * 10000,
    status: i % 2 === 0 ? "completed" : "pending",
    date: `${(i % 28) + 1 < 10 ? "0" : ""}${(i % 28) + 1}/05/2025`,
  }));

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWindowStart, setPageWindowStart] = useState(1);
  const itemsPerPage = 10;
  const pageWindowSize = 3;
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredPayments = allPayments.filter((item) => {
    const matchSearch =
      item.transactionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.method.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === "all" || item.status === filterStatus;

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
                  <option value="completed">Đã thanh toán</option>
                  <option value="pending">Chưa thanh toán</option>
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
                    <th>Mã giao dịch</th>
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
                        <td>{item.transactionCode}</td>
                        <td>{item.method}</td>
                        <td>{item.amount.toLocaleString()}đ</td>
                        <td>{item.date}</td>
                        <td>
                          <span className="detail-link">Chi tiết</span>
                        </td>
                        <td>
                          {item.status === "completed" ? (
                            <span className="status-completed">
                              Đã thanh toán
                            </span>
                          ) : (
                            <span className="status-pending">
                              Chưa thanh toán
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

export default HistoryPayment;
