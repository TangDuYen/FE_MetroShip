import './OrderStaff.scss'

import { Button, Col, ConfigProvider, DatePicker, Modal, Row, Select, Space, Table, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import TextArea from 'antd/es/input/TextArea';
import api from './../../../../../config/axios';
import moment from 'moment';
import { toast } from 'react-toastify';

const { Text, Title } = Typography;

// Hàm format tiền
const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

function OrderStaff() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [shipments, setShipments] = useState([]);
  const [stations, setStations] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [stationFilter, setStationFilter] = useState(null);
  const [routeFilter, setRouteFilter] = useState(null);

  const getAllShipments = async () => {
    try {
      const response = await api.get("/shipments");
      const data = response.data.data.items;
      setShipments(data);
      setFilteredShipments(data);
    } catch (error) {
      toast.error("Không thể lấy dữ liệu đăng nhập");
    }
  };

  const getAllStation = async () => {
    try {
      const response = await api.get("/stations");
      setStations(response.data.data);
    } catch (error) {
      console.log("Không thể lấy thông tin trạm");
      toast.error("Không thể lấy thông tin trạm");
    }
  }

  const handleFilterChange = () => {
    let filtered = [...shipments];

    if (dateFilter) {
      filtered = filtered.filter(order => moment(order.departureDate).isSame(dateFilter, 'day'));
    }
    if (stationFilter) {
      filtered = filtered.filter(order => order.departureStationName === stationFilter);
    }
    if (routeFilter) {
      filtered = filtered.filter(order => order.route === routeFilter);  // Assuming `route` is available in the order
    }

    setFilteredShipments(filtered);
  };

  const handleBulkAction = () => {
    // You could call an API to update all filtered shipments here.
    toast.success(`Đã chuyển ${filteredShipments.length} đơn hàng.`);
    setFilteredShipments([]);  // Clear filtered shipments after bulk action
  };

  useEffect(() => {
    getAllShipments();
    getAllStation();
  }, []);

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
      dataIndex: 'trackingCode',
      key: 'trackingCode',
    },
    {
      title: 'Trọng lượng (kg)',
      dataIndex: 'weightKg', // Assuming this comes from the data
      key: 'weightKg',
    },
    {
      title: 'Trạm gửi',
      dataIndex: 'departureStationName', // Adjusting based on available field
      key: 'departureStation',
    },
    {
      title: 'Trạm nhận',
      dataIndex: 'destinationStationName', // Adjusting based on available field
      key: 'destinationStation',
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'departureDate', // Add this if it's available in the API
      key: 'departureDate',
      render: (_, record) => record.departureDate || 'N/A', // Adjust if necessary
    },
    {
      title: 'Giờ gửi',
      dataIndex: 'departureTime', // Add this if it's available in the API
      key: 'departureTime',
      render: (_, record) => record.departureTime || 'N/A', // Adjust if necessary
    },
    {
      title: 'Thời điểm tạo yêu cầu',
      dataIndex: 'createdAt', // Add this if it's available in the API
      key: 'createdAt',
      render: (_, record) => record.createdAt || 'N/A', // Adjust if necessary
    },
    {
      title: 'Tổng chi phí',
      key: 'totalCost',
      render: (_, record) => formatCurrency(record.totalCostVnd), // Mapping to totalCostVnd from the API
    },
    {
      title: 'Trạng thái',
      dataIndex: 'shipmentStatus', // Assuming status is part of the shipment
      key: 'shipmentStatus',
      render: (status) => {
        const statusMapping = {
          0: 'Processing',
          1: 'Rejected',
          2: 'PartiallyConfirmed',
          3: 'Accepted',
          4: 'Unpaid',
          5: 'Cancelled',
          6: 'AwaitingRefund',
          7: 'Refunded',
          8: 'NoDropOff',
          9: 'Paid',
          10: 'PickedUp',
          11: 'InTransit',
          12: 'AwaitingForDelivery',
          13: 'ApplyingSurcharge',
          14: 'Expired',
          15: 'AwaitingFeedback',
          16: 'Completed',
        };
        return statusMapping[status] || 'Unknown';
      },
    },
    {
      title: 'Xem chi tiết',
      key: 'action',
      render: (_, record) => (
        <ConfigProvider
          theme={{
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
          }}>
          <Button className='booking-table-staff_button' onClick={() => onRowClick(record)}>
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
          theme={{
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
          }}>
          <Button className='booking-table-staff_button' onClick={() => handleConfirmOrder()}>
            Xác nhận
          </Button>
        </ConfigProvider>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <ConfigProvider
          theme={{
            components: {
              Button: {
                defaultColor: "white",
                defaultBg: "red",
                defaultBorderColor: "red",
                defaultHoverBorderColor: "#FFC107",
                defaultHoverColor: "black",
                defaultHoverBg: "#FFC107",
                defaultActiveBg: "#0066CC",
                defaultActiveBorderColor: "#0066CC",
                defaultActiveColor: "white",
              }
            }
          }}>
          <Button className='booking-table-staff_button' onClick={() => handleConfirmOrder()}>
            Từ chối
          </Button>
        </ConfigProvider>
      ),
    },
  ];

  const onRowClick = (record) => {
    setSelectedOrder(record);
    setModalOpen(true);
  };


  const handleConfirmOrder = async () => {
    try {
      const response = await api.post(``)
    } catch (error) {

    }
    alert(`Xác nhận đơn hàng: ${selectedOrder.trackingCode}`);
    setModalOpen(false);
  };

  return (
    <>
      <div className="order-staff-container">
        <div className="filter-sort" style={{marginBottom: "1em"}}>
          <Row gutter={16}>
            <Col span={6}>
              <DatePicker
                value={dateFilter ? moment(dateFilter) : null}
                onChange={(date) => { setDateFilter(date); handleFilterChange(); }}
                placeholder="Chọn ngày"
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={6}>
              <Select
                value={stationFilter}
                onChange={(value) => { setStationFilter(value); handleFilterChange(); }}
                placeholder="Chọn trạm"
                style={{ width: '100%' }}
              >
                {stations.map(station => (
                  <Option key={station.id} value={station.id}>
                    {station.stationNameVi}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Select
                value={routeFilter}
                onChange={(value) => { setRouteFilter(value); handleFilterChange(); }}
                placeholder="Chọn tuyến"
                style={{ width: '100%' }}
              >
                {/* Populate route options based on available routes */}
                <Option value="Bến Thành - Ba Son">Bến Thành - Ba Son</Option>
                <Option value="Thủ Đức - An Phú">Thủ Đức - An Phú</Option>
                {/* Add more routes as needed */}
              </Select>
            </Col>
            <Col span={6}>
              <Button
                type="primary"
                onClick={handleBulkAction}
                disabled={filteredShipments.length === 0}
              >
                Chuyển trạm cho tất cả
              </Button></Col>
          </Row>
        </div>
        <Table
          columns={columns}
          dataSource={shipments} // Use the shipments data fetched from the API
          rowKey="trackingCode" // Assuming trackingCode is unique
          pagination={{ pageSize: 10 }}
          bordered
          style={{ cursor: 'pointer' }}
        />

        <Modal
          title={`Chi tiết đơn hàng: ${selectedOrder?.trackingCode || ''}`}
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
              <Table
                dataSource={[
                  {
                    key: 'stt',
                    label: 'STT',
                    value: shipments.findIndex(o => o.trackingCode === selectedOrder.trackingCode) + 1,
                  },
                  {
                    key: 'trackingCode',
                    label: 'Mã đơn hàng',
                    value: selectedOrder.trackingCode,
                  },
                  {
                    key: 'senderName',
                    label: 'Người gửi',
                    value: selectedOrder.senderName,
                  },
                  {
                    key: 'recipientName',
                    label: 'Người nhận',
                    value: selectedOrder.recipientName,
                  },
                  {
                    key: 'parcelCategory',
                    label: 'Loại hàng',
                    value: selectedOrder.parcelCategory || 'N/A',
                  },
                  {
                    key: 'dimensions',
                    label: 'Kích thước (D x R x C)',
                    value: `${selectedOrder.lengthCm || 'N/A'} x ${selectedOrder.widthCm || 'N/A'} x ${selectedOrder.heightCm || 'N/A'} cm`,
                  },
                  {
                    key: 'weightKg',
                    label: 'Trọng lượng',
                    value: `${selectedOrder.weightKg || 'N/A'} kg`,
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
                    value: selectedOrder.departureDate || 'N/A',
                  },
                  {
                    key: 'departureTime',
                    label: 'Giờ gửi',
                    value: selectedOrder.departureTime || 'N/A',
                  },
                  {
                    key: 'route',
                    label: 'Lộ trình',
                    value: selectedOrder.route || 'N/A',
                  },
                  {
                    key: 'createdAt',
                    label: 'Thời điểm tạo yêu cầu',
                    value: selectedOrder.createdAt || 'N/A',
                  },
                  {
                    key: 'unitPrice',
                    label: 'Đơn giá',
                    value: formatCurrency(selectedOrder.unitPrice || 0),
                  },
                  {
                    key: 'insuranceFee',
                    label: 'Phí bảo hiểm',
                    value: formatCurrency(selectedOrder.insuranceFee || 0),
                  },
                  {
                    key: 'shippingFee',
                    label: 'Phí gửi hàng',
                    value: formatCurrency(selectedOrder.shippingFee || 0),
                  },
                  {
                    key: 'totalCost',
                    label: 'Tổng chi phí',
                    value: formatCurrency(selectedOrder.totalCostVnd || 0),
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
                showHeader={false} // Hide the header to make it look like a key-value table
                rowClassName="order-detail-row"
              />
            </Space>
          )}
        </Modal>
      </div>
    </>
  );
}

export default OrderStaff;
