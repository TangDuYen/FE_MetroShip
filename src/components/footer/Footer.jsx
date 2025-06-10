import "./Footer.scss";
import { PATH_NAME } from "../../constants/pathname";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import {
  RiFacebookFill,
  RiInstagramFill,
  RiTwitterXFill,
  RiTiktokFill,
} from "react-icons/ri";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer_wrapper">
        <div className="footer-top">
          <div className="footer-logo-img">
            <Link to={PATH_NAME.HOME}>
              <img src={logo} alt="" className="footer-logo" />
            </Link>
          </div>
          <div className="footer_container">
            <h4>Giao hàng</h4>
            <div className="footer_link_container">
              <a href="#" className="footer_link">
                Cá nhân
              </a>
              <a href="#" className="footer_link">
                Bảng giá dịch vụ
              </a>
              <a href="#" className="footer_link">
                Ưu đãi
              </a>
              <a href="#" className="footer_link">
                Câu hỏi thường gặp
              </a>
              <a href="#" className="footer_link">
                Hướng dẫn theo dõi đơn
              </a>
            </div>
          </div>

          <div className="footer_container">
            <h4>Thông tin</h4>
            <div className="footer_link_container">
              <a href="#" className="footer_link">
                Về chúng tôi
              </a>
              <a href="#" className="footer_link">
                Deliver care
              </a>
              <a href="#" className="footer_link">
                Blog
              </a>
              <a href="#" className="footer_link">
                Liên hệ hỗ trợ
              </a>
            </div>
          </div>

          <div className="footer_container">
            <h4>Pháp lý</h4>
            <div className="footer_link_container">
              <a href="#" className="footer_link">
                Chính sách quyền riêng tư
              </a>
              <a href="#" className="footer_link">
                Điều khoản và điều kiện
              </a>

              <div className="footer_social">
                <a href="#">
                  <RiFacebookFill />
                </a>
                <a href="#">
                  <RiInstagramFill />
                </a>
                <a href="#">
                  <RiTiktokFill />
                </a>
                <a href="#">
                  <RiTwitterXFill />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © METROSHIP 2025. ALL RIGHTS RESERVED
        </div>
      </div>
    </footer>
  );
}

export default Footer;
