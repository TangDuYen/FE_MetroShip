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
import React, { useEffect, useState } from "react";
import {
  shipmentStatusColorMap,
  shipmentStatusMap,
} from "../../constants/statusMap";

import { Link } from "react-router-dom";
import { PATH_NAME } from "../../constants/pathname";
import { SearchOutlined } from "@ant-design/icons";
import Sidebar from "../../components/sidebar_profile/Sidebar";
import api from "../../config/axios";
import dayjs from "dayjs";
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
  const [feedbackShipmentId, setFeedbackShipmentId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parcelsRes, shipmentsRes] = await Promise.all([
          api.get("parcels?PageSize=1000"),
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

        // Gộp thành danh sách đơn hàng
        const convertedOrders = Object.entries(groupedByShipment).map(
          ([shipmentId, parcels], index) => {
            const shipmentInfo = shipmentMap.get(shipmentId) || {};

            const totalWeight = parcels.reduce(
              (sum, p) => sum + (p.chargeableWeightKg || 0),
              0
            );

            const totalVolume = parcels.reduce(
              (sum, p) => sum + (p.volumeCm3 || 0),
              0
            );

            return {
              id: index + 1,
              shipmentId,
              code: shipmentInfo.trackingCode || "N/A",
              name: parcels[0].parcelCategory?.categoryName || "Chưa rõ",
              weight: totalWeight,
              volume: totalVolume,
              price: shipmentInfo.totalCost || 0,
              deliveryDate: shipmentInfo.date || null,
              shipmentStatus: shipmentInfo.status,
              bookedAt: shipmentInfo.bookedAt,
            };
          }
        );

        setOrders(
          convertedOrders.sort(
            (a, b) => new Date(b.bookedAt) - new Date(a.bookedAt)
          )
        );
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();
  }, []);

  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns = {};
      orders.forEach((order) => {
        if (order.shipmentStatus === 0 && order.bookedAt) {
          const expireTime =
            new Date(order.bookedAt).getTime() + 15 * 60 * 1000;
          const diff = expireTime - Date.now();
          if (diff > 0) {
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            newCountdowns[order.shipmentId] = `${minutes}:${seconds
              .toString()
              .padStart(2, "0")}`;
          } else {
            newCountdowns[order.shipmentId] = "Hết hạn";
          }
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  const handlePayment = async (shipmentId) => {
    try {
      const payload = {
        shipmentId,
        returnUrl: "http://localhost:5173/payment-success",
        cancelUrl: "http://localhost:5173/payment-fail",
      };

      const res = await api.post("/shipments/vnpay/payment-url", payload);
      console.log(res.data);

      // statusCode nằm trực tiếp trong res.data
      if (res.data?.statusCode === 200 && res.data.data) {
        window.location.href = res.data.data; // Redirect to VNPay
      } else {
        toast.error("Không lấy được link thanh toán!");
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

  const displayedGoods = filteredGoods.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      dataIndex: "code",
      key: "code",
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
      render: (price) => price.toLocaleString("vi-VN", { maximumFractionDigits: 0 }),
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
      render: () => (
        <Link to="/tracking-order">
          <Button type="link">Chi tiết</Button>
        </Link>
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
    key: "action",
    render: (_, item) => {
      const countdown = countdowns[item.shipmentId];
      const isExpired = countdown === "Hết hạn";
      return item.shipmentStatus === 0 ? (
        <Button
          type="primary"
          disabled={isExpired}
          onClick={() => handlePayment(item)}
        >
          {isExpired
            ? "Hết hạn"
            : `Thanh toán ${countdown ? `(${countdown})` : ""}`}
        </Button>
      ) : (
        "-"
      );
    },
  });
  columns.push({
    title: "Hành động",
    key: "action",
    render: (_, item) => {
      const isRated = item.shipmentStatus === 18;
      return item.shipmentStatus === 17 ? (
        <Button
          type="primary"
          className="feedback-button"
          onClick={() => handleFeedback(item.shipmentId)}
        >
          {isRated
            ? "Xem lại đánh giá"
            : "Đánh giá"}
        </Button>
      ) : (
        "-"
      );
    },
  });

  const totalPages = Math.ceil(filteredGoods.length / itemsPerPage);
  // const hasPayment = displayedGoods.some((item) => item.status === 3);

  const handleNextWindow = () => {
    const newStart = Math.min(
      pageWindowStart + 1,
      totalPages - pageWindowSize + 1
    );
    setPageWindowStart(newStart);
    setCurrentPage(newStart);
  };

  const handlePrevWindow = () => {
    const newStart = Math.max(pageWindowStart - 1, 1);
    setPageWindowStart(newStart);
    setCurrentPage(newStart);
  };


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

              {/* <div className="history-pagination">
                <Pagination
                  total={filteredGoods.length}
                  pageSize={itemsPerPage}
                  current={currentPage}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                />
              </div> */}

            </Card>

            {/* PHÂN TRANG */}
            {/* {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={handlePrevWindow}
                  disabled={pageWindowStart === 1}
                >
                  «
                </button>
                {paginationButtons}
                <button
                  onClick={handleNextWindow}
                  disabled={
                    pageWindowStart + pageWindowSize - 1 >= totalPages
                  }
                >
                </button>
              </div>
            )} */}
          </div>
        </div>
      </section>
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
    </div>
  );
}

export default HistoryOrders;
