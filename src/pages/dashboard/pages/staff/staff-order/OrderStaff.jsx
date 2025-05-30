import './OrderStaff.scss'

import { Button, ConfigProvider, Modal, Space, Table, Typography } from 'antd';
import React, { useState } from 'react';

const { Text, Title } = Typography;

// Fake data - array đơn hàng
const ordersFakeData = [
  {
    id: 'ORD001',
    orderName: 'Kiện hàng 1',
    senderName: 'Nguyễn Văn A',
    recipientName: 'Trần Thị B',
    parcelCategory: 'Điện tử',
    lengthCm: 30,
    widthCm: 20,
    heightCm: 10,
    weightKg: 5,
    departureStation: 'Bến Thành',
    destinationStation: 'Suối Tiên',
    departureDate: '2025-06-01',
    departureTime: '08:00',
    createdAt: '2025-05-20 10:00',
    unitPrice: 100000,
    insuranceFee: 20000,
    shippingFee: 50000,
  },
  {
    id: 'ORD002',
    orderName: 'Kiện hàng 2',
    senderName: 'Phạm Văn C',
    recipientName: 'Lê Thị D',
    parcelCategory: 'Tài liệu',
    lengthCm: 40,
    widthCm: 25,
    heightCm: 15,
    weightKg: 3,
    departureStation: 'Thủ Đức',
    destinationStation: 'An Phú',
    departureDate: '2025-06-02',
    departureTime: '13:00',
    createdAt: '2025-05-21 14:30',
    unitPrice: 80000,
    insuranceFee: 0,
    shippingFee: 40000,
  },
  // ... thêm đơn hàng fake nếu cần
];

// Hàm format tiền
const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

function OrderStaff() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Columns bảng
  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên đơn hàng',
      dataIndex: 'orderName',
      key: 'orderName',
    },
    {
      title: 'Trọng lượng (kg)',
      dataIndex: 'weightKg',
      key: 'weightKg',
    },
    {
      title: 'Trạm gửi',
      dataIndex: 'departureStation',
      key: 'departureStation',
    },
    {
      title: 'Trạm nhận',
      dataIndex: 'destinationStation',
      key: 'destinationStation',
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'departureDate',
      key: 'departureDate',
    },
    {
      title: 'Giờ gửi',
      dataIndex: 'departureTime',
      key: 'departureTime',
    },
    {
      title: 'Thời điểm tạo yêu cầu',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Tổng chi phí',
      key: 'totalCost',
      render: (_, record) => formatCurrency(record.shippingFee + record.insuranceFee),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Xem chi tiết',
      key: 'action',
      render: (_, record) => (
        <ConfigProvider
          theme={
            {
              components: {
                Button: {
                  defaultColor: "white",
                  defaultBg: "#4CAF50",
                  defaultBorderColor: "#4CAF50",
                  defaultHoverBorderColor: "#FFC107",
                  defaultHoverColor: "black",
                  defaultHoverBg: "#FFC107",
                  defaultActiveBg: "#4CAF50",
                  defaultActiveBorderColor: "#4CAF50",
                  defaultActiveColor: "white",
                }
              }
            }
          }>
          <Button className='booking-table-staff_button'
            onClick={() => onRowClick(record)}
          >
            Xem chi tiết
          </Button>
        </ConfigProvider>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <ConfigProvider
          theme={
            {
              components: {
                Button: {
                  defaultColor: "white",
                  defaultBg: "#0066CC",
                  defaultBorderColor: "#0066CC",
                  defaultHoverBorderColor: "#FFC107",
                  defaultHoverColor: "black",
                  defaultHoverBg: "#FFC107",
                  defaultActiveBg: "#0066CC",
                  defaultActiveBorderColor: "#0066CC",
                  defaultActiveColor: "white",
                }
              }
            }
          }>
          <Button className='booking-table-staff_button'
            onClick={() => handleConfirmOrder()}
          >
            Xác nhận
          </Button>
        </ConfigProvider>
      ),
    },
  ];

  // Khi click vào 1 hàng
  const onRowClick = (record) => {
    setSelectedOrder(record);
    setModalOpen(true);
  };

  // Xác nhận đơn hàng (bạn sẽ xử lý API ở đây)
  const handleConfirmOrder = () => {
    // Ví dụ: gọi API xác nhận đơn hàng ...
    alert(`Xác nhận đơn hàng: ${selectedOrder.id}`);
    setModalOpen(false);
  };

  return (
    <>
      <div className="order-staff-container">
        <Table
          columns={columns}
          dataSource={ordersFakeData}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          bordered
          style={{ cursor: 'pointer' }}
        />

        <Modal
          title={`Chi tiết đơn hàng: ${selectedOrder?.id || ''}`}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={[
            <Button key="cancel" onClick={() => setModalOpen(false)}>
              Đóng
            </Button>,
            <Button
              key="confirm"
              type="primary"
              onClick={handleConfirmOrder}
              disabled={!selectedOrder}
            >
              Xác nhận đơn hàng
            </Button>,
          ]}
          width={700}
        >
          {selectedOrder && (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Title level={5}>Thông tin đơn hàng</Title>
              <Text><b>STT:</b> {ordersFakeData.findIndex(o => o.id === selectedOrder.id) + 1}</Text>
              <Text><b>Mã đơn hàng:</b> {selectedOrder.id}</Text>
              <Text><b>Tên đơn hàng:</b> {selectedOrder.orderName}</Text>
              <Text><b>Người gửi:</b> {selectedOrder.senderName}</Text>
              <Text><b>Người nhận:</b> {selectedOrder.recipientName}</Text>
              <Text><b>Loại hàng:</b> {selectedOrder.parcelCategory}</Text>
              <Text><b>Kích thước (D x R x C):</b> {`${selectedOrder.lengthCm} x ${selectedOrder.widthCm} x ${selectedOrder.heightCm} cm`}</Text>
              <Text><b>Trọng lượng:</b> {selectedOrder.weightKg} kg</Text>
              <Text><b>Trạm gửi:</b> {selectedOrder.departureStation}</Text>
              <Text><b>Trạm nhận:</b> {selectedOrder.destinationStation}</Text>
              <Text><b>Ngày gửi:</b> {selectedOrder.departureDate}</Text>
              <Text><b>Giờ gửi:</b> {selectedOrder.departureTime}</Text>
              <Text><b>Thời điểm tạo yêu cầu:</b> {selectedOrder.createdAt}</Text>
              <Text><b>Đơn giá:</b> {formatCurrency(selectedOrder.unitPrice)}</Text>
              <Text><b>Phí bảo hiểm:</b> {formatCurrency(selectedOrder.insuranceFee)}</Text>
              <Text><b>Phí gửi hàng:</b> {formatCurrency(selectedOrder.shippingFee)}</Text>
              <Text><b>Tổng chi phí:</b> {formatCurrency(selectedOrder.shippingFee + selectedOrder.insuranceFee)}</Text>
            </Space>
          )}
        </Modal>
      </div>
    </>
  );
}

export default OrderStaff;
