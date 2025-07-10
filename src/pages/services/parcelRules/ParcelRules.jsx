import './ParcelRule.scss';

import { Divider, Typography } from 'antd';

const { Title, Paragraph } = Typography;

function ParcelRules() {
  return (
    <div className="parcel-rules-container" style={{ padding: '20px', alignItems: 'center' }}>
      <Title level={1} className="main-title">Chính Sách Gửi Hàng</Title>

      <Divider />

      <Title level={4}>✔️ Các mặt hàng được chấp nhận gửi</Title>
      <Paragraph>
        Khách hàng được phép gửi các loại hàng hóa hợp pháp như:
        <ul>
          <li>Quần áo, giày dép, phụ kiện cá nhân</li>
          <li>Đồ điện tử thông dụng như điện thoại, tai nghe, laptop (không chứa pin rời lỏng)</li>
          <li>Đồ gia dụng, sách vở, thực phẩm khô đóng gói hợp quy</li>
          <li>Hàng hóa có giấy tờ chứng minh nguồn gốc và không nằm trong danh mục cấm</li>
        </ul>
      </Paragraph>

      <Divider />

      <Title level={4}>❌ Các mặt hàng bị cấm gửi</Title>
      <Paragraph>
        Các mặt hàng sau tuyệt đối không được phép gửi:
        <ul>
          <li>Chất cháy nổ, vũ khí, chất cấm</li>
          <li>Thực phẩm tươi sống, dễ hư hỏng</li>
          <li>Tiền mặt, vàng bạc, kim loại quý hiếm</li>
          <li>Động vật sống, bộ phận cơ thể người</li>
          <li>Hàng giả, hàng không rõ nguồn gốc xuất xứ</li>
        </ul>
      </Paragraph>

      <Divider />

      <Title level={4}>📦 Quy định với hàng giá trị cao & dễ vỡ</Title>
      <Paragraph>
        Khi gửi các mặt hàng dễ vỡ hoặc có giá trị cao, khách hàng cần tuân thủ các yêu cầu sau:
        <ul>
          <li>Khai báo chính xác giá trị thực của mặt hàng</li>
          <li>Dán tem "Hàng dễ vỡ" hoặc "Hàng giá trị cao" rõ ràng trên bưu kiện</li>
          <li>Cung cấp hóa đơn mua hàng để xác minh thông tin</li>
        </ul>
      </Paragraph>
      <Paragraph strong>
        Nhân viên có quyền <span style={{color: 'red'}}>kiểm tra đơn hàng</span> và <span style={{color: 'red'}}>từ chối nhận</span>:
        <ul>
          <li>Đóng gói không đúng yêu cầu</li>
          <li>Thông tin khai báo không đúng với thực tế</li>
        </ul>
        <br />
        Trong trường hợp này, đơn sẽ <span style={{color: 'red'}}>không được hoàn tiền</span>.
      </Paragraph>
    </div>
  );
}

export default ParcelRules;
