import './RouteStaff.scss';

import { Button, Col, DatePicker, Input, Row, Select, Table, Typography } from 'antd';
import React, { useState } from 'react';

import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

function RouteStaff() {
  const [searchText, setSearchText] = useState('');
  const [dateFilter, setDateFilter] = useState(null);

  const [fromRoute, setFromRoute] = useState(null);
  const [fromStation, setFromStation] = useState(null);
  const [fromPath, setFromPath] = useState(null);

  const [toRoute, setToRoute] = useState(null);
  const [toStation, setToStation] = useState(null);
  const [toPath, setToPath] = useState(null);

  // Fake data cho dropdowns
  const routeOptions = ['Tuyến 1', 'Tuyến 2', 'Tuyến 3'];
  const stationOptions = ['Trạm A', 'Trạm B', 'Trạm C'];
  const pathOptions = ['Lộ trình Sáng', 'Lộ trình Chiều', 'Lộ trình Tối'];

  // Fake data đơn hàng
  const shipments = [
    {
      id: 'DH001',
      sender: 'Nguyễn Văn A',
      receiver: 'Lê Thị B',
      station: 'Trạm A',
      route: 'Tuyến 1',
      date: '2025-06-15',
    },
    {
      id: 'DH002',
      sender: 'Trần Thị C',
      receiver: 'Phạm Văn D',
      station: 'Trạm A',
      route: 'Tuyến 1',
      date: '2025-06-15',
    },
  ];

  // Lọc đơn theo các tiêu chí
  const filteredShipments = shipments.filter((item) => {
    return (
      (!searchText || item.id.toLowerCase().includes(searchText.toLowerCase())) &&
      (!dateFilter || moment(item.date).isSame(dateFilter, 'day')) &&
      (!fromRoute || item.route === fromRoute) &&
      (!fromStation || item.station === fromStation)
    );
  });

  const handleTransfer = () => {
    console.log('Chuyển đơn từ:', fromStation, '→', toStation);
    console.log('Đơn được chuyển:', filteredShipments);
  };

  return (
    <div className="staff-route-container">
      <Title level={3}>Điều chuyển lộ trình</Title>

      <Row gutter={16} style={{ marginBottom: '1em' }}>
        <Col span={8}>
          <Input
            placeholder="Tìm mã đơn hàng"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
        <Col span={8}>
          <DatePicker
            value={dateFilter ? moment(dateFilter) : null}
            onChange={(date) => setDateFilter(date)}
            placeholder="Chọn ngày"
            style={{ width: '100%' }}
          />
        </Col>
      </Row>

    
      <Row gutter={16} style={{ marginBottom: '2em' }}>
        <Col span={12}>
          <Title level={5}>Từ</Title>
          <Select
            placeholder="Chọn tuyến"
            value={fromRoute}
            onChange={setFromRoute}
            style={{ width: '100%', marginBottom: '0.5em' }}
          >
            {routeOptions.map((r) => <Option key={r}>{r}</Option>)}
          </Select>
          <Select
            placeholder="Chọn trạm"
            value={fromStation}
            onChange={setFromStation}
            style={{ width: '100%', marginBottom: '0.5em' }}
          >
            {stationOptions.map((s) => <Option key={s}>{s}</Option>)}
          </Select>
          <Select
            placeholder="Chọn lộ trình"
            value={fromPath}
            onChange={setFromPath}
            style={{ width: '100%' }}
          >
            {pathOptions.map((p) => <Option key={p}>{p}</Option>)}
          </Select>
        </Col>

        <Col span={12}>
          <Title level={5}>Đến</Title>
          <Select
            placeholder="Chọn tuyến"
            value={toRoute}
            onChange={setToRoute}
            style={{ width: '100%', marginBottom: '0.5em' }}
          >
            {routeOptions.map((r) => <Option key={r}>{r}</Option>)}
          </Select>
          <Select
            placeholder="Chọn trạm"
            value={toStation}
            onChange={setToStation}
            style={{ width: '100%', marginBottom: '0.5em' }}
          >
            {stationOptions.map((s) => <Option key={s}>{s}</Option>)}
          </Select>
          <Select
            placeholder="Chọn lộ trình"
            value={toPath}
            onChange={setToPath}
            style={{ width: '100%' }}
          >
            {pathOptions.map((p) => <Option key={p}>{p}</Option>)}
          </Select>
        </Col>
      </Row>

      {/* Nút chuyển */}
      <Button
        type="primary"
        onClick={handleTransfer}
        disabled={filteredShipments.length === 0 || !toStation}
        style={{ marginBottom: '1em' }}
      >
        Chuyển trạm ({filteredShipments.length} đơn)
      </Button>

      {/* Table danh sách đơn */}
      <Table
        dataSource={filteredShipments}
        rowKey="id"
        columns={[
          { title: 'Mã đơn', dataIndex: 'id' },
          { title: 'Người gửi', dataIndex: 'sender' },
          { title: 'Người nhận', dataIndex: 'receiver' },
          { title: 'Tuyến', dataIndex: 'route' },
          { title: 'Trạm', dataIndex: 'station' },
          { title: 'Ngày', dataIndex: 'date' },
        ]}
      />
    </div>
  );
}

export default RouteStaff;
