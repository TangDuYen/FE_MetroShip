import './OrderStaff.scss'

import { Button, Col, ConfigProvider, DatePicker, Modal, Row, Select, Space, Table, Tabs, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import TextArea from 'antd/es/input/TextArea';
import api from './../../../../../config/axios';
import dayjs from 'dayjs';
import moment from 'moment';
import { toast } from 'react-toastify';

const { TabPane } = Tabs;

const { Text, Title } = Typography;

// Hàm format tiền
const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

function OrderStaff() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [shipments, setShipments] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [stations, setStations] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [stationFilter, setStationFilter] = useState(null);
  const [routeFilter, setRouteFilter] = useState(null);
  const [parcelMap, setParcelMap] = useState(new Map());

  useEffect(() => {
    const map = new Map();
    parcels.forEach((parcel) => {
      if (!map.has(parcel.shipmentId)) {
        map.set(parcel.shipmentId, []);
      }
      map.get(parcel.shipmentId).push(parcel);
    });
    setParcelMap(map);
  }, [parcels]);



  const getAllStation = async () => {
    try {
      const response = await api.get("/stations");
      setStations(response.data.data);
    } catch (error) {
      console.log("Không thể lấy thông tin trạm");
      toast.error("Không thể lấy thông tin trạm");
    }
  }

  const getAllShipments = async () => {
    try {
      const response = await api.get("/shipments?PageSize=20");
      const data = response.data.data.items;
      setShipments(data);
      setFilteredShipments(data);
    } catch (error) {
      toast.error("Không thể lấy dữ liệu đăng nhập");
    }
  };

  const getAllParcels = async () => {
    try {
      const response = await api.get("/parcels?PageSize=20");
      setParcels(response.data.data.items);
    } catch (error) {
      console.log("Không thể lấy thông tin trạm");
      toast.error("Không thể lấy thông tin trạm");
    }
  }


  const parcelStatusMap = (status) => {
    const statusMapping = {
      0: "Đang xử lý", //AwaitingConfirmation
      1: "Đợi thanh toán", //AwaitingPayment
      2: "Đợi gửi hàng", //AwaitingDropOff
      3: "Từ chối", //Rejected
      4: "Chưa thanh toán", //Unpaid
      5: "Đã hủy", //Cancelled
      6: "Chờ hoàn tiền", //AwaitingRefund
      7: "Đã hoàn tiền", //Refunded
      8: "Không đến gửi hàng", //NoDropOff
      9: "Đã nhận hàng tại trạm", //ReceivedAtStation
      10: "Đang trên đường vận chuyển - Tuyến ", //InTransitLineXStationXC
      11: "Chuyển sang tuyến ", //TransferringToLineYStationYD
      12: "Đã nhận hàng ở trạm", //ReceivedAtStationB
      13: "Đợi khách đến lấy hàng", //OutForDelivery
      14: "Hết hạn", //Overdue
      15: "Lưu kho lâu", //LongTermStorage
      16: "Hoàn thành", //Delivered
    };
    return statusMapping[status] || 'Không xác nhận';
  };

  const getParcelsByShipmentId = (shipmentId) => {
    return parcels.filter(parcel => parcel.shipmentId === shipmentId);
  };


  const handleFilterChange = () => {
    let filtered = [...shipments];

    if (dateFilter) {
      filtered = filtered.filter(order => moment(order.scheduleDateTime).isSame(dateFilter, 'day'));
    }
    if (stationFilter) {
      filtered = filtered.filter(order => order.departureStationName === stationFilter);
    }
    if (routeFilter) {
      filtered = filtered.filter(order => order.route === routeFilter);
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
    getAllParcels();
  }, []);

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
      dataIndex: 'scheduledDateTime',
      key: 'scheduledDateTime',
      render: (_, record) => dayjs(record.scheduledDateTime).format('DD/MM/YYYY'),
    },
    {
      title: 'Giờ gửi',
      dataIndex: 'scheduledDateTime',
      key: 'scheduledTime',
      render: (_, record) => dayjs(record.scheduledDateTime).format('HH:mm'),
    },
    {
      title: 'Thời điểm tạo yêu cầu',
      dataIndex: 'bookedAt', // Add this if it's available in the API
      key: 'bookedAt',
      render: (_, record) => dayjs(record.bookedAt).format('YYYY-MM-DD HH:mm:ss') || 'N/A', // Adjust if necessary
    },
    // {
    //   title: 'Số lượng kiện hàng',
    //   dataIndex: 'bookedAt', 
    //   key: 'bookedAt',
    //   render: (_, record) => dayjs(record.bookedAt).format('YYYY-MM-DD HH:mm:ss') || 'N/A', // Adjust if necessary
    // },
    {
      title: 'Tổng chi phí',
      key: 'totalCost',
      render: (_, record) => formatCurrency(record.totalCostVnd), // Mapping to totalCostVnd from the API
    },
    {
      title: 'Trạng thái',
      dataIndex: 'shipmentStatus',
      key: 'shipmentStatus',
      render: (status) => {
        const statusMapping = {
          0: 'Đang xử lý', //Processing
          1: 'Từ chối', //Rejected
          2: 'Đợi thanh toán', //PartiallyConfirmed
          3: 'Đã xác nhận', //Accepted
          4: 'Chưa thanh toán', //Unpaid
          5: 'Hủy', //Cancelled
          6: 'Đợi hoàn tiền', //AwaitingRefund
          7: 'Đã hoàn tiền', //Refunded
          8: 'Không xuất hiện', //NoDropOff
          9: 'Đã thanh toán', //Paid
          10: 'Đã nhận hàng', //PickedUp
          11: 'Đang vận chuyển', //In Transit
          12: 'Đợi lấy hàng', //AwaitingForDelivery
          13: 'Thu phí tồn kho', //ApplyingSurcharge
          14: 'Quá hạn', //Expired
          15: 'Đợi đánh giá', //AwaitingFeedback
          16: 'Hoàn thành', //Completed
        };
        return statusMapping[status] || 'Không xác nhận';
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
                defaultBg: "#0066CC",
                defaultBorderColor: "#0066CC",
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
      key: 'confirm',
      render: (_, record) => {
        const relatedParcels = parcelMap.get(record.id) || [];
        const firstParcel = relatedParcels[0]; // dùng kiện hàng đầu tiên
        return (
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
                  defaultActiveBg: "#0066CC",
                  defaultActiveBorderColor: "#0066CC",
                  defaultActiveColor: "white",
                }
              }
            }}
          >
            <Button
              className='booking-table-staff_button'
              onClick={() => firstParcel && handleConfirmOrder(firstParcel.id)}
              disabled={record.shipmentStatus >= 3 || !firstParcel}
            >
              Xác nhận
            </Button>
          </ConfigProvider>
        );
      }
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
          <Button className='booking-table-staff_button'
            onClick={handleRejectOrder(record.parcelId)}
            disabled={record.shipmentStatus >= 1}>
            Từ chối
          </Button>
        </ConfigProvider>
      ),
    },
  ];

  const onRowClick = (record) => {
    const relatedParcels = getParcelsByShipmentId(record.id); // Dùng shipment.id
    setSelectedOrder({ ...record, relatedParcels }); // lưu luôn các parcel liên quan
    setModalOpen(true);
  };



  const handleConfirmOrder = async (parcelId) => {
    try {
      const response = await api.post(`/parcels/staff/confirmation/${parcelId}`);
      toast.success(`Đã xác nhận kiện hàng: ${parcelId}`);
      setModalOpen(false);
      await getAllShipments();
      await getAllParcels();
    } catch (error) {
      toast.error("Không thể xác nhận kiện hàng");
    }
  };


  const handleRejectOrder = async (parcelId) => {
    // try {
    //   const response = await api.post(`/parcels/staff/rejection/${parcelId}`);
    //   console.log(response.data);
    //   toast.success(`Đã từ chối nhận kiện hàng: ${parcelId}`);
    //   setModalOpen(false);
    // } catch (error) {
    //   toast.error("Không thể từ chối nhận kiện hàng");
    // }
  };


  return (
    <>
      <div className="order-staff-container">
        <div className="filter-sort" style={{ marginBottom: "1em" }}>
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
                Chuyển trạm
              </Button></Col>
          </Row>
        </div>
        <Table
          columns={columns}
          dataSource={shipments}
          rowKey="trackingCode"
          pagination={{ pageSize: 10 }}
          bordered
          style={{ cursor: 'pointer' }}
        />
        <Modal
          title={`Chi tiết đơn hàng: ${selectedOrder?.trackingCode || ''}`}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          width={700}
        >
          {selectedOrder && selectedOrder.relatedParcels && (
            <Tabs defaultActiveKey="0">
              {selectedOrder.relatedParcels.map((parcel, index) => (
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
                          label: 'Giờ gửi',
                          value: dayjs(selectedOrder.scheduledDateTime).format('HH:mm') || 'N/A',
                        },
                        {
                          key: 'route',
                          label: 'Lộ trình',
                          value: selectedOrder.route || 'N/A',
                        },
                        {
                          key: 'createdAt',
                          label: 'Thời điểm tạo yêu cầu',
                          value: dayjs(selectedOrder.bookedAt).format('YYYY-MM-DD HH:mm:ss') || 'N/A',
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
                        {
                          key: 'parcelStatus',
                          label: 'Trạng thái kiện hàng',
                          value: parcelStatusMap(parcel.parcelStatus),
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
                    <Button
                      type="primary"
                      disabled={parcel.parcelStatus >= 1}
                      onClick={() => handleConfirmOrder(parcel.id)}
                    >
                      Xác nhận kiện hàng
                    </Button>
                  </Space>
                </TabPane>
              ))}
            </Tabs>
          )}

        </Modal>

      </div>
    </>
  );
}

export default OrderStaff;
