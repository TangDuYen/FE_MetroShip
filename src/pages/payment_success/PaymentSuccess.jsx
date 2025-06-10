import "./PaymentSuccess.scss";

import React, { useEffect } from "react";

import { FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { PATH_NAME } from "../../constants/pathname";
import confetti from "canvas-confetti";

function PaymentSuccess() {
  useEffect(() => {
    // delay 500ms rồi mới bắn pháo giấy
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 500);
  }, []);
  return (
    <div className="payment-success">
      <div className="card">
        <div className="icon-container">
          <FaCheckCircle className="icon animate-pop" />
        </div>
        <h1>Thanh toán thành công!</h1>
        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
        <p>Mã đơn hàng của bạn đã được xác nhận và đang chờ xử lý.</p>
        <div className="actions">
          <Link to={PATH_NAME.HISTORY_ORDERS} className="btn btn-primary">
            Xem đơn hàng
          </Link>
          <Link to={PATH_NAME.HOME} className="btn">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
