import 'leaflet/dist/leaflet.css';

import { Col, DatePicker, Row, Select, Typography } from 'antd';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

import React from 'react';

const { Option } = Select;
const { Title } = Typography;

function MetroSelector ({ metroSelector, setMetroSelector }) {
  // Sample list of metro stations with coordinates
  const metroStations = [
    { id: 1, name: 'Bến Thành', coordinates: [10.772, 106.698] },
    { id: 2, name: 'Suối Tiên', coordinates: [10.870, 106.803] },
    { id: 3, name: 'Thủ Đức', coordinates: [10.849, 106.753] },
    { id: 4, name: 'An Phú', coordinates: [10.790, 106.740] },
    // Add more stations as needed
  ];
  const timeSlot = [
    {id:1, time: '8:00 AM'},
    {id:2, time: '1:00 PM'},
    {id:3, time: '6:00 PM'},
    {id:4, time: '9:00 PM'},
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
    <div className="metro-selector">
      <Row gutter={16}>
        {/* Left Column: Dropdowns */}
        <Col span={12}>
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
              style={{ width: '100%' , marginBottom: "1em" , marginTop: "0.5em"}}
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
              style={{ width: '100%' , marginTop: "0.5em", marginBottom: "1em" }}
              placeholder="Chọn ngày gửi"
              value={metroSelector.departureDateTime ? dayjs(metroSelector.departureDateTime) : null}
              onChange={handleDateChange}
              format="YYYY-MM-DD HH:mm"
            />
          </div>
          <div className="selector-group">
            <label>Thời gian gửi:</label>
            <Select
              style={{ width: '100%' , marginBottom: "1em" , marginTop: "0.5em"}}
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
            <p style={{fontWeight: "bold", color: "red"}}>Lưu ý: Khách hàng cần phải mang hàng đến trạm gửi trước giờ gửi trễ nhất 30 phút trước khi tàu chạy</p>
          </div>
        </Col>

        {/* Right Column: Map */}
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
        </Col>
      </Row>
    </div>
  );
};

export default MetroSelector;
