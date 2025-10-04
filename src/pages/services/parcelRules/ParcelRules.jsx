import './ParcelRule.scss';

import { Anchor, Col, Divider, Row, Typography } from 'antd';

const { Title, Paragraph } = Typography;
const { Link } = Anchor;

function ParcelRules() {
  return (
    <div className="parcel-rules-layout">
      <Row gutter={24}>
        {/* LEFT CONTENT AREA */}
        <Col xs={24} md={16}>
          <div className="parcel-rules-content" style={{ padding: '10px' }}>
            <div id="section1">
              <Title level={4}>1. Đăng ký sử dụng dịch vụ</Title>
              <Paragraph>
                Khách hàng cần tạo tài khoản trên ứng dụng <strong>MetroShip</strong> trước khi sử dụng dịch vụ. Tên đăng nhập, email và số điện thoại phải là duy nhất. Hệ thống sẽ xác thực email trước khi tài khoản được kích hoạt.
              </Paragraph>
            </div>

            <Divider />

            <div id="section2">
              <Title level={4}>2. Hình thức tiếp nhận đơn hàng</Title>
              <Paragraph>
                MetroShip tiếp nhận đơn hàng thông qua:
                <ul>
                  <li>Website chính thức</li>
                </ul>
                Khách hàng cần hoàn tất việc tạo đơn trước thời gian hẹn. Liên hệ hỗ trợ: <strong>1900 9999</strong>.
              </Paragraph>
            </div>

            <Divider />

            <div id="section3">
              <Title level={4}>3. Quy định gửi và lấy hàng</Title>
              <Paragraph>
                Trong giai đoạn đầu, khách hàng cần mang kiện hàng đến điểm gửi và người nhận đến điểm nhận.
                <br />
                Các khung giờ vận chuyển:
                <ul>
                  <li>Sáng: 08:00 – 11:00</li>
                  <li>Chiều: 13:00 – 16:00</li>
                  <li>Tối: 18:00 – 21:00</li>
                  <li>Đêm: 23:00 – 02:00</li>
                </ul>
                Vui lòng mang hàng đến trước ít nhất 30 phút.
              </Paragraph>
            </div>

            <Divider />

            <div id="section4">
              <Title level={4}>4. Trách nhiệm khi giao nhận</Title>
              <Paragraph>
                Người nhận cần đến lấy hàng trong vòng 1 ngày. Quá thời gian miễn phí sẽ bị tính phí lưu kho. Sau 5 ngày, hàng sẽ được hoàn về.
              </Paragraph>
            </div>

            <Divider />

            <div id="section5">
              <Title level={4}>5. Các mặt hàng được chấp nhận</Title>
              <Paragraph>
                MetroShip chấp nhận các hàng hóa hợp pháp:
                <ul>
                  <li>Thời trang, phụ kiện</li>
                  <li>Thiết bị điện tử không pin rời</li>
                  <li>Thực phẩm khô, đồ gia dụng</li>
                  <li>Có nguồn gốc, chứng từ rõ ràng</li>
                </ul>
              </Paragraph>
            </div>

            <Divider />

            <div id="section6">
              <Title level={4}>6. Các mặt hàng bị cấm gửi</Title>
              <Paragraph>
                Không chấp nhận vận chuyển:
                <ul>
                  <li>Chất nổ, hóa chất độc hại</li>
                  <li>Thực phẩm tươi sống</li>
                  <li>Tiền, vàng, trang sức</li>
                  <li>Động vật sống, bộ phận cơ thể</li>
                  <li>Hàng giả, không rõ nguồn gốc</li>
                </ul>
              </Paragraph>
            </div>

            <Divider />

            <div id="section7">
              <Title level={4}>7. Hàng dễ vỡ hoặc có giá trị cao</Title>
              <Paragraph>
                Khách hàng cần:
                <ul>
                  <li>Khai báo đúng giá trị hàng</li>
                  <li>Dán nhãn phù hợp</li>
                  <li>Đính kèm hóa đơn/chứng từ</li>
                </ul>
                MetroShip có quyền kiểm tra và từ chối nếu vi phạm quy định.
              </Paragraph>
            </div>

            <Divider />

            <div id="section8">
              <Title level={4}>8. Bảo hiểm hàng hóa</Title>
              <Paragraph>
                Hàng dễ vỡ hoặc có giá trị cao phải mua bảo hiểm. Phí được tính theo giá trị khai báo và hiển thị trên hóa đơn.
              </Paragraph>
            </div>

            <Divider />

            <div id="section9">
              <Title level={4}>9. Hoàn, hủy và bồi thường</Title>
              <Paragraph>
                <ul>
                  <li>Hoàn 80% nếu hủy trước 24h</li>
                  <li>Không đến gửi đúng lịch: không hoàn phí</li>
                  <li>Chỉ xử lý bồi thường với đơn ở trạng thái “Chờ bồi thường”</li>
                  <li>Vi phạm quy định: không được bồi thường</li>
                </ul>
              </Paragraph>
            </div>
          </div>
        </Col>

        {/* RIGHT MENU */}
        <Col xs={24} md={8}>
          <div className="parcel-rules-menu" style={{ padding: '20px' }}>
            <Anchor
              affix={false}
              offsetTop={80}
            >
              <Link href="#section1" title="1. Đăng ký sử dụng" />
              <Link href="#section2" title="2. Tiếp nhận đơn hàng" />
              <Link href="#section3" title="3. Gửi và lấy hàng" />
              <Link href="#section4" title="4. Trách nhiệm giao nhận" />
              <Link href="#section5" title="5. Hàng hợp lệ" />
              <Link href="#section6" title="6. Hàng cấm gửi" />
              <Link href="#section7" title="7. Hàng dễ vỡ / giá trị cao" />
              <Link href="#section8" title="8. Bảo hiểm hàng hóa" />
              <Link href="#section9" title="9. Chính sách bồi thường" />
            </Anchor>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default ParcelRules;
