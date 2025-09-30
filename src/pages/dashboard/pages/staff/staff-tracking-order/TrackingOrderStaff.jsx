import './TrackingOrderStaff.scss'
import "dayjs/locale/vi";

import { Button, Card, Col, ConfigProvider, DatePicker, Empty, Flex, Input, Modal, Row, Select, Space, Spin, Table, Tabs, Tag, Typography } from 'antd';
import { ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { formatCurrency, parcelStatusMap, shipmentStatusColorMap, shipmentStatusMap, staffRoleMap } from '../../../../../constants/statusMap';
import { getAllParcels, getAllStations, getBanks, getMetroLines, getMetroTimeSlots, getShipmentByStaffDestinationStation, getShipmentByStaffIncludedStation, getShipmentByStaffStation, getShipmentByTrackingCode } from '../../../../../config/metroApi';
import { useEffect, useState } from 'react';

import { PATH_NAME } from '../../../../../constants/pathname';
import StaffIcon from '../../../../../assets/profile.webp';
import TabPane from 'antd/es/tabs/TabPane';
import api from './../../../../../config/axios';
import dayjs from 'dayjs';
import isBetween from "dayjs/plugin/isBetween";
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import viVN from 'antd/lib/locale/vi_VN';

dayjs.extend(isBetween);
dayjs.locale('vi');

const { RangePicker } = DatePicker;
const customizeRenderEmpty = () => (
  <Empty
    image={Empty.PRESENTED_IMAGE_DEFAULT}
    description="Không có dữ liệu"
  />
);

const { Title } = Typography;
function TrackingOrderStaff() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shipmentsStaff, setShipmentsStaff] = useState([]);
  const [shipmentsStaff1, setShipmentsStaff1] = useState([]);
  const [shipmentsStaff2, setShipmentsStaff2] = useState([]);
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
  const [billImage, setBillImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const decodedUser = token ? jwtDecode(token) : null;
  const staffAssignments = JSON.parse(localStorage.getItem("staffAssignments") || "[]");
  const [dateRange, setDateRange] = useState([]);
  const [searchCode, setSearchCode] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const ALLOWED_STATUS = [4, 8, 9, 10, 11, 14, 16, 22, 23, 25, 24, 27];
  const [openRefundModal, setOpenRefundModal] = useState(false);
  const [openSurchargeModal, setOpenSurchargeModal] = useState(false);
  const [openCompensationModal, setOpenCompensationModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [mergedShipments, setMergedShipments] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [bankAccountModalOpen, setBankAccountModalOpen] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    bankCode: null,
    accountNumber: '',
    accountName: ''
  });
  const [openTxnModal, setOpenTxnModal] = useState(false);
  const [openQrModal, setOpenQrModal] = useState(false);
  const [txnInfo, setTxnInfo] = useState({
    bankId: null,
    accountNo: '',
    amount: ''
  });
  const [qrImageUrl, setQrImageUrl] = useState(null);

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
    Promise.all([getAllParcels(), getMetroTimeSlots(), getAllStations(), getMetroLines()]).then(
      ([parcelsData, timeSlotsData, stationData, metroLineData]) => {
        setMetroLine(metroLineData)
        setStations(stationData);
        setParcels(parcelsData);
        setTimeSlots(timeSlotsData);
      }
    );
  }, []);

  const reloadShipments = async () => {
    try {
      const [byStation, byDestination, includeStation] = await Promise.all([
        getShipmentByStaffStation(decodedUser.StationId),
        getShipmentByStaffDestinationStation(decodedUser.StationId),
        getShipmentByStaffIncludedStation(decodedUser.StationId)
      ]);

      setShipmentsStaff(byStation);
      setShipmentsStaff1(byDestination);
      setShipmentsStaff2(includeStation);


      const combined = [...byStation, ...byDestination, ...includeStation];
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      setMergedShipments(unique);

    } catch (e) {
      console.error(e);
      const errorMessage = e.response?.data?.message || "Không thể tải lại danh sách đơn hàng";
      toast.error(errorMessage);
    }
  };
  useEffect(() => {
    reloadShipments();
  }, [])

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

  useEffect(() => {
    getBanks().then(data => setBankList(data));
  }, []);

  const fetchQrByBankAccount = async (bankId, accountNo, amount) => {
    try {
      const res = await api.get(`/transactions/vietqr/${bankId}/${accountNo}?amount=${amount}`);
      return res.data?.data;
    } catch (err) {
      console.error("Lỗi fetch QR:", err);
      throw err;
    }
  };

  const getShipmentByCode = async (trackingCode) => {
    try {
      const res = await getShipmentByTrackingCode(trackingCode);
      const shipmentData = res.data;
      if (shipmentData) {
        setSelectedShipment(shipmentData);
      } else {
        toast.error("Không tìm thấy thông tin đơn hàng");
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Không thể tải lại chi tiết đơn hàng";
      toast.error(errorMessage);
    }
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
    let filtered = mergedShipments.filter(o => ALLOWED_STATUS.includes(o.shipmentStatus));

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

    filtered.sort((a, b) => dayjs(b.lastUpdatedAt).diff(dayjs(a.lastUpdatedAt)));

    setFilteredShipments(filtered);
  };


  useEffect(() => {
    handleFilterChange();
  }, [mergedShipments, dateRange, statusFilter, searchCode]);

  const handleOpenModal = (shipment) => {
    setSelectedOrder(shipment);
    setIsUploadModalOpen(true);
  };

  const handleConfirmUpload = async () => {
    if (!cccdImage || !confirmImage) {
      toast.error("Vui lòng upload đủ ảnh CCCD và ảnh xác nhận!");
      return;
    }

    try {
      setLoading(true);

      //UPLOAD IMAGES
      const formData = new FormData();
      formData.append("files", cccdImage);
      formData.append("files", confirmImage);
      if (billImage) {
        formData.append("files", billImage);
      }
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

      if (billImage && urls[2]) {
        payload.pickedUpMedias.push({
          mediaUrl: urls[2],
          description: "Ảnh xác nhận giao dịch nộp phạt nhận hàng trễ",
        });
      }
      const confirmRes = await api.post("/shipments/complete", payload);
      if (confirmRes.data?.statusCode === 200) {
        toast.success("Xác nhận hoàn thành đơn hàng thành công!");
        setIsUploadModalOpen(false);
        setCccdImage(null);
        setConfirmImage(null);
        setSelectedOrder(null);
        setLoading(false);
        await reloadShipments();
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
      case 11:
        setOpenSurchargeModal(true);
        break;
      case 4:
        getShipmentByCode(shipment.trackingCode);
        setOpenRefundModal(true);
        break;
      case 25:
      case 27:
        getShipmentByCode(shipment.trackingCode);
        setOpenCompensationModal(true);
        break;

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
          case 10: // AWAITING DELIVERED
            buttonLabel = "Xác nhận giao hàng thành công";
            onClickAction = () => handleOpenModal(record);
            disabled = false;
            break;
          case 11: // APPLY SURCHARGE
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
          case 27: // COMPENSATION
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
                      {staffRoleMap[decodedUser?.AssignmentRole] || "N/A"}
                    </div>
                  </div>
                  <div className="metro-line-description">
                    Làm việc tại trạm
                    <div className="data">
                      {
                        stations.find(station => station.stationId === decodedUser?.StationId)?.stationNameVi || "N/A"
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
        </div>
        <div className="filter-sort" style={{ marginBottom: "1em" }}>
          <Card>
            <Title level={3}>Ngày và Ca vận chuyển của Metro</Title>
            <Row gutter={16}>
              <Col span={6}>
                <DatePicker
                  value={dateFilter ?? today}
                  onChange={(date) => setDateFilter(date)}
                  style={{ width: '100%' }}
                  disabled
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
                      placeholder={["Từ ngày", "Đến ngày"]}
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
            <ConfigProvider renderEmpty={customizeRenderEmpty}>
              <Table
                columns={columns}
                dataSource={filteredShipments}
                rowKey="trackingCode"
                pagination={{ pageSize: 10 }}
                bordered
                style={{ cursor: 'pointer' }}
              />
            </ConfigProvider>
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
            width={900}
            destroyOnClose
          >
            <Spin spinning={loading} tip="Đang xác nhận hoàn thành" size="large">
              <Title level={4}>Xác nhận hoàn thành đơn hàng</Title>
              <Row gutter={18}>
                <Col span={8}>
                  <div style={{ marginBottom: 8 }}>Ảnh CCCD</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCccdImage(e.target.files[0])}
                  />
                  {cccdImage && <img src={URL.createObjectURL(cccdImage)} alt="CCCD" style={{ marginTop: 10, maxWidth: '100%' }} />}
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: 8 }}>Ảnh nhận hàng</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setConfirmImage(e.target.files[0])}
                  />
                  {confirmImage && <img src={URL.createObjectURL(confirmImage)} alt="Confirm" style={{ marginTop: 10, maxWidth: '100%' }} />}
                </Col>
                <Col span={8}>
                  <div style={{ marginBottom: 8 }}>Ảnh giao dịch nộp phạt (không bắt buộc)</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBillImage(e.target.files[0])}
                  />
                  {billImage && <img src={URL.createObjectURL(confirmImage)} alt="Confirm" style={{ marginTop: 10, maxWidth: '100%' }} />}
                </Col>
              </Row>
            </Spin>
          </Modal>

          {/* REFUND MODAL */}
          <Modal
            open={openRefundModal}
            title={`Hoàn tiền cho đơn hàng: ${selectedShipment?.trackingCode || ''}`}
            onOk={() => {
              createPaymentLink(selectedShipment, 3);
              setOpenRefundModal(false);
            }}
            onCancel={() => setOpenRefundModal(false)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            {selectedShipment && (
              <>
                {selectedShipment?.parcels?.length > 0 ? (
                  <Tabs defaultActiveKey="0">
                    {selectedShipment?.parcels?.map((parcel, index) => (
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
                  Tổng tiền bồi thường: {formatCurrency(selectedShipment.totalRefundedFeeVnd || 0)}
                </div>
              </>
            )}
          </Modal>

          {/* SURCHARGE MODAL */}
          <Modal
            open={openSurchargeModal}
            onOk={() => {
              setOpenTxnModal(true);
              setOpenSurchargeModal(false);
            }}
            onCancel={() => setOpenSurchargeModal(false)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            {selectedShipment ? (
              <div>
                <p>Mã đơn: {selectedShipment.trackingCode}</p>
                <p>Phí tồn kho / phạt: {formatCurrency(selectedShipment.surchargeFeeVnd || 0)}</p>
                {/* Bạn có thể hiển thị thêm thông tin đơn hàng nếu cần */}
              </div>
            ) : (
              <p>Đang tải...</p>
            )}
          </Modal>

          {/* COMPENSATION MODAL */}
          <Modal
            open={openCompensationModal}
            title={`Bồi thường cho đơn hàng: ${selectedShipment?.trackingCode || ''}`}
            onOk={() => {
              setOpenCompensationModal(false);
              setBankAccountModalOpen(true);
            }}
            onCancel={() => setOpenCompensationModal(false)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            {selectedShipment && (
              <>
                <Title level={5}>Danh sách kiện hàng cần bồi thường</Title>
                {selectedShipment?.parcels?.length > 0 ? (
                  <Tabs defaultActiveKey="0">
                    {selectedShipment?.parcels?.filter(parcel => parcel.status === 3 || parcel.status === 4)
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

          {/* BANK ACCOUNT MODAL */}
          <Modal
            open={bankAccountModalOpen}
            onCancel={() => {
              setBankAccountModalOpen(false);
              setBankInfo({
                bankCode: null,
                accountNumber: '',
                accountName: ''
              });
            }}
            onOk={() => {
              createPaymentLink(selectedShipment, 4);
              setBankAccountModalOpen(false);
              setBankInfo({
                bankCode: null,
                accountNumber: '',
                accountName: ''
              });
            }}
            okText="Tạo giao dịch"
            cancelText="Hủy"
            okButtonProps={{
              disabled: !bankInfo.bankCode || !bankInfo.accountNumber || !bankInfo.accountName
            }}
            title={`Nhập thông tin tài khoản nhận bồi thường cho đơn ${selectedShipment?.trackingCode || ''}`}
          >
            <div style={{ marginBottom: '1em' }}>
              <label>Ngân hàng</label>
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="Chọn ngân hàng"
                optionFilterProp="label"
                value={bankInfo.bankCode}
                onChange={(value) => setBankInfo({ ...bankInfo, bankCode: value })}
                options={bankList.map(bank => ({
                  value: bank.code,
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src={bank.logo} alt="logo" style={{ width: 24, height: 24 }} />
                      <span>{bank.shortName}</span>
                    </div>
                  )
                }))}
              />
            </div>
            <div style={{ marginBottom: '1em' }}>
              <label>Số tài khoản</label>
              <Input
                value={bankInfo.accountNumber}
                onChange={e => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                placeholder="Nhập số tài khoản"
              />
            </div>
            <div>
              <label>Tên chủ tài khoản (không dấu, IN HOA)</label>
              <Input
                value={bankInfo.accountName}
                onChange={e => setBankInfo({ ...bankInfo, accountName: e.target.value.toUpperCase() })}
                placeholder="Nhập tên chủ tài khoản"
              />
            </div>
          </Modal>

          {/* SURCHARGE TRANSACTION INFO MODAL */}
          <Modal
            open={openTxnModal}
            title="Tạo giao dịch thu phí tồn kho"
            onCancel={() => {
              setOpenTxnModal(false);
              setTxnInfo({ bankId: null, accountNo: '', amount: '' });
            }}
            onOk={async () => {
              try {
                const imageUrl = await fetchQrByBankAccount(txnInfo.bankId, txnInfo.accountNo, txnInfo.amount);
                setQrImageUrl(imageUrl);
                setOpenTxnModal(false);
                setOpenQrModal(true);
              } catch (err) {
                toast.error("Lỗi tạo mã QR");
              }
            }}
            okText="Tạo QR"
            cancelText="Hủy"
            okButtonProps={{
              disabled: !(txnInfo.bankId && txnInfo.accountNo && txnInfo.amount)
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label>Ngân hàng</label>
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="Chọn ngân hàng"
                optionFilterProp="label"
                value={txnInfo.bankId}
                onChange={value => setTxnInfo({ ...txnInfo, bankId: value })}
                options={bankList.map(bank => ({
                  value: bank.id,
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src={bank.logo} alt="" style={{ width: 24, height: 24 }} />
                      <span>{bank.shortName}</span>
                    </div>
                  )
                }))}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Số tài khoản</label>
              <Input
                value={txnInfo.accountNo}
                onChange={e => setTxnInfo({ ...txnInfo, accountNo: e.target.value })}
                placeholder="Nhập số tài khoản"
              />
            </div>
            <div>
              <label>Số tiền</label>
              <Input
                type="number"
                value={txnInfo.amount}
                onChange={e => setTxnInfo({ ...txnInfo, amount: e.target.value })}
                placeholder="Nhập số tiền"
              />
            </div>
          </Modal>

          {/* SURCHARGE QR MODAL */}
          <Modal
            open={openQrModal}
            title="Mã QR thanh toán"
            footer={[
              <Button key="close" onClick={() => {
                setOpenQrModal(false);
                setTxnInfo({ bankId: null, accountNo: '', amount: '' });
                setQrImageUrl(null);
                setSelectedShipment(null);
              }}>Đóng</Button>
            ]}
            onCancel={() => {
              setOpenQrModal(false);
              setTxnInfo({ bankId: null, accountNo: '', amount: '' });
              setQrImageUrl(null);
              setSelectedShipment(null);
            }}
          >
            {qrImageUrl ? (
              <div style={{ textAlign: 'center' }}>
                <img src={qrImageUrl} alt="QR code" style={{ maxWidth: '100%' }} />
                <p>Khách hàng quét mã QR để thanh toán</p>
              </div>
            ) : (
              <p>Đang tạo mã QR...</p>
            )}
          </Modal>
        </div>
      </div>
    </>
  )
}

export default TrackingOrderStaff
