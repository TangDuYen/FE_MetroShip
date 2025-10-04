import {
  Button,
  Card,
  ConfigProvider,
  Empty,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";
import "./HistoryTicket.scss";
import Sidebar from "../../components/sidebar_profile/Sidebar";
import { getAllShipments, getAllSupportTickets } from "../../config/metroApi";
import dayjs from "dayjs";
import {
  supportTicketStatus,
  supportTicketStatusColorMap,
  supportTypeColorMap,
  supportTypeMap,
} from "../../constants/statusMap";
import { ReloadOutlined } from "@ant-design/icons";

const { Option } = Select;
function HistoryTicket() {
  const [tickets, setTickets] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterType, setFilterType] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { items: ticketItems } = await getAllSupportTickets();
      const { items: shipmentItems } = await getAllShipments();

      // map thêm trackingCode từ shipment
      const merged = ticketItems.map((t) => {
        const shipment = shipmentItems.find((s) => s.id === t.shipmentId);
        return { ...t, trackingCode: shipment?.trackingCode || "N/A" };
      });

      setTickets(merged);
      setFilteredTickets(merged);
      setShipments(shipmentItems);
    } catch (err) {
      console.error("Fetch data failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    if (searchCode) {
      filtered = filtered.filter((t) =>
        t.trackingCode.toLowerCase().includes(searchCode.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    if (filterType) {
      filtered = filtered.filter((t) => t.supportType === filterType);
    }

    setFilteredTickets(filtered);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, searchCode, filterStatus, filterType]);

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "trackingCode",
    },
    // {
    //   title: "Chủ đề",
    //   dataIndex: "subject",
    // },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
    {
      title: "Loại yêu cầu",
      dataIndex: "supportType",
      render: (type) => (
        <Tag color={supportTypeColorMap[type]}>{supportTypeMap[type]}</Tag>
      ),
    },

    {
      title: "Ngày mở",
      dataIndex: "openedAt",
      render: (val) => dayjs(val).format("HH:mm DD/MM/YYYY"),
    },
    {
      title: "Ngày đóng",
      dataIndex: "closedAt",
      render: (val) =>
        val ? dayjs(val).format("HH:mm DD/MM/YYYY") : "Chưa đóng",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={supportTicketStatusColorMap[status]}>
          {supportTicketStatus[status]}
        </Tag>
      ),
    },
  ];
  return (
    <div className="history-ticket">
      <section className="history-ticket-wrapper">
        <div className="history-ticket-row">
          <div className="history-ticket-left">
            <Sidebar />
          </div>
          <div className="history-ticket-right">
            <Card title="DANH SÁCH YÊU CẦU ĐÃ GỬI" bordered={false}>
              <Space style={{ marginBottom: 16 }}>
                <Input.Search
                  placeholder="Tìm mã đơn hàng"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  style={{ width: 250 }}
                />
                <Select
                  placeholder="Loại yêu cầu"
                  allowClear
                  value={filterType}
                  onChange={(val) => setFilterType(val)}
                  style={{ width: 220 }}
                >
                  {Object.entries(supportTypeMap).map(([key, label]) => (
                    <Option key={key} value={Number(key)}>
                      <Tag color={supportTypeColorMap[key]}>{label}</Tag>
                    </Option>
                  ))}
                </Select>
                <Select
                  placeholder="Trạng thái"
                  allowClear
                  value={filterStatus}
                  onChange={(val) => setFilterStatus(val)}
                  style={{ width: 200 }}
                >
                  {Object.entries(supportTicketStatus).map(([key, label]) => (
                    <Option key={key} value={Number(key)}>
                      <Tag color={supportTicketStatusColorMap[key]}>
                        {label}
                      </Tag>
                    </Option>
                  ))}
                </Select>
                <Button
                  className="clear-filter-button"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setSearchCode("");
                    setFilterStatus(null);
                    setFilterType(null);
                  }}
                ></Button>
              </Space>
              <Spin spinning={loading} tip="Đang tải dữ liệu...">
                <ConfigProvider
                  renderEmpty={() => (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_DEFAULT}
                      description="Không có dữ liệu"
                    />
                  )}
                >
                  <Table
                    columns={columns}
                    dataSource={filteredTickets}
                    pagination={{ pageSize: 10 }}
                    bordered
                  />
                </ConfigProvider>
              </Spin>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HistoryTicket;
