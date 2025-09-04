import "./AdminPrice.scss";

import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";

import {
  MinusCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { getAllPrice } from "../../../../../config/metroApi";
import api from "../../../../../config/axios";
import { toast } from "react-toastify";

function AdminPrice() {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();

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

  const handleCreatePricing = async (values) => {
    try {
      await api.post(`/pricing`, values);
      toast.success("Tạo bảng giá thành công!");
      setOpenModal(false);
      form.resetFields();
      fetchPricing();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Tạo bảng giá thất bại!";
      toast.error(errorMessage);
    }
  };

  const handleActivatePricing = async (pricingId) => {
    try {
      await api.put(`/pricing/activation/${pricingId}`);
      toast.success("Kích hoạt bảng giá thành công!");
      fetchPricing();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Kích hoạt thất bại!";
      toast.error(errorMessage);
    }
  };

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
      // dataIndex: "basePriceVndPerKmPerKg",
      key: "basePriceVndPerKmPerKg",
      width: 300,
      render: (_, record) =>
        record.isPricePerKmAndKg
          ? record.basePriceVndPerKmPerKg
          : record.basePriceVnd,
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
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpenModal(true)}
        >
          Tạo bảng giá
        </Button>
      </Space>
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        {pricing.map((price) => (
          <Card
            key={price.id}
            title={
              <>
                <div>
                  Áp dụng từ ngày{" "}
                  <Tag color="blue">
                    {new Date(price.effectiveFrom).toLocaleDateString("vi-VN")}
                  </Tag>
                </div>
                {!price.isActive && price.effectiveTo && (
                  <div>
                    Ngưng áp dụng từ ngày{" "}
                    <Tag color="red">
                      {new Date(price.effectiveTo).toLocaleDateString("vi-VN")}
                    </Tag>
                  </div>
                )}
              </>
            }
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
                dataSource={price.weightTiers
                  .sort((a, b) => a.maxWeightKg - b.maxWeightKg)
                  .map((w, i) => ({
                    ...w,
                    tierOrder: i + 1,
                    key: i,
                  }))}
                pagination={{ pageSize: 10 }}
                bordered
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
                dataSource={price.distanceTiers
                  .sort((a, b) => a.maxDistanceKm - b.maxDistanceKm)
                  .map((d, i) => ({
                    ...d,
                    tierOrder: i + 1,
                    key: i,
                  }))}
                pagination={{ pageSize: 5 }}
                bordered
              />
            </ConfigProvider>

            {/* Thông tin bổ sung nếu có */}
            {price.freeStoreDays > 0 && (
              <div>
                <Typography.Text strong>
                  Ngày lưu kho miễn phí:{" "}
                </Typography.Text>
                <Typography.Text type="success" strong>
                  {price.freeStoreDays} ngày
                </Typography.Text>
              </div>
            )}
            {price.baseSurchargePerDayVnd > 0 && (
              <div>
                <Typography.Text strong>
                  Phụ thu cơ bản mỗi ngày:{" "}
                </Typography.Text>
                <Typography.Text
                  style={{ color: "#f56a00", fontWeight: "bold" }}
                >
                  {price.baseSurchargePerDayVnd.toLocaleString()} VND
                </Typography.Text>
              </div>
            )}
            {price.refundRate > 0 && (
              <div>
                <Typography.Text strong>Tỷ lệ hoàn tiền: </Typography.Text>
                <Typography.Text
                  style={{ color: "#1890ff", fontWeight: "bold" }}
                >
                  {price.refundRate}%
                </Typography.Text>
              </div>
            )}
            {price.refundForCancellationBeforeScheduledHours > 0 && (
              <div>
                <Typography.Text strong>
                  Hoàn tiền khi hủy trước:{" "}
                </Typography.Text>
                <Typography.Text
                  style={{ color: "#52c41a", fontWeight: "bold" }}
                >
                  {price.refundForCancellationBeforeScheduledHours} giờ
                </Typography.Text>
              </div>
            )}

            {!price.isActive && (
              <Button
                type="primary"
                onClick={() => handleActivatePricing(price.id)}
                style={{ marginTop: 16 }}
              >
                Kích hoạt
              </Button>
            )}
          </Card>
        ))}
      </Spin>
      {/* Modal tạo bảng giá */}
      <Modal
        title="Tạo bảng giá"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePricing}
          initialValues={{ isActive: false }}
        >
          <Form.Item
            name="isActive"
            label="Kích hoạt ngay"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="freeStoreDays"
            label="Số ngày lưu kho miễn phí"
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="baseSurchargePerDayVnd"
            label="Phụ phí mỗi ngày (VND)"
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="refundRate"
            label="Tỷ lệ hoàn tiền (%)"
            initialValue={0}
          >
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="refundForCancellationBeforeScheduledHours"
            label="Hoàn tiền khi hủy trước (giờ)"
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>

          {/* Weight Tiers */}
          <Typography.Title level={5}>
            Bảng giá theo trọng lượng
          </Typography.Title>
          <Form.List name="weightTiers">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 12, background: "#fafafa" }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "tierOrder"]}
                      initialValue={index + 1}
                      hidden
                    >
                      <InputNumber />
                    </Form.Item>
                    <Row gutter={16} align="middle">
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "maxWeightKg"]}
                          label="Trọng lượng tối đa (kg)"
                          rules={[
                            {
                              required: true,
                              message: "Nhập trọng lượng tối đa",
                            },
                          ]}
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "basePriceVnd"]}
                          label="Giá cơ bản (VND)"
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "basePriceVndPerKmPerKg"]}
                          label="Giá theo Km-Kg (VND)"
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, "isPricePerKmAndKg"]}
                          label="Tính theo Km-Kg"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button
                          danger
                          type="text"
                          onClick={() => remove(name)}
                          icon={<MinusCircleOutlined />}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm giá trọng lượng
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          {/* Distance Tiers */}
          <Typography.Title level={5}>
            Bảng giá theo khoảng cách
          </Typography.Title>
          <Form.List name="distanceTiers">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 12, background: "#fafafa" }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "tierOrder"]}
                      initialValue={index + 1}
                      hidden
                    >
                      <InputNumber />
                    </Form.Item>
                    <Row gutter={16} align="middle">
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "maxDistanceKm"]}
                          label="Khoảng cách tối đa (km)"
                          rules={[
                            {
                              required: true,
                              message: "Nhập khoảng cách tối đa",
                            },
                          ]}
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "basePriceVnd"]}
                          label="Giá cơ bản (VND)"
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "basePriceVndPerKm"]}
                          label="Giá theo Km (VND)"
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, "isPricePerKm"]}
                          label="Tính theo Km"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button
                          danger
                          type="text"
                          onClick={() => remove(name)}
                          icon={<MinusCircleOutlined />}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm giá khoảng cách
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tạo bảng giá
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminPrice;
