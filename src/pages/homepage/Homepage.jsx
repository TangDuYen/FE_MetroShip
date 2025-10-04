import "./Homepage.scss";

import { Avatar, Carousel } from "antd";

import { Link } from "react-router-dom";
import { PATH_NAME } from "../../constants/pathname";
import appStore from "../../assets/appleStore.png";
import deliveryImage from "../../assets/image_5.png";
import fastDeliveryImg from "../../assets/image_2.png";
import googlePlay from "../../assets/ggPlay.png";
import metroDeliveryImg from "../../assets/image_4.png";
import metroShipImg from "../../assets/image_1.png";
import secureSafeImg from "../../assets/image_3.png";

function Homepage() {
  const feedbacks = [
    {
      content:
        "Dịch vụ của MetroShip rất nhanh chóng và chuyên nghiệp. Tôi gửi hàng từ Hà Nội vào TP.HCM chỉ mất 1 ngày! Giao diện tra cứu đơn hàng cũng rất dễ sử dụng.",
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/100?img=1",
    },
    {
      content:
        "Tôi rất yên tâm khi sử dụng MetroShip để gửi quà cho người thân ở nước ngoài. Thời gian vận chuyển đúng như cam kết và đội ngũ hỗ trợ nhiệt tình.",
      name: "Trần Thị B",
      avatar: "https://i.pravatar.cc/100?img=2",
    },
    {
      content:
        "Lần đầu sử dụng MetroShip nhưng tôi thật sự hài lòng. Hệ thống theo dõi đơn hàng rõ ràng, nhân viên giao hàng lịch sự và đúng giờ.",
      name: "Lê Văn C",
      avatar: "https://i.pravatar.cc/100?img=3",
    },
  ];

  const faqs = [
  {
    question: "Tôi có thể theo dõi đơn hàng của mình không?",
    answer:
      "Có. MetroShip cho phép bạn theo dõi đơn hàng theo thời gian thực. Truy cập mục 'Theo dõi đơn hàng' trên website hoặc ứng dụng để kiểm tra trạng thái.",
  },
  {
    question: "Nếu tôi vắng mặt, đơn hàng sẽ được xử lý thế nào?",
    answer:
      "MetroShip không giao tận nhà. Bạn có thể nhận hàng tại các điểm lấy gần nhất. Nếu cần hỗ trợ, nhân viên sẽ liên hệ bạn để hướng dẫn.",
  },
  {
    question: "Số vận đơn của tôi là gì?",
    answer:
      "Số vận đơn là dãy 10 chữ số được gửi qua SMS hoặc email sau khi đơn hàng được xác nhận. Dùng số này để tra cứu đơn hàng tại điểm nhận.",
  },
  {
    question: "Tôi có thể chuyển hướng đơn hàng của mình không?",
    answer:
      "Có. Nếu đơn hàng chưa được lấy, bạn có thể thay đổi điểm nhận. Vào mục 'Chi tiết đơn hàng' trên ứng dụng hoặc website để chỉnh sửa.",
  },
];

  return (
    <div className="home">
      <div className="home-container">
        <section className="home-section-1">
          <div className="home-content-1">
            <div className="home-content">
              <h2>MetroShip - Giao hàng nhanh, an toàn, toàn quốc</h2>
              <p>
                MetroShip cung cấp dịch vụ chuyển phát bưu kiện khẩn cấp với tốc
                độ vượt trội, theo dõi hành trình vận đơn theo thời gian thực.
                Với mạng lưới phủ khắp toàn quốc và quốc tế, chúng tôi cam kết
                giao hàng đúng hẹn, hỗ trợ 24/7 và chính sách đảm bảo tối đa
                quyền lợi khách hàng.
              </p>
              <div className="home-btn">
                <button className="btn-learn-more">Tìm hiểu thêm</button>
                <button className="our-policy">Chính sách</button>
              </div>
            </div>
            <div className="home-image-1">
              <img src={metroShipImg} alt="MetroShip - Dịch vụ vận chuyển" />
            </div>
          </div>
        </section>

        {/* <section className="home-section-2">
          <h2>Tra cứu vận đơn</h2>
          <form className="tracking-form">
            <div className="form-group">
              <label htmlFor="tracking-code">Mã vận đơn</label>
              <input
                type="text"
                id="tracking-code"
                placeholder="Nhập mã vận đơn (VD: MS123456)"
              />
            </div>
            <Link to={PATH_NAME.TRACKING}>
              <button type="submit" className="btn-track">
                Tra cứu
              </button></Link>

          </form>
        </section> */}

        <section className="home-section-3">
          <div className="home-feature-card">
            <img
              src={fastDeliveryImg}
              alt="Fast Delivery"
              className="home-feature-img"
            />
            <h3>Giao hàng nhanh</h3>
            <p>
              Với hệ thống vận hành hiện đại và đội ngũ giao hàng chuyên nghiệp,
              MetroShip cam kết giao hàng siêu tốc trong ngày tại nội thành và
              từ 1-2 ngày đối với liên tỉnh. Theo dõi trạng thái đơn hàng theo
              thời gian thực.
            </p>
          </div>
          <div className="home-feature-card">
            <img
              src={secureSafeImg}
              alt="Secure & Safe"
              className="home-feature-img"
            />
            <h3>Bảo mật & An toàn</h3>
            <p>
              Mỗi bưu kiện đều được quản lý chặt chẽ từ lúc gửi đến lúc nhận.
              MetroShip sử dụng hệ thống mã hóa thông tin và quy trình kiểm soát
              nội bộ nghiêm ngặt, đảm bảo an toàn tuyệt đối cho hàng hóa và dữ
              liệu người dùng.
            </p>
          </div>
        </section>

        <section className="home-section-4">
          <div className="home-metro-container">
            <div className="home-metro-image">
              <img src={metroDeliveryImg} alt="Metro Delivery" />
            </div>
            <div className="home-metro-content">
              <h3>Chúng tôi là</h3>
              <h2>Dịch vụ bưu kiện hàng đầu Việt Nam</h2>
              <p>
                MetroShip tự hào mang đến giải pháp chuyển phát nhanh hiện đại,
                an toàn và tiết kiệm. Với mạng lưới trải rộng khắp cả nước và
                quốc tế, chúng tôi giúp hàng hóa của bạn được vận chuyển nhanh
                chóng và theo dõi dễ dàng mọi lúc mọi nơi.
              </p>
              <div className="home-features">
                <ul>
                  <ul>
                    <li>
                      <span className="home-check-icon"></span> Tài khoản miễn
                      phí, đăng ký dễ dàng
                    </li>
                    <li>
                      <span className="home-check-icon"></span> Giao diện thân
                      thiện, dễ sử dụng
                    </li>
                    <li>
                      <span className="home-check-icon"></span> Chi phí vận
                      chuyển cạnh tranh
                    </li>
                  </ul>
                </ul>
                <ul>
                  <ul>
                    <li>
                      <span className="home-check-icon"></span> Hệ thống theo
                      dõi đơn hàng thông minh
                    </li>
                    <li>
                      <span className="home-check-icon"></span> Hỗ trợ 24/7 mọi
                      thắc mắc của khách hàng
                    </li>
                  </ul>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* <section className="home-section-5">
          <div className="home-feedback-container">
            <h2>Phản hồi của người dùng</h2>
            <Carousel autoplay>
              {feedbacks.map((item, index) => (
                <div key={index}>
                  <div className="home-carousel">
                    <div className="home-feedback">
                      <strong>{item.content}</strong>
                      <div className="home-fb-avtar">
                        <Avatar
                          size={64}
                          src={item.avatar}
                          style={{ marginBottom: 8 }}
                        />
                        <div>{item.name}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </section> */}

        <section className="home-section-6">
          <h2>Câu Hỏi Thường Gặp</h2>
          <div className="home-faq-grid">
            {faqs.map((faq, index) => (
              <div className="home-faq-item" key={index}>
                <h3 className="home-faq-question">{faq.question}</h3>
                <p className="home-faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="home-section-7">
          <div className="home-download-content">
            <div className="home-download-image">
              <img src={deliveryImage} alt="Delivery Van" />
            </div>
            <div className="home-download-text">
              <h4>Trải nghiệm vận chuyển thông minh</h4>
              <h2>Tải ứng dụng MetroShip ngay hôm nay</h2>
              <p>
                Dễ dàng tạo đơn hàng, theo dõi hành trình vận chuyển theo thời
                gian thực, nhận thông báo trạng thái, và quản lý lịch sử gửi
                hàng mọi lúc mọi nơi chỉ với vài thao tác. MetroShip – đồng hành
                cùng bạn trên mọi hành trình!
              </p>
              <div className="app-buttons">
                <a href="#">
                  <img src={googlePlay} alt="Google Play" />
                </a>
                <a href="#">
                  <img src={appStore} alt="App Store" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Homepage;
