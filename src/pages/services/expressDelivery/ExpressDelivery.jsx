import React from "react";
import "./ExpressDelivery.scss";
import example from "../../../assets/example.png";
import Banner from "../banner/Banner";

function ExpressDelivery() {
  return (
    <div className="express-delivery-container">
    <Banner/>
      <div className="express-delivery">
        <h1>CHUYỂN PHÁT NHANH</h1>

        <section>
          <h2>I. Định nghĩa</h2>
          <p>
            <strong>Chuyển phát Nhanh</strong> là dịch vụ nhận gửi, vận chuyển
            và giao nhanh các loại hàng hóa, tài liệu theo thời gian giao hàng
            nhanh.
          </p>
        </section>

        <section>
          <h2>II. Bảng giá dịch vụ</h2>
          <img
            src={example}
            alt="Bảng giá chuyển phát nhanh"
            className="price-image"
          />
        </section>
      </div>
    </div>
  );
}

export default ExpressDelivery;
