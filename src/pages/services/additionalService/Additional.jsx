import React from 'react'
import "./Additional.scss"
import example from "../../../assets/example.png";
import Banner from "../banner/Banner";
function Additional() {
  return (
    <div className="additional-container">
    <Banner/>
      <div className="additional">
        <h1>DỊCH VỤ CỘNG THÊM</h1>

        <section>
          <h2>I. Định nghĩa</h2>
          <p>
            <strong>Dịch vụ cộng thêm</strong> là các dịch vụ cộng thêm cho dịch vụ chính, nhằm đáp ứng các yêu cầu phát sinh đặt biệt của khách hàng. Hỗ trợ cho các khâu nhận, vận chuyển, giao.
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
  )
}

export default Additional