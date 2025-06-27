import './OrderStaff.scss'

import { Button, Card, Col, ConfigProvider, DatePicker, Flex, Modal, Progress, Row, Segmented, Select, Space, Table, Tabs, Typography } from 'antd';
import { getAllMetroTrains, getAllParcels, getAllShipments, getAllStations, getMetroLines, getMetroTimeSlots } from '../../../../../config/metroApi';
import { useEffect, useState } from 'react';

import { ClockCircleOutlined } from '@ant-design/icons';
import MetroIcon from '../../../../../assets/metro_train.png';
import MetroStation from '../../../../../assets/metro_station.png';
import api from './../../../../../config/axios';
import dayjs from 'dayjs';
import moment from 'moment';
import { toast } from 'react-toastify';

const { TabPane } = Tabs;

const { Title } = Typography;

function OrderStaff() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [shipments, setShipments] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [stations, setStations] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectParcel, setRejectParcel] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [stationFilter, setStationFilter] = useState(null);
  const [routeFilter, setRouteFilter] = useState(null);
  const [parcelMap, setParcelMap] = useState(new Map());
  const [metroLines, setMetroLine] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [metroTrains, setMetroTrains] = useState([]);

  //FORMAT TIỀN
  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

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

  //API ONE TIME
  useEffect(() => {
    Promise.all([getAllShipments(), getAllParcels(), getMetroTimeSlots(), getAllStations(), getMetroLines(), getAllMetroTrains()]).then(
      ([shipmentsData, parcelsData, timeSlotsData, stationData, metroLineData, metroTrainData]) => {
        setMetroLine(metroLineData)
        setStations(stationData);
        setShipments(shipmentsData);
        setParcels(parcelsData);
        setTimeSlots(timeSlotsData);
        setMetroTrains(metroTrainData);
      }
    );
  }, []);

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

  const getParcelsByShipmentId = (shipmentId) => {
    return parcels.filter(parcel => parcel.shipmentId === shipmentId);
  };

  const getCurrentShift = (slots) => {
    const now = moment();
    return slots.find(slot => {
      const start = moment(slot.openTime, 'HH:mm:ss');
      const end = moment(slot.closeTime, 'HH:mm:ss');

      //NIGHT SHIFT
      if (end.isBefore(start)) {
        return now.isAfter(start) || now.isBefore(end);
      }
      return now.isBetween(start, end);
    });
  };

  const handleFilterChange = () => {
    const now = moment();
    const start = now.clone().subtract(48, 'hours');
    const end = now.clone().add(48, 'hours');

    // Bước 1: lọc các đơn chưa xác nhận, tạo trong vòng 48h
    let filtered = shipments.filter(order =>
      order.shipmentStatus === 0 &&
      moment(order.bookedAt).isBetween(start, end)
    );

    // Bước 2: nếu chọn ngày => lọc thêm theo ngày gửi (scheduleDateTime)
    if (dateFilter) {
      filtered = filtered.filter(order =>
        moment(order.bookedAt).isSame(dateFilter, 'day')
      );
    }

    // Bước 3: filter theo trạm và tuyến (nếu có)
    if (stationFilter) {
      filtered = filtered.filter(order => order.departureStationName === stationFilter);
    }

    if (routeFilter) {
      filtered = filtered.filter(order => order.route === routeFilter);
    }

    setFilteredShipments(filtered);
  };


  useEffect(() => {
    if (shipments.length > 0) {
      handleFilterChange();
    }
  }, [shipments, dateFilter, stationFilter, routeFilter]);

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
      dataIndex: 'departureStationName',
      key: 'departureStation',
    },
    {
      title: 'Trạm nhận',
      dataIndex: 'destinationStationName',
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
      dataIndex: 'bookedAt',
      key: 'bookedAt',
      render: (_, record) => dayjs(record.bookedAt).format('YYYY-MM-DD HH:mm:ss') || 'N/A',
    },
    {
      title: 'Tổng chi phí',
      key: 'totalCost',
      render: (_, record) => formatCurrency(record.totalCostVnd),
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
                defaultHoverBorderColor: "#0066CC",
                defaultHoverColor: "white",
                defaultHoverBg: "#0066CC",
                defaultActiveBg: "#0066CC",
                defaultActiveBorderColor: "#0066CC",
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
        const firstParcel = relatedParcels[0];
        return (
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  defaultColor: "white",
                  defaultBg: "#4CAF50",
                  defaultBorderColor: "#4CAF50",
                  defaultHoverColor: "white",
                  defaultHoverBg: "#4CAF50",
                  defaultHoverBorderColor: "#4CAF50",
                  defaultActiveColor: "white",
                  defaultActiveBg: "#4CAF50",
                  defaultActiveBorderColor: "#4CAF50",
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
      render: (_, record) => {
        const relatedParcels = parcelMap.get(record.id) || [];
        const firstParcel = relatedParcels[0];
        return (
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  defaultColor: "white",
                  defaultBg: "red",
                  defaultBorderColor: "red",
                  defaultHoverColor: "white",
                  defaultHoverBg: "red",
                  defaultHoverBorderColor: "red",
                  defaultActiveColor: "white",
                  defaultActiveBg: "red",
                  defaultActiveBorderColor: "red",
                }
              }
            }}>
            <Button
              className='booking-table-staff_button'
              onClick={() => {
                if (firstParcel) {
                  setRejectParcel(firstParcel);
                  setRejectModalOpen(true);
                }
              }}
              disabled={record.shipmentStatus >= 3 || !firstParcel}
            >
              Từ chối
            </Button>

          </ConfigProvider>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => {
        const relatedParcels = parcelMap.get(record.id) || [];
        const firstParcel = relatedParcels[0];
        return (
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  defaultColor: "black",
                  defaultBg: "#FFC107",
                  defaultBorderColor: "#FFC107",
                  defaultHoverColor: "black",
                  defaultHoverBg: "#FFC107",
                  defaultHoverBorderColor: "#FFC107",
                  defaultActiveColor: "black",
                  defaultActiveBg: "#FFC107",
                  defaultActiveBorderColor: "#FFC107",
                }
              }
            }}>
            <Button className='booking-table-staff_button'
              onClick={() => firstParcel && handleCheckOrder(firstParcel.id)}
              disabled={record.shipmentStatus >= 3 || !firstParcel}
            >
              Kiểm tra
            </Button>
          </ConfigProvider>
        );
      }
    },
  ];

  const onRowClick = (record) => {
    const relatedParcels = getParcelsByShipmentId(record.id);
    setSelectedOrder({ ...record, relatedParcels });
    setModalOpen(true);
  };

  const handleConfirmOrder = async (parcelId) => {
    try {
      await api.post(`/parcels/staff/confirmation/${parcelId}`);
      toast.success(`Đã xác nhận kiện hàng: ${parcelId}`);
      await getAllShipments();
      await getAllParcels();
    } catch (error) {
      toast.error("Không thể xác nhận kiện hàng");
    }
  };

  const handleRejectOrder = async (parcelId) => {
    const payload = {
      parcelId: parcelId,
      rejectReason: "string"
    }
    try {
      await api.post(`/parcels/staff/rejection/${parcelId}`, payload);
      toast.success(`Đã từ chối kiện hàng: ${parcelId}`);
      setModalOpen(false);
      await getAllShipments();
      await getAllParcels();
    } catch (error) {
      toast.error("Không thể từ chối kiện hàng");
    }
  };
  const handleCheckOrder = async (parcelId) => {
    try {
      // await api.post(`/parcels/staff/rejection/${parcelId}`);
      toast.success(`Kiện hàng đủ tiêu chuẩn: ${parcelId}`);
      setModalOpen(false);
      await getAllShipments();
      await getAllParcels();
    } catch (error) {
      toast.error("Toa tàu đã đầy. Hãy đợi chuyến sau");
    }
  };

  return (
    <>
      <div className="order-staff-container">
        <div className="metro-info" style={{ marginBottom: "1em" }}>
          <Card>
            <Title level={3}>Thông tin tuyến Metro 1</Title>
            <Row gutter={24}>
              <Col span={6}>
                <img
                  src={MetroStation}
                  alt="Metro_Subway"
                  style={{
                    width: "5em"
                  }}
                />
              </Col>
              <Col span={18}>
                <Flex justify="space-between" align="center">
                  <div className="metro-line-description">
                    Mã tuyến
                    <div className="data">
                      L1
                    </div>
                  </div>
                  <div className="metro-line-description">
                    Số tàu hoạt động hiện tại
                    <div className="data">
                      2
                    </div>
                  </div>
                  <div className="metro-line-description">
                    Tổng sức chứa
                    <div className="data">
                      2000kg
                    </div>
                  </div>
                </Flex>
              </Col>
            </Row>
            <Title level={3}>Thông tin tàu</Title>
            <Card className="metro-subway-info">
              <Flex justify="space-between" align="center">
                <Flex align="center" gap="small">
                  <img
                    src={MetroIcon}
                    alt="Metro_Subway"
                    style={{ width: "2em", marginRight: "1em" }}
                  />
                  <div className="metro-subway-description">
                    Tàu số
                    <div className="subway-data">1</div>
                  </div>
                </Flex>
                <div className="metro-subway-description">
                  Sức chứa hiện tại
                  <div className="subway-data">
                    750/1000 kg
                    <Progress percent={75} size="small" />
                  </div>
                </div>
              </Flex>
            </Card>
            <Card className="metro-subway-info">
              <Flex justify="space-between" align="center">
                <Flex align="center" gap="small">
                  <img
                    src={MetroIcon}
                    alt="Metro_Subway"
                    style={{ width: "2em", marginRight: "1em" }}
                  />
                  <div className="metro-subway-description">
                    Tàu số
                    <div className="subway-data">2</div>
                  </div>
                </Flex>
                <div className="metro-subway-description">
                  Sức chứa hiện tại
                  <div className="subway-data">
                    750/1000 kg
                    <Progress percent={75} size="small" />
                  </div>
                </div>
              </Flex>
            </Card>
          </Card>
        </div>
        <div className="filter-sort" style={{ marginBottom: "1em" }}>
          <Card>
            <Title level={3}>Thời gian</Title>
            <Row gutter={16}>
              <Col span={6}>
                <DatePicker
                  defaultValue={moment()}
                  // value={dateFilter}
                  onChange={(date) => setDateFilter(date)}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={18}>
                <Flex gap="small" align="middle">
                  {timeSlots.map(slot => {
                    const current = getCurrentShift(timeSlots);
                    const isActive = current?.shift === slot.shift;
                    return (
                      <div
                        key={slot.id}
                        style={{
                          padding: '0.5em 1em',
                          borderRadius: '8px',
                          background: isActive ? '#0066CC' : '#f0f0f0',
                          color: isActive ? 'white' : '#000',
                          fontWeight: isActive ? 600 : 400,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5em'
                        }}
                      >
                        <ClockCircleOutlined />
                        Ca {slot.shift} ({slot.openTime.slice(0, 5)} - {slot.closeTime.slice(0, 5)})
                      </div>
                    );
                  })}
                </Flex>
              </Col>
            </Row>
          </Card>
        </div>
        <div className="table-data">
          <Card>
            <Title level={3}>Đơn hàng</Title>
            <div className="staion-sort" style={{ marginBottom: "1.5em" }}>
              <Row>
                <Col span={6} style={{ marginRight: "1em" }}>
                  <Select
                    value={stationFilter}
                    onChange={(value) => { setStationFilter(value); handleFilterChange(); }}
                    placeholder="Chọn trạm"
                    style={{ width: '100%' }}
                  >
                    {stations.map(station => (
                      <Option key={station.id} value={station.stationNameVi}>
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
                    {metroLines.map(metros => (
                      <Option key={metros.id} value={metros.id}>
                        {metros.lineNameVi}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={6}>
                  <ConfigProvider
                    theme={{
                      components: {
                        Button: {
                          defaultColor: "black",
                          defaultBg: "#FFC107",
                          defaultBorderColor: "#FFC107",
                          defaultHoverColor: "black",
                          defaultHoverBg: "#FFC107",
                          defaultHoverBorderColor: "#FFC107",
                          defaultActiveColor: "black",
                          defaultActiveBg: "#FFC107",
                          defaultActiveBorderColor: "#FFC107",
                        }
                      }
                    }}>
                    <Button className='check-order-auto'
                      style={{ marginLeft: "1em" }}
                    >
                      Kiểm tra
                    </Button>
                  </ConfigProvider>
                </Col>
              </Row>
            </div>
            <Table
              columns={columns}
              dataSource={filteredShipments}
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
                        <Space>
                          <Button
                            type="primary"
                            disabled={parcel.parcelStatus >= 1}
                            onClick={() => handleConfirmOrder(parcel.id)}
                          >
                            Xác nhận kiện hàng
                          </Button>

                          <Button
                            type="primary"
                            disabled={parcel.parcelStatus <= 1}
                            onClick={() => handleConfirmOrder(parcel.id)}
                          >
                            Xác minh người gửi
                          </Button>
                        </Space>
                      </Space>
                    </TabPane>
                  ))}
                </Tabs>
              )}
            </Modal>
            <Modal
              title={`Từ chối kiện hàng: ${rejectParcel?.parcelCode}`}
              open={rejectModalOpen}
              onCancel={() => {
                setRejectModalOpen(false);
                setRejectReason("");
              }}
              onOk={async () => {
                if (!rejectReason.trim()) {
                  toast.error("Vui lòng nhập lý do từ chối!");
                  return;
                }
                try {
                  const payload = {
                    parcelId: rejectParcel.id,
                    rejectReason,
                  };
                  await api.post(`/parcels/staff/rejection/${rejectParcel.id}`, payload);
                  toast.success(`Đã từ chối kiện hàng: ${rejectParcel.parcelCode}`);
                  setRejectModalOpen(false);
                  setRejectReason("");
                } catch (err) {
                  toast.error("Không thể từ chối kiện hàng");
                }
              }}
              okText="Xác nhận"
              cancelText="Huỷ"
            >
              <textarea
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "120px",
                  resize: "vertical",
                  padding: "0.5em",
                  fontSize: "1em",
                }}
              />
            </Modal>
          </Card>
        </div>
      </div>
    </>
  );
}

export default OrderStaff;
