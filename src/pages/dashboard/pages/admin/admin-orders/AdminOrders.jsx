import "./AdminOrders.scss";

import {
  Button,
  ConfigProvider,
  DatePicker,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
} from "antd";
import {
  formatCurrency,
  shipmentStatusColorMap,
  shipmentStatusMap,
} from "../../../../../constants/statusMap";
import {
  getAllParcels,
  getAllRegions,
  getAllShipments,
  getAllStations,
  getMetroLines,
  getMetroTimeSlots,
} from "../../../../../config/metroApi";
import { useEffect, useMemo, useState } from "react";

import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

function AdminOrders() {
  const [shipments, setShipments] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [parcels, setParcels] = useState([]);
  const [stations, setStations] = useState([]);
  const [metroLines, setMetroLines] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [arena, setArrena] = useState([]);

  //FILTER STATE
  const [statusFilter, setStatusFilter] = useState(null);
  // const [stationFilter, setStationFilter] = useState(null);
  // const [lineFilter, setLineFilter] = useState(null);
  // const [areaFilter, setAreaFilter] = useState(null);
  const [sendDateRange, setSendDateRange] = useState([]);
  // const [timeSlotFilter, setTimeSlotFilter] = useState(null);
  const [searchCode, setSearchCode] = useState("");
  const [departureSearch, setDepartureSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAllShipments(),
      getAllParcels(),
      getMetroTimeSlots(),
      getAllStations(),
      getMetroLines(),
      getAllRegions(),
    ])
      .then(
        ([
          shipmentsData,
          parcelsData,
          timeSlotsData,
          stationData,
          metroLineData,
          regionsData,
        ]) => {
          setShipments(shipmentsData.items || []);
          setStatusOptions(shipmentsData.additionalData || []);
          setParcels(parcelsData || []);
          setTimeSlots(timeSlotsData || []);
          setStations(stationData || []);
          setMetroLines(metroLineData || []);
          setArrena(regionsData || []);
        }
      )
      .catch((err) => console.error("Lỗi khi load dữ liệu:", err))
      .finally(() => setLoading(false));
  }, []);

  // const uniqueStations = useMemo(
  //   () => [...new Set(stations.map((s) => s.stationNameVi))],
  //   [stations]
  // );

  //FILTER APPLY
  const filteredData = useMemo(() => {
    return shipments.filter((item) => {
      let match = true;

      //STATUS FILTER
      if (
        statusFilter?.length > 0 &&
        !statusFilter.includes(item.shipmentStatus)
      ) {
        match = false;
      }

      //STATION FILTER
      // if (stationFilter && item.departureStationName !== stationFilter)
      //   match = false;

      // SEARCH TRẠM GỬI
      if (
        departureSearch &&
        !(item.departureStationName || "")
          ?.toLowerCase()
          .includes(departureSearch.toLowerCase())
      ) {
        match = false;
      }

      // SEARCH TRẠM NHẬN
      if (
        destinationSearch &&
        !(item.destinationStationName || "")
          ?.toLowerCase()
          .includes(destinationSearch.toLowerCase())
      ) {
        match = false;
      }

      //METRO LINE FILTER
      // if (lineFilter && item.metroLineId !== lineFilter) match = false;

      //REGIONS FILTER
      // if (areaFilter && item.regionId !== areaFilter) match = false;

      // FILTER ngày gửi
      if (sendDateRange.length === 2) {
        const [start, end] = sendDateRange;
        const sendDate = dayjs(item.scheduledDateTime);

        if (
          !sendDate.isValid() ||
          !sendDate.isBetween(
            start.startOf("day"),
            end.endOf("day"),
            null,
            "[]"
          )
        ) {
          match = false;
        }
      }

      //TIME SLOT FILTER
      // if (timeSlotFilter) {
      //   const slot = timeSlots.find((ts) => ts.id === timeSlotFilter);
      //   if (slot) {
      //     const orderTime = dayjs(item.scheduledDateTime);
      //     const open = dayjs(
      //       orderTime.format("YYYY-MM-DD") + " " + slot.openTime
      //     );
      //     let close = dayjs(
      //       orderTime.format("YYYY-MM-DD") + " " + slot.closeTime
      //     );

      //     //LAST SHIFT
      //     if (close.isBefore(open)) {
      //       close = close.add(1, "day");
      //     }

      //     if (
      //       !(orderTime.isSameOrAfter(open) && orderTime.isSameOrBefore(close))
      //     ) {
      //       match = false;
      //     }
      //   }
      // }

      //TRACKING CODE FILTER
      if (
        searchCode &&
        !item.trackingCode.toLowerCase().includes(searchCode.toLowerCase())
      ) {
        match = false;
      }

      return match;
    });
  }, [
    shipments,
    statusFilter,
    sendDateRange,
    searchCode,
    timeSlots,
    departureSearch,
    destinationSearch,
  ]);

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
    {
      title: "Trạm gửi",
      dataIndex: "departureStationName",
    },
    {
      title: "Trạm nhận",
      dataIndex: "destinationStationName",
    },
    {
      title: "Ngày gửi",
      render: (_, record) =>
        dayjs(record.scheduledDateTime).format("DD/MM/YYYY"),
    },
    {
      title: "Thời gian nhận hàng",
      render: (_, record) => dayjs(record.scheduledDateTime).format("HH:mm"),
    },
    {
      title: "Tổng chi phí",
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
      title: "Xem chi tiết",
      render: (_, record) => (
        <ConfigProvider
          theme={{
            components: {
              Button: {
                defaultColor: "white",
                defaultBg: "#0066CC",
                defaultBorderColor: "#0066CC",
              },
            },
          }}
        >
          <Button onClick={() => onRowClick(record)}>Xem chi tiết</Button>
        </ConfigProvider>
      ),
    },
  ];

  const onRowClick = (record) => {
    const relatedParcels = parcels.filter((p) => p.shipmentId === record.id);
    setSelectedOrder({ ...record, relatedParcels });
    setModalOpen(true);
  };

  return (
    <div className="admin-orders-container">
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Tìm theo mã đơn hàng"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          onSearch={(value) => setSearchCode(value)}
          allowClear
          style={{ width: 400 }}
        />

        <Input.Search
          placeholder="Tìm theo trạm gửi"
          value={departureSearch}
          onChange={(e) => setDepartureSearch(e.target.value)}
          allowClear
          style={{ width: 400 }}
        />

        <Input.Search
          placeholder="Tìm theo trạm nhận"
          value={destinationSearch}
          onChange={(e) => setDestinationSearch(e.target.value)}
          allowClear
          style={{ width: 400 }}
        />
        <Select
          mode="multiple"
          placeholder="Trạng thái"
          style={{ width: 400 }}
          allowClear
          value={statusFilter}
          onChange={setStatusFilter}
        >
          {Object.keys(shipmentStatusMap).map((key) => (
            <Option key={key} value={Number(key)}>
              <Tag color={shipmentStatusColorMap[key]}>
                {shipmentStatusMap[key]}
              </Tag>
            </Option>
          ))}
        </Select>

        <RangePicker
          value={sendDateRange}
          onChange={setSendDateRange}
          style={{ width: 400 }}
          placeholder={["Ngày gửi từ", "Ngày gửi đến"]}
          format="DD/MM/YYYY"
        />

        <Button
          className="clear-filter-button"
          icon={<ReloadOutlined />}
          onClick={() => {
            setSearchCode("");
            setDepartureSearch("");
            setDestinationSearch("");
            setStatusFilter(null);
            setSendDateRange([]);
          }}
        ></Button>
      </Space>
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      <Modal
        title={`Chi tiết đơn hàng: ${selectedOrder?.trackingCode || ""}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && selectedOrder.relatedParcels && (
          <Tabs defaultActiveKey="0">
            {selectedOrder.relatedParcels.map((parcel, index) => (
              <TabPane tab={`Kiện hàng ${index + 1}`} key={index}>
                <Table
                  dataSource={[
                    {
                      label: "Mã kiện hàng",
                      value: parcel.parcelCode || "N/A",
                    },
                    {
                      label: "Loại hàng",
                      value: parcel.parcelCategory?.categoryName || "N/A",
                    },
                    {
                      label: "Trọng lượng quy đổi",
                      value: `${parcel.chargeableWeightKg || "N/A"} kg`,
                    },
                    {
                      label: "Thể tích",
                      value: `${parcel.volumeCm3 || "N/A"} cm³`,
                    },
                    {
                      label: "Trạm gửi",
                      value: selectedOrder.departureStationName || "N/A",
                    },
                    {
                      label: "Trạm nhận",
                      value: selectedOrder.destinationStationName || "N/A",
                    },
                    {
                      label: "Ngày gửi",
                      value: dayjs(selectedOrder.scheduledDateTime).format(
                        "YYYY-MM-DD"
                      ),
                    },
                    {
                      label: "Hạn chót nhận hàng tại trạm",
                      value: dayjs(selectedOrder.scheduledDateTime).format(
                        "HH:mm"
                      ),
                    },
                    {
                      label: "Tổng chi phí",
                      value: formatCurrency(parcel.priceVnd || 0),
                    },
                    {
                      label: "Trạng thái kiện hàng",
                      value:
                        shipmentStatusMap[selectedOrder.shipmentStatus] ||
                        "Không xác nhận",
                    },
                  ]}
                  columns={[
                    { title: "Thông tin", dataIndex: "label" },
                    { title: "Chi tiết", dataIndex: "value" },
                  ]}
                  pagination={false}
                  showHeader={false}
                  rowKey={(row) => row.label}
                />
              </TabPane>
            ))}
          </Tabs>
        )}
      </Modal>
    </div>
  );
}

export default AdminOrders;
