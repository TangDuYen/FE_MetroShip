import "./SupportTicketStaff.scss";

import { Button, Col, Input, Row, Select, Table, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { getAllSupportTickets, getShipmentByStaffStation } from './../../../../../config/metroApi';

import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;

function SupportTicketStaff({ stationId }) {
  const [tickets, setTickets] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterTicketId, setFilterTicketId] = useState("");
  const [filterShipmentCode, setFilterShipmentCode] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shipmentData, ticketData] = await Promise.all([
        getShipmentByStaffStation(stationId),
        getAllSupportTickets(),
      ]);

      setShipments(shipmentData || []);
      setTickets(ticketData.items || []);
      setStatusList(ticketData.additionalData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getShipmentCode = (id) => {
    const shipment = shipments.find((s) => s.id === id);
    return shipment ? shipment.code : id;
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = filterStatus ? t.status === filterStatus : true;
    const matchesTicketId = filterTicketId
      ? t.id.toLowerCase().includes(filterTicketId.toLowerCase())
      : true;
    const matchesShipmentCode = filterShipmentCode
      ? getShipmentCode(t.shipmentId).toLowerCase().includes(filterShipmentCode.toLowerCase())
      : true;
    return matchesStatus && matchesTicketId && matchesShipmentCode;
  });

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
      width: 280,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "shipmentId",
      key: "shipmentId",
      width: 200,
      render: (shipmentId) => getShipmentCode(shipmentId),
    },
    {
      title: "Tiêu đề",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === 1) color = "orange";
        if (status === 2) color = "green";
        if (status === 3) color = "red";

        const statusName = statusList.find((s) => s.id === status)?.value || status;
        return <Tag color={color}>{statusName}</Tag>;
      },
    },
    {
      title: "Ngày mở",
      dataIndex: "openedAt",
      key: "openedAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <div className="support-tickets-staff-container">
      {/* Bộ lọc */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Search
            placeholder="Tìm theo mã phiếu"
            allowClear
            value={filterTicketId}
            onChange={(e) => setFilterTicketId(e.target.value)}
          />
        </Col>
        <Col xs={24} md={8}>
          <Search
            placeholder="Tìm theo mã đơn hàng"
            allowClear
            value={filterShipmentCode}
            onChange={(e) => setFilterShipmentCode(e.target.value)}
          />
        </Col>
        <Col xs={24} md={8}>
          <Select
            placeholder="Chọn trạng thái"
            allowClear
            style={{ width: "100%" }}
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
          >
            {statusList.map((s) => (
              <Option key={s.id} value={s.id}>
                {s.value}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Button type="primary" onClick={fetchData} style={{ marginBottom: 16 }}>
        Làm mới
      </Button>

      {/* Bảng */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredTickets}
        loading={loading}
        bordered
      />
    </div>
  );
}

export default SupportTicketStaff;
