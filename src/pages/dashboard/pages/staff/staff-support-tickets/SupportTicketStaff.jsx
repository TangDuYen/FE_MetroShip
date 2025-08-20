import "./SupportTicketStaff.scss";

import { Button, Col, Input, Modal, Row, Select, Space, Table } from "antd";
import React, { useEffect, useState } from "react";
import { getAllParcels, getAllShipments, getAllSupportTickets } from "./../../../../../config/metroApi";
import { supportTicketStatus, supportTicketType } from "../../../../../constants/statusMap";

import { ReloadOutlined } from "@ant-design/icons";
import api from "../../../../../config/axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const { Search } = Input;
const { Option } = Select;

function SupportTicketStaff({ stationId }) {
  const [tickets, setTickets] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(false);

  //FILTER STATE
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterSupportType, setFilterSupportType] = useState(null);
  const [filterShipmentCode, setFilterShipmentCode] = useState("");

  //MODAL STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [resolvedContent, setResolvedContent] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shipmentData, ticketData, parcelData] = await Promise.all([
        getAllShipments(),
        getAllSupportTickets(),
        getAllParcels(),
      ]);

      setShipments(shipmentData.items || []);
      setTickets(ticketData.items || []);
      setParcels(parcelData || []);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const getShipmentCode = (id) => {
    const shipment = shipments.find((s) => s.id === id);
    return shipment ? shipment.trackingCode : id;
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = filterStatus ? t.status === filterStatus : true;
    const matchesSupportType = filterSupportType ? t.supportType === filterSupportType : true;
    const matchesShipmentCode = filterShipmentCode
      ? getShipmentCode(t.shipmentId).toLowerCase().includes(filterShipmentCode.toLowerCase())
      : true;
    return matchesStatus && matchesSupportType && matchesShipmentCode;
  });

  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket);
    setActionType(null);
    setResolvedContent("");
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    if (!selectedTicket) return;

    try {
      if (actionType === "resolve") {
        if (!resolvedContent.trim()) {
          toast.error("Vui lòng nhập nội dung xử lý!");
          return;
        }

        const res = await api.post("/support-tickets/resolve", {
          ticketId: selectedTicket.id,
          resolvedContent,
        });

        if (res.status === 200) {
          toast.success("Giải quyết phiếu thành công!");
          fetchData();
        }
      } else if (actionType === "reject") {
        const res = await api.post(`/support-tickets/close/${selectedTicket.id}`);
        if (res.status === 200) {
          toast.success("Từ chối phiếu thành công!");
          fetchData();
        }
      }

      setIsModalOpen(false);
      setSelectedTicket(null);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật trạng thái phiếu!");
    }
  };

  const handleResetFilters = () => {
    setFilterStatus(null);
    setFilterSupportType(null);
    setFilterShipmentCode("");
    fetchData();
  };


  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "shipmentId",
      key: "shipmentId",
      render: (shipmentId) => getShipmentCode(shipmentId),
    },
    {
      title: "Loại phiếu",
      dataIndex: "supportType",
      key: "supportType",
      render: (status) => supportTicketType[status],
    },
    {
      title: "Tiêu đề",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => supportTicketStatus[status],
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            disabled={record.status === 2 || record.status === 3}
            onClick={() => handleOpenModal(record)}
          >
            Giải quyết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="support-tickets-staff-container">
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={7}>
          <Search
            placeholder="Tìm theo mã đơn hàng"
            allowClear
            value={filterShipmentCode}
            onChange={(e) => setFilterShipmentCode(e.target.value)}
          />
        </Col>
        <Col xs={24} md={7}>
          <Select
            placeholder="Chọn trạng thái"
            allowClear
            style={{ width: "100%" }}
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
          >
            {Object.entries(supportTicketStatus).map(([key, label]) => (
              <Option key={key} value={parseInt(key, 10)}>
                {label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={7}>
          <Select
            placeholder="Chọn loại phiếu"
            allowClear
            style={{ width: "100%" }}
            value={filterSupportType}
            onChange={(val) => setFilterSupportType(val)}
          >
            {Object.entries(supportTicketType).map(([key, label]) => (
              <Option key={key} value={parseInt(key, 10)}>
                {label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col flex="none">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleResetFilters}
          >
          </Button>
        </Col>
      </Row>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredTickets}
        loading={loading}
        bordered
        locale={{ emptyText: "Không có dữ liệu" }}
      />

      {/* HANDLE SUPPORT TICKET */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleModalOk}
        okText="Xác nhận"
        cancelText="Hủy"
        title="Xử lý phiếu hỗ trợ"
      >
        <Select
          placeholder="Chọn hành động"
          style={{ width: "100%", marginBottom: 16 }}
          value={actionType}
          onChange={(val) => setActionType(val)}
        >
          <Option value="resolve">Giải quyết</Option>
          <Option value="reject">Từ chối</Option>
        </Select>

        {actionType === "resolve" && (
          <Input.TextArea
            rows={4}
            placeholder="Nhập nội dung xử lý..."
            value={resolvedContent}
            onChange={(e) => setResolvedContent(e.target.value)}
          />
        )}
      </Modal>
    </div>
  );
}

export default SupportTicketStaff;
