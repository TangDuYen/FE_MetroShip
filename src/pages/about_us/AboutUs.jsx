import React, { useEffect } from "react";
import "./AboutUs.scss";
import {
  FaShieldAlt,
  FaShippingFast,
  FaMapMarkedAlt,
  FaTrophy,
} from "react-icons/fa";

function AboutUs() {
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
      title: "An toàn",
      desc: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    },
    {
      icon: <FaShippingFast />,
      title: "Giao hàng nhanh",
      desc: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    },
    {
      icon: <FaMapMarkedAlt />,
      title: "Theo dõi dễ dàng",
      desc: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    },
    {
      icon: <FaTrophy />,
      title: "Đáng tin cậy",
      desc: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
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
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Autem
                tempore, commodi quos excepturi tempora aliquam eligendi, cumque
                sunt quam magnam dolores quibusdam quae officiis omnis aperiam
                vel alias cupiditate fuga. Sed ut perspiciatis unde omnis iste
                natus error sit voluptatem accusantium dolore mque laudantium,
                totam rem aperiam, eaque ipsa quae ab illo inventore veritatis
                et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim
                ipsam voluptatem quia voluptas sit aspernatur aut odit aut
                fugit, sed quia consequuntur magni dolores eos qui ratione
                voluptatem sequi nesciunt.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section-2">
          <div className="container">
            <div className="content">
              <h2>Tại sao chọn chúng tôi</h2>
              <p className="intro">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Veniam quis nostrud exercitation ullamco laboris nisi ut
                aliquip.
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
                <button>Tạo đơn ngay</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutUs;
