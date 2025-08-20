import './TrackingOrderStaff.scss'

import { Button, Card, Col, ConfigProvider, DatePicker, Flex, Input, Modal, Pagination, Progress, Row, Select, Spin, Table, Tabs, Tag, Typography } from 'antd';
import { ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { formatCurrency, shipmentStatusColorMap, shipmentStatusMap } from '../../../../../constants/statusMap';
import { getAllParcels, getAllShipments, getAllStations, getMetroLines, getMetroTimeSlots, getMetroTrainsByStation } from '../../../../../config/metroApi';
import { useEffect, useState } from 'react';

import MetroStation from '../../../../../assets/metro_station.png';
import { PATH_NAME } from '../../../../../constants/pathname';
import StaffIcon from '../../../../../assets/profile.webp';
import api from './../../../../../config/axios';
import dayjs from 'dayjs';
import isBetween from "dayjs/plugin/isBetween";
import { jwtDecode } from 'jwt-decode';
import { message } from 'antd';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import viVN from 'antd/lib/locale/vi_VN';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

const { Title } = Typography;
function TrackingOrderStaff() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [stations, setStations] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [parcelMap, setParcelMap] = useState(new Map());
  const [metroLines, setMetroLine] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const today = dayjs();
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [cccdImage, setCccdImage] = useState(null);
  const [confirmImage, setConfirmImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const decodedUser = token ? jwtDecode(token) : null;
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 2;
  const staffAssignments = JSON.parse(localStorage.getItem("staffAssignments") || "[]");
  const [metroTrains, setMetroTrains] = useState([]);
  const [maxCapacity, setMaxCapacity] = useState(0);
  const [maxVolume, setMaxVolume] = useState(0);
  const [dateRange, setDateRange] = useState([]);
  const [searchCode, setSearchCode] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const ALLOWED_STATUS = [4, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 23, 25, 26];
  const [openRefundModal, setOpenRefundModal] = useState(false);
  const [openSurchargeModal, setOpenSurchargeModal] = useState(false);
  const [openCompensationModal, setOpenCompensationModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  const startIndex = (currentPage - 1) * pageSize;
  const currentData = metroTrains.slice(startIndex, startIndex + pageSize);

  if (!decodedUser?.StationId) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 600,
      }}>
        Bạn chưa được phân công vào trạm
      </div>
    );
  }

  //API ONE TIME
  useEffect(() => {
    Promise.all([getAllShipments(), getAllParcels(), getMetroTimeSlots(), getAllStations(), getMetroLines(), getMetroTrainsByStation(decodedUser?.StationId)]).then(
      ([shipmentsData, parcelsData, timeSlotsData, stationData, metroLineData, metroTrainData]) => {
        setMetroLine(metroLineData)
        setStations(stationData);
        setShipments(shipmentsData.items);
        setParcels(parcelsData);
        setTimeSlots(timeSlotsData);
        setMetroTrains(metroTrainData.items);

        //ADDITIONAL DATA TRAIN
        const additional = metroTrainData.additionalData?.[0] || [];
        const maxCapacityKg = additional.find(cfg => cfg.configKey === "MAX_CAPACITY_PER_LINE_KG")?.configValue || "N/A";
        const maxVolumeM3 = additional.find(cfg => cfg.configKey === "MAX_CAPACITY_PER_LINE_M3")?.configValue || "N/A";

        setMaxCapacity(maxCapacityKg);
        setMaxVolume(maxVolumeM3);
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
  useEffect(() => {
    const opts = ALLOWED_STATUS.map(id => ({
      id,
      label: shipmentStatusMap[id] || `Trạng thái ${id}`,
      color: shipmentStatusColorMap[id] || 'default',
    }));
    setStatusOptions(opts);
  }, []);

  const handleFilterChange = () => {

    let filtered = shipments.filter(order =>
      order.shipmentStatus == 4
      || order.shipmentStatus == 8
      || order.shipmentStatus == 9
      || order.shipmentStatus == 10
      || order.shipmentStatus == 11
      || order.shipmentStatus == 13
      || order.shipmentStatus == 14
      || order.shipmentStatus == 15
      || order.shipmentStatus == 16
      || order.shipmentStatus == 18
      || order.shipmentStatus == 24
      || order.shipmentStatus == 25
      || order.shipmentStatus == 26
    );

    //DATE RANGE FILTER
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(order =>
        dayjs(order.scheduledDateTime).isBetween(
          startDate.startOf("day"),
          endDate.endOf("day"),
          null,
          "[]"
        )
      );
    }
    //STATUS FILTER
    if (statusFilter) {
      filtered = filtered.filter(order => order.shipmentStatus === statusFilter);
    }

    //SEARCH TRACKING CODE
    if (searchCode && searchCode.trim() !== '') {
      const searchLower = searchCode.trim().toLowerCase();
      filtered = filtered.filter(order =>
        order.trackingCode.toLowerCase().includes(searchLower)
      );
    }

    setFilteredShipments(filtered);
  };


  useEffect(() => {
    if (shipments.length > 0) {
      handleFilterChange();
    }
  }, [shipments, dateRange, statusFilter, searchCode]);

  const handleOpenModal = (shipment) => {
    setSelectedOrder(shipment);
    setIsUploadModalOpen(true);
  };

  const handleConfirmUpload = async () => {
    if (!cccdImage || !confirmImage) {
      toast.error("Vui lòng chọn cả hai ảnh.");
      return;
    }

    try {
      //UPLOAD IMAGES
      const formData = new FormData();
      formData.append("files", cccdImage);
      formData.append("files", confirmImage);
      const res = await api.post("/media/images", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const urls = res.data?.data;
      if (!urls?.length || urls.length < 2) {
        toast.error("Không nhận được đủ URL ảnh từ server.");
        return;
      }

      //CONFIRM SHIPMENT
      const payload = {
        shipmentId: selectedOrder.id,
        pickedUpMedias: [
          { mediaUrl: urls[0], description: "CCCD" },
          { mediaUrl: urls[1], description: "Ảnh nhận hàng" },
        ],
      };
      const confirmRes = await api.post("/shipments/complete", payload);
      setLoading(true);
      if (confirmRes.data?.statusCode === 200) {
        toast.success("Xác nhận hoàn thành đơn hàng thành công!");
        setIsUploadModalOpen(false);
        setCccdImage(null);
        setConfirmImage(null);
        setSelectedOrder(null);
        setLoading(false);
      } else {
        toast.error("Xác nhận thất bại!");
        setLoading(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message);
      setLoading(false);
      console.error(err);
    }
  };

  const handleAction = (shipment) => {
    setSelectedShipment(shipment);
    switch (shipment.shipmentStatus) {
      case 12:
        setOpenSurchargeModal(true);
        break;
      case 4:
        setOpenRefundModal(true);
        break;
      case 25:
        setOpenCompensationModal(true);
        break;
    }
  };

  const createPaymentLink = async (shipment, transactionType) => {
    try {
      const payload = {
        shipmentId: shipment.id,
        transactionType,
        returnUrl: window.location.origin + "/dashboard/staff/tracking-order",
        cancelUrl: window.location.origin + "/dashboard/staff/tracking-order",
      };

      const res = await api.post("/shipments/vnpay/payment-url", payload);

      if (res.data?.statusCode === 200 && res.data.data) {
        window.location.href = res.data.data; // Redirect to VNPay
      } else {
        toast.error("Không lấy được link thanh toán!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi tạo link thanh toán");
      console.error(err);
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
      title: 'Hạn chót gửi hàng',
      dataIndex: 'scheduledDateTime',
      key: 'scheduledTime',
      render: (_, record) => dayjs(record.scheduledDateTime).format('HH:mm'),
    },
    {
      title: 'Thời điểm tạo yêu cầu',
      key: 'createdAt',
      render: (_, record) => dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Tổng chi phí',
      key: 'totalCost',
      render: (_, record) => formatCurrency(record.totalCostVnd),
    },
    {
      title: "Trạng thái",
      dataIndex: "shipmentStatus",
      key: "shipmentStatus",
      render: (status) => (
        <Tag color={shipmentStatusColorMap[status] || "default"}>
          {shipmentStatusMap[status] || "Không rõ"}
        </Tag>
      ),
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
          <Button className='booking-table-staff_button' onClick={() => onRowClick(record)}
          >
            Xem chi tiết
          </Button>
        </ConfigProvider>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        let buttonLabel = null;
        let transactionType = null;
        let disabled = false;
        let onClickAction = null;

        switch (record.shipmentStatus) {
          case 11: // AWAITING DELIVERED
            buttonLabel = "Xác nhận giao hàng thành công";
            onClickAction = () => handleOpenModal(record);
            disabled = false;
            break;
          case 12: // APPLY SURCHARGE
            buttonLabel = "Thu phí tồn kho";
            transactionType = 2;
            onClickAction = () => handleAction(record, transactionType);
            break;
          case 4: // REFUND
            buttonLabel = "Hoàn tiền";
            transactionType = 3;
            onClickAction = () => handleAction(record, transactionType);
            break;
          case 25: // COMPENSATION
            buttonLabel = "Bồi thường";
            transactionType = 4;
            onClickAction = () => handleAction(record, transactionType);
            break;
          default:
            buttonLabel = "Xác nhận giao hàng thành công";
            onClickAction = () => { };
            disabled = true;
            break;
        }

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
                }
              }
            }}
          >
            <Button
              type="primary"
              disabled={disabled}
              onClick={onClickAction}
            >
              {buttonLabel}
            </Button>
          </ConfigProvider>
        );
      },
    }


  ];

  const onRowClick = (record) => {
    const relatedParcels = getParcelsByShipmentId(record.id);
    setSelectedOrder({ ...record, relatedParcels });
    navigate(
      PATH_NAME.DASHBOARD_STAFF_ORDER_INFORMATION.replace(
        ":trackingCode",
        record.trackingCode
      )
    );
  };

  const handleResetFilters = () => {
    setDateRange(null);
    setStatusFilter(null);
    setSearchCode('');
  };

  return (
    <>
      <div className="order-staff-container">
        <div className="metro-info" style={{ marginBottom: "1em" }}>
          <Card style={{ marginBottom: '1em' }}>
            <Title level={3}>Thông tin nhân viên</Title>
            <Row gutter={24}>
              {/* AVATAR */}
              <Col span={6}>
                <img
                  src={StaffIcon}
                  alt="Metro_Subway"
                  style={{ width: "5em" }}
                />
              </Col>

              {/* STAFF ASSIGNMENT */}
              <Col span={18}>
                <Flex justify="space-between" align="center" style={{ flexWrap: "wrap" }}>
                  {/* Thông tin nhân viên */}
                  <div className="metro-line-description">
                    Vai trò
                    <div className="data">
                      {decodedUser?.AssignmentRole || "N/A"}
                    </div>
                  </div>
                  <div className="metro-line-description">
                    Làm việc tại trạm
                    <div className="data">
                      {
                        stations.find(station => station.id === decodedUser?.StationId)?.stationNameVi || "N/A"
                      }
                    </div>
                  </div>

                  <div className="metro-line-description">
                    Thời gian bắt đầu
                    <div className="data">
                      {staffAssignments?.[0]?.fromTime
                        ? dayjs(staffAssignments[0].fromTime).format("DD/MM/YYYY")
                        : "N/A"}
                    </div>
                  </div>

                  <div className="metro-line-description">
                    Thời gian kết thúc
                    <div className="data">
                      {staffAssignments?.[0]?.toTime
                        ? dayjs(staffAssignments[0].toTime).format("DD/MM/YYYY")
                        : "N/A"}
                    </div>
                  </div>
                </Flex>
              </Col>
            </Row>
          </Card>
          <Card style={{ marginBottom: '1em' }}>
            <Title level={3}>{metroTrains.length} tàu hoạt động hiện tại</Title>
            <Row gutter={16}>
              {currentData.map((train) => (
                <Col span={24} key={train.id}>
                  <Card className="metro-subway-info" style={{ marginBottom: '1em' }}>
                    <Flex justify="space-between" align="center">
                      <Flex align="center" gap="small">
                        <img
                          src={MetroStation}
                          alt="Metro_Subway"
                          style={{ width: "3em" }}
                        />
                        <div className="metro-subway-description" style={{ marginLeft: '0.5em' }}>
                          Tàu
                          <div className="subway-data">{train.trainCode}</div>
                        </div>
                      </Flex>
                      <div className="metro-subway-description">
                        Trọng tải tàu (kg)
                        <div className="subway-data">
                          {maxCapacity} kg
                        </div>
                      </div>
                      <div className="metro-subway-description">
                        Dung tích tàu (m³)
                        <div className="subway-data">
                          {maxVolume} m³
                        </div>
                      </div>
                    </Flex>
                  </Card>
                </Col>
              ))}
            </Row>

            <Flex justify="center" style={{ marginTop: "1em" }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={metroTrains.length}
                onChange={(page) => setCurrentPage(page)}
              />
            </Flex>
          </Card>
        </div>
        <div className="filter-sort" style={{ marginBottom: "1em" }}>
          <Card>
            <Title level={3}>Thời gian</Title>
            <Row gutter={16}>
              <Col span={6}>
                <DatePicker
                  value={dateFilter ?? today}
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
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <ConfigProvider locale={viVN}>
                    <RangePicker
                      value={dateRange}
                      onChange={setDateRange}
                      style={{ width: '100%' }}
                    />
                  </ConfigProvider>
                </Col>
                <Col span={6}>
                  <Select
                    placeholder="Trạng thái"
                    style={{ width: 350 }}
                    allowClear
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusOptions.map(s => ({
                      value: s.id,
                      label: <Tag color={s.color}>{s.label}</Tag>,
                    }))}
                  />
                </Col>
                <Col span={6}>
                  <Input.Search
                    placeholder="Tìm theo mã đơn hàng"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    onSearch={(v) => setSearchCode(v)}
                    allowClear
                  />
                </Col>
                <Col span={6}>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleResetFilters}>
                  </Button>
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
              locale={{ emptyText: 'Không có dữ liệu' }}
            />
          </Card>

          {/* UPLOAD CONFIRM IMAGES SHIPMENT */}
          <Modal
            open={isUploadModalOpen}
            onCancel={() => {
              setIsUploadModalOpen(false);
              setSelectedOrder(null);
              setCccdImage(null);
              setConfirmImage(null);
            }}
            onOk={handleConfirmUpload}
            okText="Xác nhận"
            cancelText="Hủy"
            destroyOnClose
          >
            <Spin spinning={loading} tip="Đang xác nhận hoàn thành" size="large">
              <Title level={4}>Xác nhận hoàn thành đơn hàng</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>Ảnh CCCD</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCccdImage(e.target.files[0])}
                  />
                  {cccdImage && <img src={URL.createObjectURL(cccdImage)} alt="CCCD" style={{ marginTop: 10, maxWidth: '100%' }} />}
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>Ảnh nhận hàng</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setConfirmImage(e.target.files[0])}
                  />
                  {confirmImage && <img src={URL.createObjectURL(confirmImage)} alt="Confirm" style={{ marginTop: 10, maxWidth: '100%' }} />}
                </Col>
              </Row>
            </Spin>
          </Modal>

          {/* REFUND MODAL */}
          <Modal
            open={openRefundModal}
            onOk={() => {
              createPaymentLink(selectedShipment, 3);
              setOpenRefundModal(false);
            }}
            onCancel={() => setOpenRefundModal(false)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <p>Xác nhận hoàn tiền cho đơn hàng này?</p>
          </Modal>

          {/* SURCHARGE MODAL */}
          <Modal
            open={openSurchargeModal}
            onOk={() => {
              createPaymentLink(selectedShipment, 2);
              setOpenSurchargeModal(false);
            }}
            onCancel={() => setOpenSurchargeModal(false)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <p>Thu thêm phí tồn kho do khách nhận trễ?</p>
          </Modal>

          {/* COMPENSATION MODAL */}
          <Modal
            open={openCompensationModal}
            onOk={() => {
              createPaymentLink(selectedShipment, 4); // Compensation
              setOpenCompensationModal(false);
            }}
            onCancel={() => setOpenCompensationModal(false)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <p>Bồi thường cho đơn hàng bị mất kiện?</p>
          </Modal>

        </div>
      </div>
    </>
  )
}

export default TrackingOrderStaff
