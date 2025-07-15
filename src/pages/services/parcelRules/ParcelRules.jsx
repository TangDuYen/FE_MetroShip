import './ParcelRule.scss';

import { Divider, Typography } from 'antd';

const { Title, Paragraph } = Typography;

function ParcelRules() {
  return (
    <div className="parcel-rules-container" style={{ padding: '20px' }}>
      <Title level={1} className="main-title">Chính Sách Gửi Hàng – MetroShip</Title>

      <Divider />

      <Title level={4}>📱 Đăng ký sử dụng dịch vụ</Title>
      <Paragraph>
        Quý khách vui lòng tải và đăng ký tài khoản trên ứng dụng <strong>MetroShip</strong>. Sau khi hoàn tất đăng ký, đội ngũ MetroShip sẽ liên hệ hỗ trợ, tư vấn dịch vụ và kích hoạt tài khoản cho quý khách.
      </Paragraph>

      <Divider />

      <Title level={4}>📩 Hình thức tiếp nhận đơn hàng</Title>
      <Paragraph>
        MetroShip tiếp nhận đơn hàng thông qua các kênh:
        <ul>
          <li>Đăng đơn trực tiếp trên website</li>
          <li>Ứng dụng MetroShip trên điện thoại</li>
          <li>Tại các điểm gửi hàng của MetroShip</li>
        </ul>
        Nếu gặp sự cố khi đăng ký, vui lòng liên hệ hotline: <strong>1900 9999</strong> hoặc tới điểm giao dịch MetroShip gần nhất để được hỗ trợ.
      </Paragraph>

      <Divider />

      <Title level={4}>🚚 Quy định lấy hàng</Title>
      <Paragraph>
        MetroShip không giới hạn số lượng đơn. Dù chỉ có 1 đơn, MetroShip vẫn phục vụ.
        <br />
        Để đảm bảo đơn hàng được vận chuyển chính xác, an toàn, quý khách cần:
        <ul>
          <li>In và dán mã vận đơn lên kiện hàng</li>
          <li>Hoặc ghi rõ mã vận đơn bằng tay</li>
        </ul>
      </Paragraph>

      <Divider />

      <Title level={4}>📦 Quy định giao hàng</Title>
      <Paragraph>
        MetroShip giao hàng bằng tàu điện với thùng hàng chứa nhiều đơn có giá trị. Vì vậy:
        <ul>
          <li>Khuyến khích người nhận chủ động nhận hàng đúng thời hạn</li>
          <li>MetroShip có hỗ trợ giữ hàng lại theo khung giờ hẹn nếu người nhận bận</li>
          <li>Trường hợp người nhận trễ hẹn quá 5 ngày, đơn sẽ chuyển trạng thái "Không giao được" và hoàn về</li>
        </ul>
      </Paragraph>

      <Divider />

      <Title level={4}>💰 Đối soát & chuyển tiền thu hộ</Title>
      <Paragraph>
        MetroShip tiến hành đối soát và chuyển khoản tiền thu hộ các đơn hoàn tất theo lịch do quý khách lựa chọn:
        <ul>
          <li>Đối soát hàng tuần (VD: thứ 6 hàng tuần)</li>
          <li>Hoặc hàng tháng (VD: ngày 30 hàng tháng)</li>
        </ul>
        Công thức đối soát:
        <br />
        <strong>Tiền đối soát = Tiền thu hộ – phí dịch vụ – phí bảo hiểm (nếu có)</strong>
      </Paragraph>

      <Divider />

      <Title level={4}>✔️ Các mặt hàng được chấp nhận gửi</Title>
      <Paragraph>
        Quý khách có thể gửi các hàng hóa hợp pháp sau:
        <ul>
          <li>Thời trang: quần áo, giày dép, phụ kiện</li>
          <li>Đồ điện tử tiêu dùng như điện thoại, laptop, tai nghe (không chứa pin rời)</li>
          <li>Thực phẩm khô đóng gói, sách, văn phòng phẩm, đồ gia dụng</li>
          <li>Hàng có hóa đơn, nguồn gốc rõ ràng, không thuộc danh mục cấm</li>
        </ul>
      </Paragraph>

      <Divider />

      <Title level={4}>❌ Các mặt hàng bị cấm gửi</Title>
      <Paragraph>
        MetroShip không chấp nhận vận chuyển các mặt hàng sau:
        <ul>
          <li>Chất nổ, chất cháy, hóa chất độc hại</li>
          <li>Thực phẩm tươi sống, dễ hỏng</li>
          <li>Tiền mặt, vàng bạc, trang sức, kim loại quý</li>
          <li>Động vật sống, bộ phận cơ thể người</li>
          <li>Hàng giả, hàng không rõ nguồn gốc</li>
        </ul>
      </Paragraph>

      <Divider />

      <Title level={4}>📦 Hàng dễ vỡ & có giá trị cao</Title>
      <Paragraph>
        Khi gửi hàng dễ vỡ hoặc giá trị cao, quý khách cần:
        <ul>
          <li>Khai báo chính xác giá trị đơn</li>
          <li>Dán nhãn "Hàng dễ vỡ", "Hàng giá trị cao" bên ngoài</li>
          <li>Đính kèm hóa đơn hoặc chứng từ hợp lệ</li>
        </ul>
      </Paragraph>
      <Paragraph strong>
        Nhân viên MetroShip có quyền <span style={{ color: 'red' }}>kiểm tra đơn hàng</span> và <span style={{ color: 'red' }}>từ chối nhận</span> nếu:
        <ul>
          <li>Đóng gói không đúng quy định</li>
          <li>Khai báo sai thông tin</li>
        </ul>
        <br />
        Trường hợp này, đơn hàng <span style={{ color: 'red' }}>không được hoàn tiền</span>.
      </Paragraph>
    </div>
  );
}

export default ParcelRules;
