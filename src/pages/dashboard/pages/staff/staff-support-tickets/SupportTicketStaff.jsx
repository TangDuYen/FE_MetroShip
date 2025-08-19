import "./SupportTicketStaff.scss";

import { Button, Col, Input, Modal, Row, Select, Space, Table, message } from "antd";
import React, { useEffect, useState } from "react";
import { getAllParcels, getAllShipments, getAllSupportTickets } from "./../../../../../config/metroApi";

import api from "../../../../../config/axios";
import axios from "axios";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;

function SupportTicketStaff({ stationId }) {
  const [tickets, setTickets] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterTicketId, setFilterTicketId] = useState("");
  const [filterShipmentCode, setFilterShipmentCode] = useState("");

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [lostParcels, setLostParcels] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const openEditModal = (record) => {
    const lostItems = parcels.filter((p) => p.shipmentId === record.shipmentId && p.status === 4);
    setLostParcels(lostItems);

    const order = shipments.find(s => s.id === record.shipmentId);
    setSelectedOrder(order); // lưu thông tin đầy đủ

    setSelectedShipment(record.shipmentId);
    setIsModalVisible(true);
  };


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
      setStatusList(ticketData.additionalData || []);
      setParcels(parcelData || []);
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải dữ liệu");
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
    const matchesTicketId = filterTicketId
      ? t.id.toLowerCase().includes(filterTicketId.toLowerCase())
      : true;
    const matchesShipmentCode = filterShipmentCode
      ? getShipmentCode(t.shipmentId).toLowerCase().includes(filterShipmentCode.toLowerCase())
      : true;
    return matchesStatus && matchesTicketId && matchesShipmentCode;
  });

  const handleConfirmCompensation = async () => {
    try {
      const res = await api.post("/shipments/vnpay/payment-url", {
        shipmentId: selectedShipment,
        transactionType: 3,
        returnUrl: window.location.origin + "/dashboard/staff/support-tickets",
        cancelUrl: window.location.origin + "/dashboard/staff/support-tickets",
      });

      if (res.data?.paymentUrl) {
        window.open(res.data.paymentUrl, "_blank");
        setIsModalVisible(false);
      } else {
        message.error("Không tạo được link thanh toán");
      }
    } catch (err) {
      message.error("Lỗi khi tạo link thanh toán");
    }
  };

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
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button
            className="edit-train-button"
            onClick={() => openEditModal(record)}
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

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredTickets}
        loading={loading}
        bordered
      />

      {/* Modal bồi thường */}
      <Modal
        title={`Yêu cầu bồi thường cho đơn hàng: ${selectedOrder?.trackingCode || ''}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="confirm" type="primary" onClick={handleConfirmCompensation}>
            Xác nhận bồi thường
          </Button>
        ]}
        width={700}
      >
        {selectedOrder && selectedOrder.relatedParcels && (
          <Tabs defaultActiveKey="0">
            {selectedOrder.relatedParcels
              .filter(parcel => parcel.status === 4) 
              .map((parcel, index) => (
                <TabPane tab={`Kiện hàng ${index + 1}`} key={index}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Table
                      dataSource={[
                        {
                          key: 'parcelCode',
                          label: 'Mã kiện hàng',
                          value: parcel.parcelCode || 'N/A',
                        },
                        {
                          key: 'parcelCategory',
                          label: 'Loại hàng',
                          value: parcel.parcelCategory?.categoryName || 'N/A',
                        },
                        {
                          key: 'chargeableWeightKg',
                          label: 'Trọng lượng quy đổi',
                          value: `${parcel.chargeableWeightKg || 'N/A'} kg`,
                        },
                        {
                          key: 'volumeCm3',
                          label: 'Thể tích',
                          value: `${parcel.volumeCm3 || 'N/A'} cm³`,
                        },
                        {
                          key: 'departureStationName',
                          label: 'Trạm gửi',
                          value: selectedOrder.departureStationName || 'N/A',
                        },
                        {
                          key: 'destinationStationName',
                          label: 'Trạm nhận',
                          value: selectedOrder.destinationStationName || 'N/A',
                        },
                        {
                          key: 'departureDate',
                          label: 'Ngày gửi',
                          value: dayjs(selectedOrder.scheduledDateTime).format('YYYY-MM-DD') || 'N/A',
                        },
                        {
                          key: 'departureTime',
                          label: 'Hạn chót gửi hàng',
                          value: dayjs(selectedOrder.scheduledDateTime).format('HH:mm') || 'N/A',
                        },
                        {
                          key: 'createdAt',
                          label: 'Thời điểm tạo yêu cầu',
                          value: dayjs(selectedOrder.bookedAt).format('YYYY-MM-DD HH:mm:ss') || 'N/A',
                        },
                        {
                          key: 'totalCost',
                          label: 'Tổng chi phí',
                          value: formatCurrency(selectedOrder.totalCostVnd || 0),
                        },
                        {
                          key: 'parcelStatus',
                          label: 'Trạng thái kiện hàng',
                          value: shipmentStatusMap[selectedOrder.shipmentStatus] || "Không xác nhận"
                        },
                      ]}
                      columns={[
                        {
                          title: 'Thông tin',
                          dataIndex: 'label',
                          key: 'label',
                        },
                        {
                          title: 'Chi tiết',
                          dataIndex: 'value',
                          key: 'value',
                        },
                      ]}
                      pagination={false}
                      bordered
                      showHeader={false}
                      rowClassName="order-detail-row"
                    />
                  </Space>
                </TabPane>
              ))}
          </Tabs>
        )}
      </Modal>

    </div>
  );
}

export default SupportTicketStaff;
