import "./Service.scss";

import Banner from "./banner/Banner";
import { PATH_NAME } from "../../constants/pathname";
import React from "react";

function Service() {
  const services = [
    {
      title: "Chuyển phát Nhanh",
      description:
        "Chuyển phát Nhanh là dịch vụ nhận gửi, vận chuyển và giao nhanh các loại hàng hóa, tài liệu theo thời gian giao hàng nhanh.",
      link: PATH_NAME.EXPRESS_DELIVERY,
    },
    {
      title: "Dịch vụ cộng thêm",
      description:
        "Dịch vụ cộng thêm là các dịch vụ cộng thêm cho dịch vụ chính, nhằm đáp ứng các yêu cầu phát sinh đặt biệt của khách hàng. Hỗ trợ cho các khâu nhận, vận chuyển, giao.",
      link: PATH_NAME.ADDITIONAL_SERVICE,
    },
    {
      title: "Quy trình, quy định giải quyết khiếu nại",
      description:
        "Thống nhất phương thức tiếp nhận, quy cách xử lý khiếu nại trên toàn hệ thống Viettel. Đảm bảo tính nhất quán, triệt để và đặt mục tiêu khách hàng hài lòng sau xử lý ...",
      link: "#",
    },
    {
      title: "Nguyên tắc bồi thường thiệt hại, mức bồi thường thiệt hại",
      description:
        "I. Mức giới hạn trách nhiệm bồi thường khi mất Bưu gửi. 1. Đối với bưu gửi là vật phẩm, hàng hóa sử dụng dịch vụ bưu chính trong nước...",
      link: "#",
    },
    {
      title: "Quy định hàng cấm gửi, gửi có điều kiện",
      description:
        "Thuốc phiện, các hợp chất từ thuốc phiện, các chất ma túy, các chất kích thích thần kinh. 2. Vũ khí, đạn dược, chất nổ, trang thiết bị quân sự. 3. Các loại văn hóa phẩm đồi trụy, phản động,....",
      link: PATH_NAME.PARCEL_RULES,
    },
    {
      title: "Quy định về điều kiện cung ứng dịch vụ bưu chính",
      description:
        "1. Đối với hàng hóa có thể tách rời, không đóng gói quá 40 kg/ kiện, tải. 2. Hàng hóa phải xếp, chèn chặt thành một khối thống nhất. 3. Nếu có nhiều vật phẩm trong thùng/hộp phải gói bọc riêng từng vật phẩm và được chèn chặt...",
      link: "#",
    },
    {
      title: "Quyền, nghĩa vụ của MetroShip",
      description:
        "- Yêu cầu Khách Hàng cung cấp thông tin theo quy định pháp luật khi đăng ký sử dụng phần mềm để cung ứng Dịch Vụ. - Từ chối tiếp nhận bưu gửi nếu bưu gửi không...",
      link: "#",
    },
    {
      title: "Quyền, nghĩa vụ của khách hàng",
      description:
        "- Được cung cấp đầy đủ thông tin liên quan đến dịch vụ mà khách hàng sử dụng. - Được đảm bảo an toàn thông tin bưu gửi trong quá trình sử dụng dịch vụ. - Được khiếu nại về dịch vụ đã sử dụng theo nội dung công bố của MetroShip....",
      link: "#",
    },
  ];
  return (
    <div className="service-container">
      <Banner />
      <div className="service-grid">
        {services.map((service, index) => (
          <div className="service" key={index}>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <a href={service.link} className="detail-link">
              Chi tiết →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Service;
