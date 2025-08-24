import "./AdminStationManage.scss";

import { Button, Empty, Select, Space, Spin, Table } from "antd";
import { useEffect, useState } from "react";

import { ReloadOutlined } from "@ant-design/icons";
import { getAllStations } from "../../../../../config/metroApi";

function AdminStationManage() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const response = await getAllStations();
        setStations(response);
      } catch (error) {
        console.error("Failed to fetch stations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);
  const stationsWithLine = stations.map((s) => ({
    ...s,
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

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: 60,
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
      render: (value) => (
        <span>{value ? "Đang hoạt động" : "Không hoạt động"}</span>
      ),
    },
    {
      title: "Mã trạm",
      dataIndex: "stationCode",
      key: "stationCode",
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
          {[...new Set(stations.map((s) => s.regionId))].map((region) => (
            <Select.Option key={region} value={region}>
              {region}
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
            pagination={{ pageSize: 10 }}
            bordered
          />
        </ConfigProvider>
      </Spin>
    </div>
  );
}

export default AdminStationManage;
