import 'leaflet/dist/leaflet.css';

import { Col, Row, Select, Typography } from 'antd';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

import React from 'react';

const { Option } = Select;
const { Title } = Typography;

const MetroSelector = ({ metroSelector, setMetroSelector }) => {
  // Sample list of metro stations with coordinates
  const metroStations = [
    { id: 1, name: 'Bến Thành', coordinates: [10.772, 106.698] },
    { id: 2, name: 'Suối Tiên', coordinates: [10.870, 106.803] },
    { id: 3, name: 'Thủ Đức', coordinates: [10.849, 106.753] },
    { id: 4, name: 'An Phú', coordinates: [10.790, 106.740] },
    // Add more stations as needed
  ];

  const handleDepartureChange = (value) => {
    setMetroSelector((prev) => ({ ...prev, departureStationId: value }));
  };

  const handleDestinationChange = (value) => {
    setMetroSelector((prev) => ({ ...prev, destinationStationId: value }));
  };

  return (
    <div className="metro-selector">
      <Row gutter={16}>
        {/* Left Column: Dropdowns */}
        <Col span={12}>
          <Title level={4}>Select Metro Stations</Title>
          <div className="selector-group">
            <label>Departure Station:</label>
            <Select
              style={{ width: '100%' }}
              placeholder="Select departure station"
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
            <label>Destination Station:</label>
            <Select
              style={{ width: '100%' }}
              placeholder="Select destination station"
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
        </Col>

        {/* Right Column: Map */}
        <Col span={12}>
          <Title level={4}>Metro Map</Title>
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
