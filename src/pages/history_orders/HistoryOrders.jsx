import "./HistoryOrders.scss";

import {
  Button,
  Card,
  DatePicker,
  Input,
  Modal,
  Pagination,
  Rate,
  Select,
  Space,
  Spin,
  Table,
  Tag
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  formatCurrency1,
  shipmentStatusColorMap,
  shipmentStatusMap,
} from "../../constants/statusMap";

import { PATH_NAME } from "../../constants/pathname";
import { SearchOutlined } from "@ant-design/icons";
import Sidebar from "../../components/sidebar_profile/Sidebar";
import api from "../../config/axios";
import dayjs from "dayjs";
import { getAllTransactionTypes } from "../../config/metroApi";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { max } from "moment/moment";
import { toast } from "react-toastify";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;
const { Option } = Select;
function HistoryOrders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [feedbackShipmentId, setFeedbackShipmentId] = useState(null);
  const [rating, setRating] = useState(0);
  const [rejectReason, setRejectReason] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  const [rejectShipmentId, setRejectShipmentId] = useState(null);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [transactionTypeId, setTransactionTypeId] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parcelsRes, shipmentsRes] = await Promise.all([
          api.get("/parcels?PageSize=1000"),
          api.get("/shipments/customer/history?PageSize=1000"),
        ]);

        const parcelItems = parcelsRes.data?.data?.items || [];
        const shipmentItems = shipmentsRes.data?.data?.items || [];

        const shipmentMap = new Map(
          shipmentItems.map((item) => [
            item.id,
            {
              // date: item.scheduledDateTime
              //   ? new Date(item.scheduledDateTime).toLocaleDateString("vi-VN")
              //   : "",
              date: item.scheduledDateTime || null,
              status: item.shipmentStatus,
              bookedAt: item.bookedAt,
              totalCost: item.totalCostVnd || 0,
              trackingCode: item.trackingCode,
              rating: item.rating || 0,
            },
          ])
        );

        // Gom tất cả parcels theo shipmentId
        const groupedByShipment = parcelItems.reduce((acc, parcel) => {
          const { shipmentId } = parcel;
          if (!acc[shipmentId]) acc[shipmentId] = [];
          acc[shipmentId].push(parcel);
          return acc;
        }, {});

        const sortedShipmentItems = [...shipmentItems].sort(
          (a, b) => new Date(b.scheduledDateTime) - new Date(a.scheduledDateTime)
        );

        // Gộp thành danh sách đơn hàng
        const convertedOrders = sortedShipmentItems.map((shipment, index) => {
          const parcels = groupedByShipment[shipment.id] || [];
          const totalWeight = parcels.reduce((sum, p) => sum + (p.chargeableWeightKg || 0), 0);
          const totalVolume = parcels.reduce((sum, p) => sum + (p.volumeCm3 || 0), 0);

          return {
            id: index + 1,
            shipmentId: shipment.id,
            trackingCode: shipment.trackingCode || "N/A",
            name: parcels[0]?.parcelCategory?.categoryName || "Chưa rõ",
            weight: totalWeight,
            volume: totalVolume,
            price: shipment.totalCostVnd || 0,
            deliveryDate: shipment.scheduledDateTime || null,
            shipmentStatus: shipment.shipmentStatus,
            bookedAt: shipment.bookedAt,
            rating: shipment.rating || 0,
          };
        });

        // setOrders(
        //   convertedOrders.sort(
        //     (a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate)
        //   )
        // );

        setOrders(convertedOrders);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();
  }, []);

  // const [countdowns, setCountdowns] = useState({});

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const newCountdowns = {};
  //     orders.forEach((order) => {
  //       if (order.shipmentStatus === 0 && order.bookedAt) {
  //         const expireTime =
  //           new Date(order.bookedAt).getTime() + 15 * 60 * 1000;
  //         const diff = expireTime - Date.now();
  //         if (diff > 0) {
  //           const minutes = Math.floor((diff / 1000 / 60) % 60);
  //           const seconds = Math.floor((diff / 1000) % 60);
  //           newCountdowns[order.shipmentId] = `${minutes}:${seconds
  //             .toString()
  //             .padStart(2, "0")}`;
  //         } else {
  //           newCountdowns[order.shipmentId] = "Hết hạn";
  //         }
  //       }
  //     });
  //     setCountdowns(newCountdowns);
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [orders]);
  
  useEffect(() => {
    async function fetchTransactionTypes() {
      try {
        const res = await getAllTransactionTypes();
        if (res?.statusCode === 200) {
          setTransactionTypes(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy transaction types:", error);
      }
    }
    fetchTransactionTypes();
  }, []);

  const handlePayment = async (shipmentId) => {
    try {
      const currentDomain = window.location.origin;
      const shipmentCostType = transactionTypes.find(t => t.value === "ShipmentCost");
      setTransactionTypeId(shipmentCostType.id);
      const paymentPayload = {
        shipmentId: shipmentId,
        transactionType: shipmentCostType.id,
        returnUrl: `${currentDomain}/payment-success`,
        cancelUrl: `${currentDomain}/payment-fail`,
      };

      const res = await api.post("/shipments/vnpay/payment-url", paymentPayload);
      console.log(res.data);

      // statusCode nằm trực tiếp trong res.data
      if (res.data?.statusCode === 200 && res.data.data) {
        window.location.href = res.data.data; // Redirect to VNPay
      } else {
        toast.error("Không lấy được link thanh toán!");
        console.log(paymentPayload);
        
      }
    } catch (err) {
      console.error("Lỗi khi thanh toán:", err);
      toast.error("Đã xảy ra lỗi khi tạo liên kết thanh toán.");
    }
  };
  const handleFeedback = async (shipmentId) => {
    setFeedbackShipmentId(shipmentId);
    setIsFeedbackModalOpen(true);
  };
  const handleCancelShipment = async (shipmentId) => {
    setRejectShipmentId(shipmentId);
    setIsRejectModalOpen(true);
  };
  const handleSubmitFeedback = async () => {
    try {
      const payload = {
        shipmentId: feedbackShipmentId,
        feedback: comment,
        rating: rating,
      };

      const res = await api.post("/shipments/feedback", payload);

      if (res.data?.statusCode === 200) {
        toast.success("Đánh giá đã được gửi!");
      } else {
        toast.error("Không thể gửi đánh giá. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err);
      toast.error("Đã xảy ra lỗi khi gửi đánh giá.");
    } finally {
      setIsFeedbackModalOpen(false);
      setRating(0);
      setComment('');
    }
  };

  // const handleReorder = (shipmentId) => {
  //   toast.success("Đặt lại đơn hàng thành công!");
  //   console.log("Reorder shipment", shipmentId);
  // };

  const handleSubmitCancelShipment = async () => {
    try {
      const payload = {
        shipmentId: rejectShipmentId,
        reason: rejectReason,
      };

      const res = await api.post("/shipments/cancel", payload);

      if (res.data?.statusCode === 200) {
        toast.success("Hủy đơn thành công!");
      } else {
        toast.error("Không thể hủy đơn. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Lỗi gửi yêu cầu hủy đơn:", err);
      toast.error("Đã xảy ra lỗi khi hủy đơn.");
    } finally {
      setIsRejectModalOpen(false);
      setRejectReason('');
    }
  }

  const handleRequestReturn = (shipmentId) => {
    toast.success("Yêu cầu hoàn đơn thành công!");
    console.log("Refund shipment", shipmentId);
  }

  const filteredGoods = orders.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === "all" ||
      item.shipmentStatus === parseInt(filterStatus, 10);

    const matchDateRange =
      (!startDate ||
        dayjs(item.deliveryDate).isSameOrAfter(startDate, "day")) &&
      (!endDate || dayjs(item.deliveryDate).isSameOrBefore(endDate, "day"));

    return matchSearch && matchStatus && matchDateRange;
  });

  const getParcelsByShipmentId = (shipmentId) => {
    return orders.filter(parcel => parcel.shipmentId === shipmentId);
  };
  const onRowClick = (record) => {
    const relatedParcels = getParcelsByShipmentId(record.id);
    setSelectedOrder({ ...record, relatedParcels });
    navigate(
      PATH_NAME.TRACKING_ORDER.replace(
        ":trackingCode",
        record.trackingCode
      )
    );
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => (currentPage - 1) * itemsPerPage + index + 1,
      width: 60,
    },
    {
      title: "Mã vận đơn",
      dataIndex: "trackingCode",
      key: "trackingCode",
    },
    {
      title: "Tổng trọng lượng (kg)",
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: "Tổng chi phí (VND)",
      dataIndex: "price",
      key: "price",
      render: (price) => formatCurrency1(price),
    },
    {
      title: "Tổng thể tích (cm³)",
      dataIndex: "volume",
      key: "volume",
    },
    {
      title: "Ngày gửi hàng",
      dataIndex: "deliveryDate",
      key: "deliveryDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Chi tiết",
      key: "detail",
      render: (_, record) => (
        <Button type="link" onClick={() => onRowClick(record)}>Chi tiết</Button>
      ),
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
  ];

  columns.push({
    title: "Hành động",
    key: "actions",
    render: (_, item) => {
      const actions = [];
      const hasRated = typeof item.rating === "number" && item.rating > 0;

      //PAY SHIPMENT
      if (item.shipmentStatus === 0) {
        actions.push(
          <Button
            type="primary"
            onClick={() => handlePayment(item.shipmentId)}
          >
            Thanh toán
          </Button>
        );

        //CANCEL SHIPMENT - NOT PAY YET
        actions.push(
          <Button
            danger
            onClick={() => handleCancelShipment(item.shipmentId)}
          >
            Hủy
          </Button>
        );
      }

      //CANCEL SHIPMENT - HAS PAID
      if (
        [7].includes(item.shipmentStatus)
      ) {
        actions.push(
          <Button
            danger
            onClick={() => handleCancelShipment(item.shipmentId)}
          >
            Hủy
          </Button>
        );
      }

      //FEEDBACK SHIPMENT
      if (item.shipmentStatus === 20 && !hasRated) {
        actions.push(
          <Button
            type="primary"
            onClick={() => handleFeedback(item.shipmentId)}
          >
            Đánh giá
          </Button>
        );
      }

      //RE-ORDER SHIPMENT
      // if (item.shipmentStatus === 20 && hasRated) {
      //   actions.push(
      //     <Button
      //       onClick={() => handleReorder(item.shipmentId)}
      //     >
      //       Đặt lại
      //     </Button>
      //   );
      // }

      //REFUND SHIPMENT
      if (item.shipmentStatus === 15) {
        actions.push(
          <Button
            danger
            onClick={() => handleRequestReturn(item.shipmentId)}
          >
            Yêu cầu hoàn đơn
          </Button>
        );
      }

      return <Space>{actions}</Space>;
    },
  });

  return (
    <div className="history-order">
      <section className="history-order-wrapper">
        <div className="history-order-row">
          <div className="history-order-left">
            <Sidebar />
          </div>
          <div className="history-order-right">
            <Card title="THÔNG TIN TÀI KHOẢN" bordered={false}>
              <Space style={{ marginBottom: 16 }}>
                <Input
                  placeholder="Nhập mã hàng hóa, tên hàng hóa"
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: 300 }}
                />
                <Select
                  value={filterStatus}
                  onChange={(value) => setFilterStatus(value)}
                  style={{ width: 200 }}
                >
                  <Option value="all">Tất cả trạng thái</Option>
                  {Object.entries(shipmentStatusMap).map(([value, label]) => (
                    <Option key={value} value={value}>
                      {label}
                    </Option>
                  ))}
                </Select>
                <RangePicker
                  format="DD/MM/YYYY"
                  placeholder={["Từ ngày", "Đến ngày"]}
                  onChange={(dates) => {
                    setStartDate(dates?.[0] || null);
                    setEndDate(dates?.[1] || null);
                  }}
                  style={{ width: 300 }}
                />
              </Space>
              <Spin spinning={loading} tip="Đang tải dữ liệu...">
                <Table
                  columns={columns}
                  dataSource={filteredGoods}
                  pagination={{ pageSize: 10 }}
                  bordered
                  locale={{
                    emptyText: "Không có bản ghi nào",
                  }}
                />
              </Spin>
            </Card>
          </div>
        </div>
      </section>

      {/* FEEDBACK MODAL */}
      <Modal
        title="Đánh giá đơn hàng"
        open={isFeedbackModalOpen}
        onOk={handleSubmitFeedback}
        onCancel={() => setIsFeedbackModalOpen(false)}
        okText="Gửi đánh giá"
        cancelText="Hủy"
      >
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <Rate value={rating} onChange={setRating} style={{ fontSize: 36 }} />
        </div>
        <div>
          <Input.TextArea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Nhập nhận xét của bạn về đơn hàng..."
          />
        </div>
      </Modal>

      {/* CANCEL MODAL */}
      <Modal
        title="Lý do hủy đơn"
        open={isRejectModalOpen}
        onOk={handleSubmitCancelShipment}
        onCancel={() => setIsRejectModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div>
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Lý do hủy đơn hàng"
          />
        </div>
      </Modal>
    </div>
  );
}

export default HistoryOrders;
