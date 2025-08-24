import "./AdminPrice.scss";

import { Button, Card, ConfigProvider, Empty, Space, Spin, Table, Tag, Typography } from "antd";
import React, { useEffect, useState } from "react";

import { ReloadOutlined } from "@ant-design/icons";
import { getAllPrice } from "../../../../../config/metroApi";

function AdminPrice() {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const res = await getAllPrice();
      setPricing(res || []);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu pricing:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const weightColumns = [
    { title: "Thứ tự", dataIndex: "tierOrder", key: "tierOrder", width: 120 },
    {
      title: "Trọng lượng tối đa (kg)",
      dataIndex: "maxWeightKg",
      key: "maxWeightKg",
      width: 500,
    },
    {
      title: "Đơn giá",
      dataIndex: "basePriceVndPerKmPerKg",
      key: "basePriceVndPerKmPerKg",
      width: 300,
    },
    { title: "Đơn vị", dataIndex: "units", key: "units", width: 300 },
  ];

  const distanceColumns = [
    { title: "Thứ tự", dataIndex: "tierOrder", key: "tierOrder", width: 120 },
    {
      title: "Khoảng cách tối đa (km)",
      dataIndex: "maxDistanceKm",
      key: "maxDistanceKm",
      width: 500,
    },
    {
      title: "Đơn giá",
      width: 300,
      key: "price",
      render: (_, record) =>
        record.isPricePerKm ? record.basePriceVndPerKm : record.basePriceVnd,
    },
    { title: "Đơn vị", dataIndex: "units", key: "units", width: 300 },
  ];

  const renderEmpty = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_DEFAULT}
      description="Không có dữ liệu"
    />
  );
  return (
    <div className="admin-price-container">
      {/* <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchPricing}
          loading={loading}
        ></Button>
      </Space> */}

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        {pricing.map((price) => (
          <Card
            key={price.id}
            title={`Áp dụng từ ngày ${new Date(
              price.effectiveFrom
            ).toLocaleDateString("vi-VN")}`}
            extra={
              <Tag color={price.isActive ? "green" : "red"}>
                {price.isActive ? "Đang áp dụng" : "Ngưng áp dụng"}
              </Tag>
            }
            style={{ marginBottom: 24 }}
          >
            <Typography.Title
              level={4}
              style={{ fontWeight: "bold", marginBottom: 12 }}
            >
              Bảng giá theo trọng lượng
            </Typography.Title>

            <ConfigProvider renderEmpty={renderEmpty}>
              <Table
                columns={weightColumns}
                dataSource={price.weightTiers.map((w, i) => ({ ...w, key: i }))}
                pagination={{ pageSize: 10 }}
                bordered
                //   size="small"
              />
            </ConfigProvider>

            <Typography.Title
              level={4}
              style={{ fontWeight: "bold", marginBottom: 12 }}
            >
              Bảng giá theo khoảng cách
            </Typography.Title>
            <ConfigProvider renderEmpty={renderEmpty}>
              <Table
                columns={distanceColumns}
                dataSource={price.distanceTiers.map((d, i) => ({
                  ...d,
                  key: i,
                }))}
                pagination={{ pageSize: 5 }}
                bordered
                size="small"
              />
            </ConfigProvider>
          </Card>
        ))}
      </Spin>
    </div>
  );
}

export default AdminPrice;
