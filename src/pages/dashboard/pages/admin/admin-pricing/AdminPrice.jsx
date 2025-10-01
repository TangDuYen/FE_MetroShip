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
  Collapse,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";

import api from "../../../../../config/axios";
import { getAllPrice } from "../../../../../config/metroApi";
import { toast } from "react-toastify";

const { Panel } = Collapse;
function AdminPrice() {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();
  const [editingPrice, setEditingPrice] = useState(null);

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

  const loadCurrentPricing = async () => {
    try {
      setLoading(true);
      const list = await getAllPrice();
      if (!list || list.length === 0) {
        toast.warning("Không có dữ liệu pricing nào!");
        return;
      }

      // lấy cái pricing đang active
      const current = list.find((p) => p.isActive);

      if (!current) {
        toast.warning("Chưa có bảng giá nào đang active!");
        return;
      }

      form.setFieldsValue(current);
    } catch (err) {
      toast.error("Không thể load cấu hình hiện tại!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePricing = async (values) => {
    try {
      if (editingPrice) {
        await api.post(`/pricing`, {
          ...values,
          id: editingPrice.id,
          isActive: false,
        });
        toast.success("Cập nhật bảng giá thành công!");
      } else {
        await api.post(`/pricing`, values);
        toast.success("Tạo bảng giá thành công!");
      }
      setOpenModal(false);
      form.resetFields();
      setEditingPrice(null);
      fetchPricing();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Thao tác thất bại!";
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
              <Space direction="vertical" style={{ padding: 10 }}>
                <div>
                  Áp dụng từ ngày{" "}
                  <Tag color={price.effectiveFrom ? "blue" : "default"}>
                    {price.effectiveFrom
                      ? new Date(price.effectiveFrom).toLocaleDateString(
                          "vi-VN"
                        )
                      : "Chưa xác định"}
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
              </Space>
            }
            extra={
              <Tag color={price.isActive ? "green" : "red"}>
                {price.isActive ? "Đang áp dụng" : "Ngưng áp dụng"}
              </Tag>
            }
            style={{ marginBottom: 24 }}
          >
            <Typography.Paragraph>
              {price.description || "Không có mô tả"}
            </Typography.Paragraph>

            {!price.isActive && !price.effectiveFrom && !price.effectiveTo && (
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
                <Button
                  onClick={() => handleActivatePricing(price.id)}
                  style={{ marginBottom: 12 }}
                >
                  Kích hoạt
                </Button>
              </ConfigProvider>
            )}
            {!price.isActive && !price.effectiveFrom && !price.effectiveTo && (
              <ConfigProvider
                theme={{
                  components: {
                    Button: {
                      defaultColor: "white",
                      defaultBg: "#52c41a",
                      defaultBorderColor: "#52c41a",
                      defaultHoverBorderColor: "#52c41a",
                      defaultHoverColor: "#52c41a",
                      defaultActiveBorderColor: "#52c41a",
                      defaultActiveColor: "#52c41a",
                    },
                  },
                }}
              >
                <Button
                  onClick={() => {
                    setEditingPrice(price);
                    form.setFieldsValue(price);
                    setOpenModal(true);
                  }}
                  style={{ marginLeft: 12, marginBottom: 12 }}
                >
                  Cập nhật
                </Button>
              </ConfigProvider>
            )}

            <Collapse>
              <Panel header="Chi tiết bảng giá" key="1">
                <Typography.Title level={5} style={{ fontWeight: "bold" }}>
                  Bảng giá theo trọng lượng
                </Typography.Title>
                <ConfigProvider renderEmpty={renderEmpty}>
                  <Table
                    columns={weightColumns}
                    dataSource={price.weightTiers
                      .sort((a, b) => a.maxWeightKg - b.maxWeightKg)
                      .map((w, i) => ({ ...w, tierOrder: i + 1, key: i }))}
                    pagination={false}
                    bordered
                    size="small"
                  />
                </ConfigProvider>

                <Typography.Title
                  level={5}
                  style={{ fontWeight: "bold", marginTop: 12 }}
                >
                  Bảng giá theo khoảng cách
                </Typography.Title>
                <ConfigProvider renderEmpty={renderEmpty}>
                  <Table
                    columns={distanceColumns}
                    dataSource={price.distanceTiers
                      .sort((a, b) => a.maxDistanceKm - b.maxDistanceKm)
                      .map((d, i) => ({ ...d, tierOrder: i + 1, key: i }))}
                    pagination={false}
                    bordered
                    size="small"
                  />
                </ConfigProvider>

                {/* Các thông tin bổ sung */}
                <div style={{ marginTop: 10 }}>
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
                      <Typography.Text type="warning" strong>
                        {price.baseSurchargePerDayVnd.toLocaleString()} VND
                      </Typography.Text>
                    </div>
                  )}

                  {price.refundRate > 0 && (
                    <div>
                      <Typography.Text strong>
                        Tỷ lệ hoàn tiền:{" "}
                      </Typography.Text>
                      <Typography.Text type="success" strong>
                        {price.refundRate * 100}%
                      </Typography.Text>
                    </div>
                  )}

                  {price.refundForCancellationBeforeScheduledHours > 0 && (
                    <div>
                      <Typography.Text strong>
                        Hoàn tiền khi hủy trước:{" "}
                      </Typography.Text>
                      <Typography.Text type="success" strong>
                        {price.refundForCancellationBeforeScheduledHours} giờ
                      </Typography.Text>
                    </div>
                  )}
                </div>
              </Panel>
            </Collapse>
          </Card>
        ))}
      </Spin>
      {/* Modal tạo bảng giá */}
      <Modal
        title={editingPrice ? "Cập nhật bảng giá" : "Tạo bảng giá"}
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          form.resetFields();
        }}
        footer={null}
        width={1800} // tăng rộng để chứa 3 cột
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePricing}
          initialValues={{ isActive: false }}
        >
          <Row gutter={24} align="top">
            {/* Cột 1 - Thông tin chung */}
            <Col span={8}>
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
                label="Tỷ lệ hoàn tiền (0 to 1)"
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
                <Input.TextArea rows={3} placeholder="Nhập mô tả" />
              </Form.Item>
            </Col>

            {/* Cột 2 - Bảng giá theo trọng lượng */}
            <Col span={8}>
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
                          <Col span={12}>
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
                          <Col span={12}>
                            <Form.Item noStyle shouldUpdate>
                              {({ getFieldValue }) => {
                                const isPerKmKg = getFieldValue([
                                  "weightTiers",
                                  name,
                                  "isPricePerKmAndKg",
                                ]);
                                return isPerKmKg ? (
                                  <Form.Item
                                    {...restField}
                                    name={[name, "basePriceVndPerKmPerKg"]}
                                    label="Giá theo Km-Kg (VND)"
                                    rules={[
                                      { required: true, message: "Nhập giá" },
                                    ]}
                                  >
                                    <InputNumber
                                      min={0}
                                      style={{ width: "100%" }}
                                    />
                                  </Form.Item>
                                ) : (
                                  <Form.Item
                                    {...restField}
                                    name={[name, "basePriceVnd"]}
                                    label="Giá cơ bản (VND)"
                                    rules={[
                                      { required: true, message: "Nhập giá" },
                                    ]}
                                  >
                                    <InputNumber
                                      min={0}
                                      style={{ width: "100%" }}
                                    />
                                  </Form.Item>
                                );
                              }}
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row justify="space-between" align="middle">
                          <Form.Item
                            {...restField}
                            name={[name, "isPricePerKmAndKg"]}
                            label="Tính theo Km-Kg"
                            valuePropName="checked"
                          >
                            <Switch />
                          </Form.Item>
                          <Button
                            danger
                            type="text"
                            onClick={() => remove(name)}
                            icon={<MinusCircleOutlined />}
                          />
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
            </Col>

            {/* Cột 3 - Bảng giá theo khoảng cách */}
            <Col span={8}>
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
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "maxDistanceKm"]}
                              label="Khoảng cách tối đa (km)"
                              rules={[
                                { required: true, message: "Nhập khoảng cách" },
                              ]}
                            >
                              <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item noStyle shouldUpdate>
                              {({ getFieldValue }) => {
                                const isPerKm = getFieldValue([
                                  "distanceTiers",
                                  name,
                                  "isPricePerKm",
                                ]);
                                return isPerKm ? (
                                  <Form.Item
                                    {...restField}
                                    name={[name, "basePriceVndPerKm"]}
                                    label="Giá theo Km (VND)"
                                    rules={[
                                      { required: true, message: "Nhập giá" },
                                    ]}
                                  >
                                    <InputNumber
                                      min={0}
                                      style={{ width: "100%" }}
                                    />
                                  </Form.Item>
                                ) : (
                                  <Form.Item
                                    {...restField}
                                    name={[name, "basePriceVnd"]}
                                    label="Giá cơ bản (VND)"
                                    rules={[
                                      { required: true, message: "Nhập giá" },
                                    ]}
                                  >
                                    <InputNumber
                                      min={0}
                                      style={{ width: "100%" }}
                                    />
                                  </Form.Item>
                                );
                              }}
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row justify="space-between" align="middle">
                          <Form.Item
                            {...restField}
                            name={[name, "isPricePerKm"]}
                            label="Tính theo Km"
                            valuePropName="checked"
                          >
                            <Switch />
                          </Form.Item>
                          <Button
                            danger
                            type="text"
                            onClick={() => remove(name)}
                            icon={<MinusCircleOutlined />}
                          />
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
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 16 }}>
            <Button
              type="primary"
              ghost
              style={{ marginRight: 16 }}
              onClick={loadCurrentPricing}
            >
              Tải bảng giá hiện tại
            </Button>
            <Button type="primary" htmlType="submit">
              {editingPrice ? "Cập nhật bảng giá" : "Tạo bảng giá"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminPrice;
