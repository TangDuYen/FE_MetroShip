import './OrderStaff.scss'
import "dayjs/locale/vi";

import { Button, Card, Col, ConfigProvider, DatePicker, Empty, Flex, Input, Modal, Row, Select, Space, Spin, Table, Tabs, Tag, Typography } from 'antd';
import { ClockCircleOutlined, ReloadOutlined, } from '@ant-design/icons';
import { formatCurrency, shipmentStatusColorMap, shipmentStatusMap, staffRoleMap } from '../../../../../constants/statusMap';
import { getAllParcelCategories, getAllParcels, getAllStations, getMetroLines, getMetroTimeSlots, getShipmentByStaffStation } from '../../../../../config/metroApi';
import { useEffect, useState } from 'react';

import { PATH_NAME } from '../../../../../constants/pathname';
import StaffIcon from '../../../../../assets/profile.webp';
import api from './../../../../../config/axios';
import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import viVN from 'antd/lib/locale/vi_VN';

dayjs.locale('vi');
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const customizeRenderEmpty = () => (
  <Empty
    image={Empty.PRESENTED_IMAGE_DEFAULT}
    description="Không có dữ liệu"
  />
);

const { Title } = Typography;

function OrderStaff() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [shipmentsStaff, setShipmentsStaff] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [stations, setStations] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [parcelMap, setParcelMap] = useState(new Map());
  const [metroLines, setMetroLine] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyImageMain, setVerifyImageMain] = useState(null); // bắt buộc
  const [verifyImageOptional, setVerifyImageOptional] = useState(null); // optional
  const [shipmentBeingVerified, setShipmentBeingVerified] = useState(null);
  const [shipmentRejected, setShipmentRejected] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const decodedUser = token ? jwtDecode(token) : null;
  const staffAssignments = JSON.parse(localStorage.getItem("staffAssignments") || "[]");
  const [dateRange, setDateRange] = useState([]);
  const [searchCode, setSearchCode] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [parcelCate, setParcelCate] = useState([]);
  const ALLOWED_STATUS = [0, 7];
  const navigate = useNavigate();

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
    Promise.all([getAllParcels(), getMetroTimeSlots(), getAllStations(), getMetroLines(), getAllParcelCategories()]).then(
      ([parcelsData, timeSlotsData, stationData, metroLineData, parcelCateData]) => {
        setMetroLine(metroLineData)
        setStations(stationData);
        setParcels(parcelsData);
        setTimeSlots(timeSlotsData);
        setParcelCate(parcelCateData);
      }
    );
  }, []);

  const reloadShipments = async () => {
    try {
      const data = await getShipmentByStaffStation(decodedUser.StationId);
      setShipmentsStaff(data);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải lại danh sách đơn hàng");
    }
  };
  useEffect(() => {
    getShipmentByStaffStation(decodedUser.StationId).then((data) => {
      setShipmentsStaff(data);
    });
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
    let filtered = shipmentsStaff.filter(o => ALLOWED_STATUS.includes(o.shipmentStatus));

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

    if (searchCode && searchCode.trim() !== '') {
      const searchLower = searchCode.trim().toLowerCase();
      filtered = filtered.filter(order =>
        order.trackingCode.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== null && statusFilter !== undefined) {
      filtered = filtered.filter(o => o.shipmentStatus === Number(statusFilter));
    }
    setFilteredShipments(filtered);
  };

  useEffect(() => {
    handleFilterChange();
  }, [shipmentsStaff, dateFilter, dateRange, searchCode, statusFilter]);

  useEffect(() => {
    const opts = ALLOWED_STATUS.map(id => ({
      id,
      label: shipmentStatusMap[id] || `Trạng thái ${id}`,
      color: shipmentStatusColorMap[id] || 'default',
    }));
    setStatusOptions(opts);
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
    // {
    //   title: 'Bắt đầu nhận hàng',
    //   dataIndex: 'startReceiveAt',
    //   key: 'startReceiveAt',
    //   render: (_, record) => {
    //     if (record.startReceiveAt) {
    //       return dayjs(record.startReceiveAt).format('HH:mm');
    //     } else {
    //       return <Tag color='red'> Không xác định </Tag>
    //     }
    //   }
    // },
    {
      title: 'Hạn chót gửi hàng',
      dataIndex: 'scheduledDateTime',
      key: 'scheduledTime',
      render: (_, record) => dayjs(record.scheduledDateTime).format('HH:mm'),
    },
    {
      title: 'Thời điểm tạo yêu cầu',
      key: 'createdAt',
      render: (_, record) =>
        dayjs(record.createdAt).format("YYYY-MM-DD HH:mm:ss"),
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
      render: (status) => (
        <Tag color={shipmentStatusColorMap[status] || "default"}>
          {shipmentStatusMap[status] || 'Không xác nhận'}
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
      title: 'Xác nhận',
      key: 'confirm',
      render: (_, record) => {
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
              onClick={() => {
                setShipmentBeingVerified(record);
                setVerifyModalOpen(true);
              }}
            >
              Xác nhận
            </Button>
          </ConfigProvider>
        );
      }
    },
    {
      title: 'Từ chối',
      key: 'action',
      render: (_, record) => {
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
                setShipmentRejected(record);
                setRejectModalOpen(true);
              }}
            >
              Từ chối
            </Button>
          </ConfigProvider>
        );
      }
    },
  ];

  // const onRowClick = (record) => {
  //   const relatedParcels = getParcelsByShipmentId(record.id);
  //   setSelectedOrder({ ...record, relatedParcels });
  //   setModalOpen(true);
  // };

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
        <div className="metro-info">
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
                  defaultValue={moment()}
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
                  <Select placeholder="Trạng thái"
                    style={{ width: 350 }}
                    allowClear
                    value={statusFilter}
                    onChange={setStatusFilter}>
                    {statusOptions.map((s) => (
                      <Option key={s.id} value={s.id}>
                        <Tag color={shipmentStatusColorMap[s.id]}>
                          {shipmentStatusMap[s.id]}
                        </Tag>
                      </Option>
                    ))}
                  </Select>
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
                              value:
                                parcel.parcelCategory?.categoryName ||
                                (parcelCate.find(c => c.id === parcel.parcelCategoryId)?.categoryName) ||
                                'N/A',
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
                              label: 'Hạn chót nhận hàng lúc',
                              value: dayjs(selectedOrder.scheduledDateTime).format('HH:mm') || 'N/A',
                            },
                            {
                              key: 'createdAt',
                              label: 'Thời điểm tạo yêu cầu',
                              value: dayjs(selectedOrder.createdAt).format('YYYY-MM-DD HH:mm:ss') || 'N/A',
                            },
                            {
                              key: 'totalCost',
                              label: 'Tổng chi phí',
                              value: formatCurrency(parcel.priceVnd || 0),
                            },
                            {
                              key: 'parcelStatus',
                              label: 'Trạng thái kiện hàng',
                              value: shipmentStatusMap[selectedOrder.shipmentStatus] || 'Không xác nhận',
                            }
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
            <Modal
              title={'Từ chối đơn hàng'}
              open={rejectModalOpen}
              onCancel={() => {
                setRejectModalOpen(false);
                setRejectReason("");
              }}
              onOk={async () => {
                if (!rejectReason.trim()) {
                  toast.error("Vui lòng nhập lý do từ chối!");
                  setLoading(false);
                  return;
                }
                setLoading(true);
                try {
                  const payload = {
                    shipmentId: shipmentRejected?.id,
                    reason: rejectReason,
                  };
                  await api.post("/shipments/staff/reject-confirmation", payload);
                  toast.success('Đã từ chối đơn hàng thành công!');
                  setLoading(false);
                  setRejectModalOpen(false);
                  setRejectReason("");
                  await reloadShipments();
                } catch (err) {
                  setLoading(false);
                  const errorMessage = err.resposne?.data?.message || "Không thể từ chối kiện hàng";
                  toast.error(errorMessage);
                }
              }}
              okText="Xác nhận"
              cancelText="Huỷ"
            >
              <Spin spinning={loading} tip="Đang từ chối đơn hàng" size="large">
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
              </Spin>
            </Modal>
            <Modal
              title={`Upload ảnh xác minh cho đơn hàng`}
              open={verifyModalOpen}
              onCancel={() => {
                setVerifyModalOpen(false);
                setVerifyImageMain(null);
                setVerifyImageOptional(null);
                setShipmentBeingVerified(null);
              }}
              onOk={async () => {
                if (!verifyImageMain) {
                  toast.error("Vui lòng chọn ảnh bắt buộc!");
                  return;
                }

                setLoading(true);
                try {
                  //MAIN IMAGE UPLOAD
                  const formDataMain = new FormData();
                  formDataMain.append("file", verifyImageMain);
                  const uploadMainRes = await api.post("/media/image", formDataMain, {
                    headers: { "Content-Type": "multipart/form-data" }
                  });
                  const mainImageUrl = uploadMainRes.data?.data || uploadMainRes.data?.secure_url;

                  if (!mainImageUrl) {
                    toast.error("Không lấy được link ảnh bắt buộc sau khi upload.");
                    setLoading(false);
                    return;
                  }
                  //OPTIONAL IMAGE UPLOAD
                  let optionalImageUrl = null;
                  if (verifyImageOptional) {
                    const formDataOptional = new FormData();
                    formDataOptional.append("file", verifyImageOptional);
                    const uploadOptionalRes = await api.post("/media/image", formDataOptional, {
                      headers: { "Content-Type": "multipart/form-data" }
                    });
                    optionalImageUrl = uploadOptionalRes.data?.data || uploadOptionalRes.data?.secure_url;
                  }

                  const medias = [
                    {
                      mediaUrl: mainImageUrl,
                      description: "Ảnh bắt buộc"
                    }
                  ];

                  if (optionalImageUrl) {
                    medias.push({
                      mediaUrl: optionalImageUrl,
                      description: "Ảnh phụ (hàng bảo hiểm)"
                    });
                  }

                  await api.post("/shipments/staff/pickup-confirmation", {
                    shipmentId: shipmentBeingVerified?.id,
                    pickedUpMedias: medias
                  });

                  toast.success("Xác minh đơn hàng thành công!");
                  setLoading(false);
                  setVerifyModalOpen(false);
                  setVerifyImageMain(null);
                  setVerifyImageOptional(null);
                  setShipmentBeingVerified(null);
                  await reloadShipments();
                } catch (error) {
                  setLoading(false);
                  const errorMessage = error.response?.data?.message || "Lỗi không xác định";
                  console.error("Lỗi khi xác minh:", error);
                  toast.error(errorMessage);
                }
              }}
              okText="Xác nhận"
              cancelText="Huỷ"
            >
              <Spin spinning={loading} tip="Đang xác nhận đơn hàng" size="large">
                <div style={{ marginBottom: "1em", display: "flex", flexDirection: "column" }}>
                  <label style={{ marginBottom: "0.5em" }}>
                    <strong>Ảnh xác minh</strong>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setVerifyImageMain(e.target.files[0])}
                  />
                  {verifyImageMain && (
                    <div style={{ marginTop: 10 }}>
                      <img
                        src={URL.createObjectURL(verifyImageMain)}
                        alt="preview-main"
                        style={{ maxWidth: "100%", maxHeight: 200 }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "1em", display: "flex", flexDirection: "column" }}>
                  <label style={{ marginBottom: "0.5em" }}>
                    <strong>Ảnh hàng bắt buộc bảo hiểm (không bắt buộc):</strong>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setVerifyImageOptional(e.target.files[0])}
                  />
                  {verifyImageOptional && (
                    <div style={{ marginTop: 10 }}>
                      <img
                        src={URL.createObjectURL(verifyImageOptional)}
                        alt="preview-optional"
                        style={{ maxWidth: "100%", maxHeight: 200 }}
                      />
                    </div>
                  )}
                </div>
              </Spin>
            </Modal>

          </Card>
        </div>
      </div>
    </>
  );
}

export default OrderStaff;
