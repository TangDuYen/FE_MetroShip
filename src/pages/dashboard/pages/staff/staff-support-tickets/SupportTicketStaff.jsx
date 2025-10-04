import "./SupportTicketStaff.scss";

import { Button, Col, Input, Modal, Row, Select, Space, Table, Tabs, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { formatCurrency, parcelStatusMap, supportTicketStatus, supportTicketStatusColorMap, supportTicketType } from "../../../../../constants/statusMap";
import { getAllParcels, getAllShipments, getAllSupportTickets, getBanks, getShipmentByTrackingCode } from "./../../../../../config/metroApi";

import { Link } from "react-router-dom";
import { PATH_NAME } from "../../../../../constants/pathname";
import { ReloadOutlined } from "@ant-design/icons";
import TabPane from "antd/es/tabs/TabPane";
import Title from "antd/es/skeleton/Title";
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
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [compensated, setCompensated] = useState(false);
  const [compensationModalVisible, setCompensationModalVisible] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    bankCode: null,
    accountNumber: '',
    accountName: ''
  });

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
    getBanks().then(data => setBankList(data || []));
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

  const getShipmentById = async (trackingCode) => {
    try {
      const res = await getShipmentByTrackingCode(trackingCode);
      const shipmentData = res.data;
    } catch (error) {

    }
  }

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

  const handleOpenCompensation = async (record) => {
    try {
      const shipmentRes = await getShipmentByTrackingCode(getShipmentCode(record.shipmentId));
      const shipmentData = shipmentRes.data;

      if (!shipmentData?.senderId) {
        toast.error("Không tìm thấy thông tin người gửi trong đơn hàng!");
        return;
      }

      const userRes = await api.get(`/users/${shipmentData.senderId}`);
      const senderData = userRes.data?.data || userRes.data;

      const { bankId, accountNo, accountName } = senderData;

      if (!bankId || !accountNo || !accountName) {
        toast.error("Người gửi chưa cập nhật thông tin ngân hàng!");
        return;
      }

      const matchedBank = bankList.find((b) => b.id === bankId || b.code === bankId);
      const bankShortName = matchedBank ? matchedBank.shortName : `Ngân hàng #${bankId}`;

      setSelectedShipment(shipmentData);
      setBankInfo({
        bankCode: bankShortName,
        accountNumber: accountNo,
        accountName: accountName,
      });

      setCompensationModalVisible(true);
    } catch (e) {
      console.error(e);
      toast.error("Không thể lấy thông tin người gửi hoặc đơn hàng!");
    }
  };


  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Phiếu hỗ trợ cho đơn hàng",
      dataIndex: "shipmentId",
      key: "shipmentId",
      render: (_, record) => getShipmentCode(record.shipmentId),
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
      render: (status) => <Tag color={supportTicketStatusColorMap[status]}>
        {supportTicketStatus[status]}
      </Tag>
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          {record.supportType === 1 && record.status === 1 && (() => {
            const shipment = shipments.find(s => s.id === record.shipmentId);
            const isCompensated = shipment && [25, 27].includes(shipment.shipmentStatus);

            return isCompensated && (
              <Button
                style={{ color: 'white', backgroundColor: "red" }}
                onClick={async () => {
                  handleOpenCompensation(record)}}
              >
                Bồi thường
              </Button>
            );
          })()}

          <Button
            type="primary"
            onClick={() => handleOpenModal(record)}
            disabled={record.status === 2 || record.status === 3}
          >
            Giải quyết
          </Button>
        </Space>
      )
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
                <Tag color={supportTicketStatusColorMap[key]}>
                  {supportTicketStatus[key]}
                </Tag>
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

      {/* MODAL COMPENSATION SHIPMENT */}
      <Modal
        open={compensationModalVisible}
        title={`Bồi thường cho đơn hàng: ${selectedShipment?.trackingCode || ''}`}
        onOk={() => {
          setCompensationModalVisible(false);
          setBankModalVisible(true);
        }}
        onCancel={() => setCompensationModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        {selectedShipment && (
          <>
            <Title level={5}>Danh sách kiện hàng cần bồi thường</Title>
            {selectedShipment?.parcels?.filter(p => p.status === 4).length > 0 ? (
              <Tabs defaultActiveKey="0">
                {selectedShipment.parcels
                  .filter(parcel => parcel.status === 4)
                  .map((parcel, index) => (
                    <TabPane tab={`Kiện hàng ${index + 1}`} key={index}>
                      <Table
                        dataSource={[
                          { key: 'parcelCode', label: 'Mã kiện hàng', value: parcel.parcelCode || 'N/A' },
                          { key: 'parcelCategory', label: 'Loại hàng', value: parcel.categoryInsurance?.parcelCategory?.categoryName || 'N/A' },
                          { key: 'weight', label: 'Trọng lượng quy đổi', value: `${parcel.chargeableWeightKg} kg` },
                          { key: 'volume', label: 'Thể tích', value: `${parcel.volumeCm3} cm³` },
                          { key: 'status', label: 'Trạng thái kiện hàng', value: parcelStatusMap[parcel.status] || 'Không rõ' },
                          { key: 'price', label: 'Tổng phí', value: formatCurrency(parcel.priceVnd || 0) },
                        ]}
                        columns={[
                          { title: 'Thông tin', dataIndex: 'label', key: 'label' },
                          { title: 'Chi tiết', dataIndex: 'value', key: 'value' },
                        ]}
                        pagination={false}
                        bordered
                        showHeader={false}
                      />
                    </TabPane>
                  ))}
              </Tabs>
            ) : (
              <Empty description="Không có kiện hàng cần bồi thường" />
            )}
            <div style={{ marginTop: "1em", fontWeight: "bold", fontSize: "16px" }}>
              Tổng tiền bồi thường: {formatCurrency(selectedShipment.totalCompensationFeeVnd || 0)}
            </div>
          </>
        )}
      </Modal>


      {/* MODAL BANK INFO */}
      <Modal
        open={bankModalVisible}
        onCancel={() => setBankModalVisible(false)}
        onOk={async () => {
          try {
            const res = await api.post("/shipments/vnpay/payment-url", {
              shipmentId: selectedShipment.id,
              transactionType: 4,
              returnUrl: window.location.origin + "/dashboard/staff/support-tickets",
              cancelUrl: window.location.origin + "/dashboard/staff/support-tickets",
            });

            if (res.data?.statusCode === 200 && res.data.data) {
              window.location.href = res.data.data;
              setBankModalVisible(false);
              setCompensated(true);
            } else {
              toast.error("Không lấy được link thanh toán!");
            }
          } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi tạo giao dịch bồi thường");
          }
        }}
        okText="Xác nhận chuyển tiền"
        cancelText="Hủy"
        title="Xác nhận bồi thường"
      >
        <div style={{ fontSize: 16 }}>
          <p><strong>Ngân hàng:</strong> {bankInfo.bankCode}</p>
          <p><strong>Số tài khoản:</strong> {bankInfo.accountNumber}</p>
          <p><strong>Tên chủ tài khoản:</strong> {bankInfo.accountName}</p>
          <p style={{fontWeight: "bold", marginTop: 12 }}>
            Xác nhận chuyển tiền vào tài khoản này?
          </p>
        </div>
      </Modal>

    </div>
  );
}

export default SupportTicketStaff;
