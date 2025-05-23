import "./Homepage.scss";
import metroShipImg from "../../assets/image_1.png";
import fastDeliveryImg from "../../assets/image_2.png";
import secureSafeImg from "../../assets/image_3.png";
import metroDeliveryImg from "../../assets/image_4.png";
import googlePlay from "../../assets/ggPlay.png";
import appStore from "../../assets/appleStore.png";
import deliveryImage from "../../assets/image_5.png";
import { Avatar, Carousel } from "antd";

function Homepage() {
  const feedbacks = [
    {
      content:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste itaque omnis dolorum, aut mollitia error nam inventore odio placeat quo optio necessitatibus cum labore ratione tempore officiis modi expedita laudantium?",
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/100?img=1",
    },
    {
      content:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste itaque omnis dolorum, aut mollitia error nam inventore odio placeat quo optio necessitatibus cum labore ratione tempore officiis modi expedita laudantium?",
      name: "Trần Thị B",
      avatar: "https://i.pravatar.cc/100?img=2",
    },
    {
      content:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste itaque omnis dolorum, aut mollitia error nam inventore odio placeat quo optio necessitatibus cum labore ratione tempore officiis modi expedita laudantium?",
      name: "Lê Văn C",
      avatar: "https://i.pravatar.cc/100?img=3",
    },
  ];

  const faqs = [
    {
      question: "Làm thế nào để thay đổi địa chỉ giao hàng?",
      answer:
        "Bạn có thể thay đổi địa chỉ giao hàng trước khi đơn hàng được xác nhận bằng cách vào mục 'Đơn hàng của tôi' và chọn 'Chỉnh sửa địa chỉ'.",
    },
    {
      question: "Tôi có thể theo dõi đơn hàng của mình không?",
      answer:
        "Có. MetroShip cung cấp tính năng theo dõi đơn hàng theo thời gian thực. Truy cập mục 'Theo dõi đơn hàng' trên website hoặc ứng dụng.",
    },
    {
      question: "Tài xế có thể quay lại giao nếu tôi vắng nhà không?",
      answer:
        "Trong trường hợp bạn không có mặt, tài xế sẽ liên hệ lại để sắp xếp thời gian giao lại. Bạn cũng có thể chọn nhận hàng tại điểm lấy gần nhất.",
    },
    {
      question: "Số vận đơn của tôi là gì?",
      answer:
        "Số vận đơn là dãy số gồm 10 chữ số được gửi qua SMS/email sau khi đơn hàng được xác nhận.",
    },
    {
      question: "Nếu tôi không ở nhà khi giao hàng thì sao?",
      answer:
        "Tài xế sẽ gọi điện cho bạn. Nếu không liên lạc được, đơn hàng sẽ được giữ tại kho trong 3 ngày để bạn đến nhận hoặc yêu cầu giao lại.",
    },
    {
      question: "Tôi có thể chuyển hướng đơn hàng của mình không?",
      answer:
        "Có. Bạn có thể chuyển hướng đơn hàng sang địa chỉ khác nếu đơn chưa được giao. Vào mục 'Chi tiết đơn hàng' để chỉnh sửa.",
    },
  ];
  return (
    <div className="home">
      <div className="home-container">
        <section className="home-section-1">
          <div className="home-content-1">
            <div className="home-content">
              <h2>Dịch vụ chuyển phát bưu kiện khẩn cấp</h2>
              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. At
                quae quo fugiat distinctio fugit adipisci illum sequi quis
                repudiandae a voluptate soluta recusandae quidem dolor esse,
                iusto sit velit commodi!
              </p>
              <div className="home-btn">
                <button className="btn-learn-more">Tìm hiểu thêm</button>
                <button className="our-policy">Chính sách</button>
              </div>
            </div>
            <div className="home-image-1">
              <img src={metroShipImg} alt="Metro" />
            </div>
          </div>
        </section>

        <section className="home-section-2">
          <h2>Tra cứu vận đơn</h2>
          <form className="tracking-form">
            <div className="form-group">
              <label htmlFor="tracking-code">Mã vận đơn</label>
              <input
                type="text"
                id="tracking-code"
                placeholder="VD: MS123456"
              />
            </div>
            <button type="submit" className="btn-track">
              Tra cứu
            </button>
          </form>
        </section>

        <section className="home-section-3">
          <div className="home-feature-card">
            <img
              src={fastDeliveryImg}
              alt="Fast Delivery"
              className="home-feature-img"
            />
            <h3>Giao hàng nhanh</h3>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente
              error explicabo, ad necessitatibus dolor pariatur temporibus alias
              iure iusto tempore quas nisi porro animi blanditiis dicta, ipsa
              maiores minus saepe!
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
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolores
              eveniet tempore quae autem deleniti ratione incidunt laborum
              magnam quis doloremque labore odit facilis reiciendis unde
              temporibus nam, itaque quam eligendi.
            </p>
          </div>
        </section>

        <section className="home-section-4">
          <div className="home-metro-container">
            <div className="home-metro-image">
              <img src={metroDeliveryImg} alt="Metro Delivery" />
            </div>
            <div className="home-metro-content">
              <h3 className="home-subheading">Chúng tôi là</h3>
              <h2 className="home-heading">
                Dịch vụ bưu kiện tốt nhất từ trước đến nay.
              </h2>
              <p className="home-description">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Autem
                tempore, commodi quos excepturi tempora aliquam eligendi, cumque
                sunt quam magnam dolores quibusdam quae officiis omnis aperiam
                vel alias cupiditate fuga.
              </p>
              <div className="home-features">
                <ul>
                  <ul>
                    <li>
                      <span className="home-check-icon"></span> Tài khoản miễn
                      phí
                    </li>
                    <li>
                      <span className="home-check-icon"></span> Dễ dàng sử dụng
                    </li>
                    <li>
                      <span className="home-check-icon"></span> Chi phí vận
                      chuyển thấp
                    </li>
                  </ul>
                </ul>
                <ul>
                  <ul>
                    <li>
                      <span className="home-check-icon"></span> Tài khoản miễn
                      phí
                    </li>
                    <li>
                      <span className="home-check-icon"></span> Dễ dàng sử dụng
                    </li>
                    <li>
                      <span className="home-check-icon"></span> Chi phí vận
                      chuyển thấp
                    </li>
                  </ul>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section-5">
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
        </section>

        <section className="home-section-6">
          <h2 className="home-faq-title">Câu Hỏi Thường Gặp</h2>
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
              <h4>Để tăng tính trải nghiệm</h4>
              <h2>Hãy tải app của chúng tôi</h2>
              <p>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Vel
                fugit ipsam cupiditate rerum iure voluptate eius consequatur
                suscipit expedita aspernatur temporibus exercitationem hic ad
                veritatis dolor, aut adipisci porro error?
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
