import 'leaflet/dist/leaflet.css';

import { Checkbox, Form, Input, InputNumber, Select } from 'antd';
import { Col, DatePicker, Row, Typography } from 'antd';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

import Title from 'antd/es/skeleton/Title';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

function ParcelInfo({ parcelInfo, setParcelInfo, metroSelector, setMetroSelector }) {
  const handleChange = (field, value) => {
    setParcelInfo({ ...parcelInfo, [field]: value });
  };
  const metroStations = [
    { id: 1, name: 'Bến Thành', coordinates: [10.772, 106.698] },
    { id: 2, name: 'Suối Tiên', coordinates: [10.870, 106.803] },
    { id: 3, name: 'Thủ Đức', coordinates: [10.849, 106.753] },
    { id: 4, name: 'An Phú', coordinates: [10.790, 106.740] },
    // Add more stations as needed
  ];
  const timeSlot = [
    { id: 1, time: '8:00 AM' },
    { id: 2, time: '1:00 PM' },
    { id: 3, time: '6:00 PM' },
    { id: 4, time: '9:00 PM' },
  ]

  const handleDepartureChange = (value) => {
    setMetroSelector((prev) => ({ ...prev, departureStationId: value }));
  };

  const handleDestinationChange = (value) => {
    setMetroSelector((prev) => ({ ...prev, destinationStationId: value }));
  };

  const handleDateChange = (value) => {
    setMetroSelector((prev) => ({ ...prev, departureDateTime: value }));
  };
  return (
    <>
      <Title level={4}>Điền thông tin kiện hàng</Title>
      <Form layout="vertical" style={{ padding: '1rem' }}>
        <Title level={4}>Chọn trạm Metro</Title>
        <Form.Item label="Loại hàng hóa">
          <Select
            placeholder="Chọn loại hàng"
            value={parcelInfo.parcelCategory}
            onChange={(value) => handleChange('parcelCategory', value)}
          >
            <Option value="documents">Tài liệu</Option>
            <Option value="electronics">Hàng điện tử</Option>
            <Option value="clothing">Quần áo</Option>
            <Option value="food">Đồ ăn</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Trọng lượng (kg)">
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            value={parcelInfo.weightKg}
            onChange={(value) => handleChange('weightKg', value)}
          />
        </Form.Item>

        <Form.Item label="Kích thước (cm)">
          <Input.Group compact>
            <InputNumber
              min={0}
              placeholder="Dài"
              style={{ width: '33%' }}
              value={parcelInfo.lengthCm}
              onChange={(value) => handleChange('lengthCm', value)}
            />
            <InputNumber
              min={0}
              placeholder="Rộng"
              style={{ width: '33%' }}
              value={parcelInfo.widthCm}
              onChange={(value) => handleChange('widthCm', value)}
            />
            <InputNumber
              min={0}
              placeholder="Cao"
              style={{ width: '33%' }}
              value={parcelInfo.heightCm}
              onChange={(value) => handleChange('heightCm', value)}
            />

          </Input.Group>
        </Form.Item>

        <Form.Item label="Mô tả">
          <TextArea
            rows={4}
            value={parcelInfo.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </Form.Item>

        <Form.Item>
          <Checkbox
            checked={parcelInfo.isBulk}
            onChange={(e) => handleChange('isBulk', e.target.checked)}
          >
            Gửi nhiều hàng
          </Checkbox>
        </Form.Item>
      </Form>
      <div className="metro-selector">
            <Title level={4}>Chọn trạm Metro</Title>
            <div className="selector-group">
              <label>Trạm gửi:</label>
              <Select
                style={{ width: '100%', marginBottom: "1em", marginTop: "0.5em" }}
                placeholder="Chọn trạm để gửi hàng"
                value={metroSelector.departureStationId}
                onChange={handleDepartureChange}
              >
                {metroStations.map((station) => (
                  <Option key={station.id} value={station.id}>
                    {station.name}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="selector-group">
              <label>Trạm nhận:</label>
              <Select
                style={{ width: '100%', marginBottom: "1em", marginTop: "0.5em" }}
                placeholder="Chọn trạm để nhận hàng"
                value={metroSelector.destinationStationId}
                onChange={handleDestinationChange}
              >
                {metroStations.map((station) => (
                  <Option key={station.id} value={station.id}>
                    {station.name}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="selector-group">
              <label>Ngày gửi:</label>
              <DatePicker
                style={{ width: '100%', marginTop: "0.5em", marginBottom: "1em" }}
                placeholder="Chọn ngày gửi"
                value={metroSelector.departureDateTime ? dayjs(metroSelector.departureDateTime) : null}
                onChange={handleDateChange}
                format="YYYY-MM-DD HH:mm"
              />
            </div>
            <div className="selector-group">
              <label>Thời gian gửi:</label>
              <Select
                style={{ width: '100%', marginBottom: "1em", marginTop: "0.5em" }}
                placeholder="Chọn giờ gửi"
                value={metroSelector.destinationStationId}
                onChange={handleDestinationChange}
              >
                {timeSlot.map((time) => (
                  <Option key={time.id} value={time.id}>
                    {time.time}
                  </Option>
                ))}
              </Select>
              <p style={{ fontWeight: "bold", color: "red" }}>Lưu ý: Khách hàng cần phải mang hàng đến trạm gửi trước giờ gửi trễ nhất 30 phút trước khi tàu chạy</p>
            </div>

          {/* Right Column: Map
          <Col span={12}>
            <Title level={4}>Bản đồ</Title>
            <MapContainer
              center={[10.776, 106.700]} // Centered on Ho Chi Minh City
              zoom={12}
              style={{ height: '400px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {metroStations.map((station) => (
                <Marker key={station.id} position={station.coordinates}>
                  <Popup>{station.name}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </Col> */}
      </div>
    </>

  );
}

export default ParcelInfo;
