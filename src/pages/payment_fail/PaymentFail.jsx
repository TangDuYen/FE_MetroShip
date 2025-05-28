import React from "react";
import "./PaymentFail.scss";
import { PATH_NAME } from "../../constants/pathname";
import { Link } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";

function PaymentFail() {
  return (
    <div className="payment-fail">
      <div className="card">
        <div className="icon-container">
          <FaTimesCircle className="icon animate-shake" />
        </div>
        <h1>Thanh toán thất bại</h1>
        <p>Rất tiếc! Đã xảy ra lỗi trong quá trình thanh toán.</p>
        <div className="actions">
          <Link to="#" className="btn btn-primary">
            Thử lại
          </Link>
          <Link to={PATH_NAME.HOME} className="btn">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentFail;
