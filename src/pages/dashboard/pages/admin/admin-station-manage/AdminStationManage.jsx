import "./AdminStationManage.scss";

import {
  BarcodeOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  ReloadOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  Button,
  ConfigProvider,
  Descriptions,
  Divider,
  Empty,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  getAllRegions,
  getAllStations,
  getStationById,
} from "../../../../../config/metroApi";
import { useEffect, useState } from "react";

import AddStationModal from "./AddStationModal";

const { Title, Text } = Typography;
function AdminStationManage() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regions, setRegions] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [stationDetail, setStationDetail] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stationsRes, regionsRes] = await Promise.all([
          getAllStations(),
          getAllRegions(),
        ]);
        setStations(stationsRes);
        setRegions(regionsRes);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const regionMap = Object.fromEntries(
    regions.map((r) => [r.id, r.regionName])
  );

  const stationsWithLine = stations.map((s) => ({
    ...s,
    id: s.stationId,
    lineCode: s.stationCode.split("-")[1],
  }));

  const filtered = stationsWithLine.filter((s) => {
    const matchStation =
      selectedStation.length > 0
        ? selectedStation.includes(s.stationNameVi)
        : true;
    const matchLine = selectedLine ? s.lineCode === selectedLine : true;
    const matchRegion = selectedRegion ? s.regionId === selectedRegion : true;
    return matchStation && matchLine && matchRegion;
  });

  const handleShowDetail = async (stationId) => {
    setStationDetail(null);
    setDetailLoading(true);
    try {
      const data = await getStationById(stationId);
      setStationDetail(data);
      setDetailVisible(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết trạm:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };


  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Mã trạm",
      dataIndex: "stationCode",
      key: "stationCode",
    },
    {
      title: "Tên trạm (Tiếng Việt)",
      dataIndex: "stationNameVi",
      key: "stationNameVi",
    },
    {
      title: "Tên trạm (Tiếng Anh)",
      dataIndex: "stationNameEn",
      key: "stationNameEn",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (value) =>
        value ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Không hoạt động</Tag>
        ),
    },
    {
      title: "Chi tiết",
      key: "action",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleShowDetail(record.id)}
        ></Button>
      ),
    },

    // {
    //   title: "Đóng trạm",
    //   key: "close",
    //   render: (_, record) => (
    //     <Button className="close-station-button" onClick={() => { }}>
    //       Đóng trạm
    //     </Button>
    //   ),
    // },
  ];

  return (
    <div className="admin-station-manage-container">
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openAddModal}>
          + Thêm trạm mới
        </Button>

        {/* STATIONS */}
        <Select
          mode="multiple"
          showSearch
          allowClear
          style={{ width: 200 }}
          placeholder="Chọn tên trạm"
          value={selectedStation}
          onChange={setSelectedStation}
          optionFilterProp="children"
        >
          {[...new Set(stations.map((s) => s.stationNameVi))].map((name) => (
            <Select.Option key={name} value={name}>
              {name}
            </Select.Option>
          ))}
        </Select>

        {/* METROROUTES */}
        <Select
          showSearch
          allowClear
          style={{ width: 200 }}
          placeholder="Chọn tuyến"
          value={selectedLine}
          onChange={setSelectedLine}
          optionFilterProp="children"
        >
          {[...new Set(stations.map((s) => s.stationCode.split("-")[1]))].map(
            (line) => (
              <Select.Option key={line} value={line}>
                {line}
              </Select.Option>
            )
          )}
        </Select>

        {/* REGIONS */}
        <Select
          showSearch
          allowClear
          style={{ width: 200 }}
          placeholder="Chọn khu vực"
          value={selectedRegion}
          onChange={setSelectedRegion}
          optionFilterProp="children"
        >
          {[...new Set(stations.map((s) => s.regionId))].map((regionId) => (
            <Select.Option key={regionId} value={regionId}>
              {regionMap[regionId] || regionId}
            </Select.Option>
          ))}
        </Select>
        <Button
          className="clear-filter-button"
          icon={<ReloadOutlined />}
          onClick={() => {
            setSelectedStation([]);
            setSelectedLine(null);
            setSelectedRegion(null);
          }}
        ></Button>
      </Space>
      <Spin spinning={loading}>
        <ConfigProvider
          renderEmpty={() => (
            <Empty
              image={Empty.PRESENTED_IMAGE_DEFAULT}
              description="Không có dữ liệu"
            />
          )}
        >
          <Table
            dataSource={filtered.map((s, i) => ({ ...s, key: s.id || i }))}
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
            bordered
          />
        </ConfigProvider>
      </Spin>

      {/* Modal chi tiết */}
      <Modal
        centered
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
        title={null} // bỏ title mặc định để custom
      >
        <Spin spinning={detailLoading}>
          {stationDetail ? (
            <div>
              {/* Header */}
              <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ marginBottom: 4 }}>
                  Chi tiết trạm {stationDetail.stationNameVi}
                </Title>
              </div>

              <Divider />

              {/* Descriptions */}
              <Descriptions
                bordered
                size="middle"
                column={2}
                labelStyle={{ fontWeight: "bold", width: 160 }}
                contentStyle={{ background: "#fafafa" }}
              >
                <Descriptions.Item label="Mã trạm">
                  {stationDetail.stationCode}
                </Descriptions.Item>
                <Descriptions.Item label="Khu vực">
                  {regionMap[stationDetail.regionId] || stationDetail.regionId}
                </Descriptions.Item>

                <Descriptions.Item label="Địa chỉ" span={2}>
                  <EnvironmentOutlined style={{ marginRight: 6 }} />
                  {stationDetail.address}
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái">
                  {stationDetail.isActive ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      Đang hoạt động
                    </Tag>
                  ) : (
                    <Tag color="red" icon={<StopOutlined />}>
                      Không hoạt động
                    </Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Ngầm">
                  {stationDetail.isUnderground ? "Có" : "Không"}
                </Descriptions.Item>

                <Descriptions.Item label="Nhiều tuyến">
                  {stationDetail.isMultiLine ? "Có" : "Không"}
                </Descriptions.Item>
                <Descriptions.Item label="Tọa độ">
                  {stationDetail.latitude}, {stationDetail.longitude}
                </Descriptions.Item>
              </Descriptions>
            </div>
          ) : (
            <p>Không có dữ liệu</p>
          )}
        </Spin>
      </Modal>

      <AddStationModal
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          // reload danh sách station sau khi thêm thành công
          getAllStations().then(setStations).catch(console.error);
        }}
      />

    </div>
  );
}

export default AdminStationManage;
