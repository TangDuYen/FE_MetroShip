import "./AboutUs.scss";

import {
  FaMapMarkedAlt,
  FaShieldAlt,
  FaShippingFast,
  FaTrophy,
} from "react-icons/fa";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/features/counterSlice";
import { toast } from "react-toastify";
import { PATH_NAME } from "../../constants/pathname";
import { Link } from "react-router-dom";

function AboutUs() {
  const user = useSelector(selectUser);

  const handleClick = () => {
    toast.info("Bạn cần phải đăng nhập để sử dụng chức năng này", 3000);
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      const section = document.getElementById("parallax");
      if (section) {
        section.style.backgroundPosition = `center ${offset * 0.5}px`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <FaShieldAlt />,
      title: "An toàn tuyệt đối",
      desc: "MetroShip đảm bảo bưu kiện của bạn được bảo vệ nghiêm ngặt, từ khâu tiếp nhận đến khi giao đến tay người nhận.",
    },
    {
      icon: <FaShippingFast />,
      title: "Giao hàng siêu tốc",
      desc: "Dịch vụ vận chuyển nhanh chóng trong nước và quốc tế với hệ thống tuyến đường tối ưu và đội ngũ giao nhận chuyên nghiệp.",
    },
    {
      icon: <FaMapMarkedAlt />,
      title: "Theo dõi trực tuyến",
      desc: "Bạn có thể dễ dàng theo dõi trạng thái đơn hàng theo thời gian thực trên hệ thống MetroShip mọi lúc, mọi nơi.",
    },
    {
      icon: <FaTrophy />,
      title: "Đối tác tin cậy",
      desc: "Hàng nghìn khách hàng doanh nghiệp và cá nhân đã và đang tin dùng MetroShip như một giải pháp giao hàng ổn định và hiệu quả.",
    },
  ];

  return (
    <div className="about">
      <div className="about-container">
        <section className="about-section-1">
          <div className="about-metro-container">
            <div className="about-metro-image">
              <img
                src="https://tphcm.cdnchinhphu.vn/zoom/700_438/334895287454388224/2023/8/23/metro-so-1-16618572668742131228344-16882866714571847829823-16927939569321374898356-0-0-1051-1682-crop-16927939823491446240677.jpg"
                alt="Metro Delivery"
              />
            </div>
            <div className="about-metro-content">
              <h2 className="about-heading">Về công ty của chúng tôi</h2>
              <p className="about-description">
                MetroShip là đơn vị tiên phong trong lĩnh vực vận chuyển bưu
                kiện nội địa và quốc tế tại Việt Nam, cung cấp giải pháp giao
                nhận hiện đại, nhanh chóng và an toàn cho mọi khách hàng. Với hệ
                thống kho bãi thông minh, đội ngũ nhân viên chuyên nghiệp và nền
                tảng công nghệ mạnh mẽ, chúng tôi cam kết mang đến trải nghiệm
                vận chuyển tối ưu – từ khâu tạo đơn, theo dõi hành trình, đến
                lúc giao hàng tận tay.
                <br />
                MetroShip không chỉ đơn thuần là dịch vụ vận chuyển, mà là người
                bạn đồng hành đáng tin cậy trong mọi hoạt động kinh doanh và
                cuộc sống cá nhân của bạn.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section-2">
          <div className="container">
            <div className="content">
              <h2>Tại sao chọn chúng tôi</h2>
              <p className="intro">
                MetroShip không chỉ cung cấp dịch vụ giao nhận thông thường, mà
                còn mang đến trải nghiệm vận chuyển toàn diện – nhanh, an toàn,
                dễ kiểm soát và đáng tin cậy. Với đội ngũ chuyên nghiệp và nền
                tảng công nghệ tiên tiến, chúng tôi là lựa chọn hàng đầu cho mọi
                nhu cầu giao hàng của bạn.
              </p>
              <div className="features">
                {features.map((item, index) => (
                  <div className="feature-box" key={index}>
                    <div className="icon">{item.icon}</div>
                    <div className="text">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="image">
              <img
                src="https://demo.themenio.com/tranship/image/ser-img.png"
                alt="Why Choose Us"
              />
            </div>
          </div>
        </section>

        <section className="about-section-3" id="parallax">
          <div className="overlay">
            <div className="container">
              <div className="content">
                <h2>
                  Chúng tôi tận tâm cung cấp những dịch vụ chất lượng cao với
                  mức chi phí tiết kiệm tối đa.
                </h2>
                {/* <button>Tạo đơn ngay</button> */}

                {user ? (
                  <Link to={PATH_NAME.BOOKING_ORDER}>
                    <button>Tạo đơn ngay</button>
                  </Link>
                ) : (
                  <Link to={PATH_NAME.LOGIN}>
                    <button onClick={handleClick}>Tạo đơn</button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutUs;
