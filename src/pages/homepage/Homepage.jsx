import "./Homepage.scss";
import image_1 from "../../assets/image_1.png";

function Homepage() {
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
              <img src={image_1} alt="" />
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
      </div>
    </div>
  );
}

export default Homepage;
