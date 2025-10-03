import "./ParcelCategoryManage.scss";

import {
  Button,
  Card,
  Checkbox,
  Col,
  ConfigProvider,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";

import api from "../../../../../config/axios";
import { getAllParcelCategories } from "../../../../../config/metroApi";
import { toast } from "react-toastify";
import dayjs from "dayjs";

function ParcelCategoryManage() {
  const [parcelCategories, setParcelCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [filterCategory, setFilterCategory] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [insurancePolicies, setInsurancePolicies] = useState([]);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const formatDate = (dateString) => {
    return dateString ? dayjs(dateString).format("DD/MM/YYYY") : "—";
  };

  useEffect(() => {
    fetchParcelCategories();
    fetchInsurancePolicies();
  }, []);

  const fetchInsurancePolicies = async () => {
    try {
      const res = await api.get("/insurance-policies/dropdown");
      setInsurancePolicies(res.data.data || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể tải danh sách chính sách bảo hiểm";
      toast.error(errorMessage);
    }
  };

  const fetchParcelCategories = async () => {
    try {
      setLoading(true);
      const response = await getAllParcelCategories();
      console.log("respone", response);

      setParcelCategories(response || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể tải dữ liệu loại kiện hàng";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    form.resetFields();
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      ...category,
      insurancePolicyId: category.categoryInsurances?.[0]?.insurancePolicy?.id,
    });

    setIsModalOpen(true);
  };

  const openModalConfirm = (id) => {
    setSelectedId(id);
    setIsModalConfirmOpen(true);
  };
  const handleOk = async () => {
    if (!selectedId) return;
    try {
      await api.delete(`/parcel-category/${selectedId}`);
      toast.success("Đã xoá thành công!");
      fetchParcelCategories();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Xoá thất bại!";
      toast.error(errorMessage);
    } finally {
      setIsModalConfirmOpen(false);
      setSelectedId(null);
    }
  };

  const handleCancel = () => {
    setIsModalConfirmOpen(false);
    setSelectedId(null);
  };

  const openDetailModal = async (category) => {
    try {
      const res = await api.get(`/parcel-category/${category.id}`);
      setSelectedCategory(res.data.data);
      setIsDetailModalOpen(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Không thể tải thông tin chi tiết!";
      toast.error(errorMessage);
    }
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        try {
          if (editingCategory) {
            await api.put(`/parcel-category`, {
              ...values,
              id: editingCategory.id,
            });
            toast.success("Cập nhật loại kiện hàng thành công!");
          } else {
            await api.post("/parcel-category", values);
            toast.success("Thêm loại kiện hàng thành công!");
          }

          setIsModalOpen(false);
          form.resetFields();
          fetchParcelCategories();
        } catch (err) {
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Gửi dữ liệu thất bại!";
          toast.error(errorMessage);
        }
      })
      .catch((info) => {
        console.error("Validate Failed:", info);
      });
  };

  const filteredData = parcelCategories.filter(
    (item) =>
      filterCategory.length === 0 || filterCategory.includes(item.categoryName)
  );

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Tên loại kiện hàng",
      dataIndex: "categoryName",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
    {
      title: "Dài tối đa (cm)",
      dataIndex: "lengthLimitCm",
    },
    {
      title: "Rộng tối da (cm)",
      dataIndex: "widthLimitCm",
    },
    {
      title: "Cao tối đa (cm)",
      dataIndex: "heightLimitCm",
    },
    {
      title: "Kích thước tổng (cm)",
      dataIndex: "totalSizeLimitCm",
    },
    // {
    //   title: "Phí bảo hiểm (vnd)",
    //   dataIndex: "insuranceFeeVnd",
    //   render: (value) => (value ? value.toLocaleString() : "Không có"),
    // },
    // {
    //   title: "Tỷ lệ bảo hiểm",
    //   dataIndex: "insuranceRate",
    //   render: (value) => (value ? value.toLocaleString() : "0"),
    // },
    {
      title: "Bắt buộc bảo hiểm",
      dataIndex: "isInsuranceRequired",
      render: (value) => <Checkbox checked={value} disabled />,
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  defaultColor: "#0066CC",
                  defaultBg: "white",
                  defaultBorderColor: "#0066CC",
                },
              },
            }}
          >
            <Button
              icon={<EyeOutlined />}
              onClick={() => openDetailModal(record)}
            />
          </ConfigProvider>
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  defaultColor: "#52c41a",
                  defaultBg: "white",
                  defaultBorderColor: "#52c41a",
                  defaultHoverBorderColor: "#389e0d",
                  defaultHoverColor: "#389e0d",
                  defaultActiveBorderColor: "#52c41a",
                  defaultActiveColor: "#52c41a",
                },
              },
            }}
          >
            <Button
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </ConfigProvider>

          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => openModalConfirm(record.id)}
          />
        </Space>
      ),
    },
  ];
  return (
    <div className="parcel-category-management-container">
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openAddModal}>
          + Thêm loại bưu kiện
        </Button>
        <Select
          mode="multiple"
          allowClear
          placeholder="Lọc theo loại kiện hàng"
          style={{ width: 250 }}
          value={filterCategory}
          onChange={(value) => setFilterCategory(value)}
          options={parcelCategories.map((c) => ({
            label: c.categoryName,
            value: c.categoryName,
          }))}
        />
        <Button
          className="clear-filter-button"
          icon={<ReloadOutlined />}
          onClick={() => {
            setFilterCategory([]);
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
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </ConfigProvider>
      </Spin>

      <Modal
        title={
          editingCategory ? "Cập nhật loại kiện hàng" : "Thêm loại kiện hàng"
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText={editingCategory ? "Lưu" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="categoryName"
            label="Tên loại kiện hàng"
            rules={[
              { required: true, message: "Vui lòng nhập tên loại kiện hàng" },
            ]}
          >
            <Input placeholder="Nhập tên loại kiện hàng" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả" />
          </Form.Item>

          <Form.Item
            name="insurancePolicyId"
            label="Chính sách bảo hiểm"
            rules={[
              { required: true, message: "Vui lòng chọn chính sách bảo hiểm" },
            ]}
          >
            <Select
              placeholder="Chọn chính sách bảo hiểm"
              options={insurancePolicies.map((p) => ({
                label: p.name,
                value: p.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="isBulk"
            label="Hàng cồng kềnh"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item name="weightLimitKg" label="Khối lượng tối đa (Kg)">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Nhập khối lượng tối đa (Không bắt buộc)"
            />
          </Form.Item>

          <Form.Item name="volumeLimitCm3" label="Thể tích tối đa (cm³)">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Nhập thể tích tối đa (Không bắt buộc)"
            />
          </Form.Item>

          <Form.Item name="lengthLimitCm" label="Chiều dài tối đa (cm)">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Nhập chiều dài tối đa (Không bắt buộc)"
            />
          </Form.Item>

          <Form.Item name="widthLimitCm" label="Chiều rộng tối đa (cm)">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Nhập chiều rộng tối đa (Không bắt buộc)"
            />
          </Form.Item>

          <Form.Item name="heightLimitCm" label="Chiều cao tối đa (cm)">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Nhập chiều cao tối đa (Không bắt buộc)"
            />
          </Form.Item>

          <Form.Item
            name="totalSizeLimitCm"
            label="Tổng kích thước tối đa (cm)"
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Nhập tổng kích thước tối đa (Không bắt buộc)"
            />
          </Form.Item>

          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết loại kiện hàng"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={800}
      >
        {selectedCategory && (
          <Card bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p>
                  <strong>Tên loại kiện hàng:</strong>
                  <br />
                  {selectedCategory.categoryName}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Mô tả:</strong>
                  <br />
                  {selectedCategory.description}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Kích thước (DxRxC):</strong>
                  <br />
                  {selectedCategory.lengthLimitCm} x{" "}
                  {selectedCategory.widthLimitCm} x{" "}
                  {selectedCategory.heightLimitCm} cm
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Kích thước tổng:</strong>
                  <br />
                  {selectedCategory.totalSizeLimitCm} cm
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Bảo hiểm bắt buộc:</strong>
                  <br />
                  {selectedCategory.isInsuranceRequired ? (
                    <Tag color="green">Có</Tag>
                  ) : (
                    <Tag color="red">Không</Tag>
                  )}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Phí bảo hiểm mặc định:</strong>
                  <br />
                  {selectedCategory.insuranceFeeVnd?.toLocaleString()} VND
                </p>
              </Col>
            </Row>

            {/* render danh sách chính sách bảo hiểm */}
            {selectedCategory.categoryInsurances?.length > 0 && (
              <>
                <Divider />
                <h3>Lịch sử chính sách bảo hiểm</h3>

                <Table
                  size="small"
                  dataSource={selectedCategory.categoryInsurances}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    {
                      title: "Tên chính sách",
                      dataIndex: ["insurancePolicy", "name"],
                    },
                    {
                      title: "Phí cơ bản",
                      dataIndex: ["insurancePolicy", "baseFeeVnd"],
                      render: (v) => v?.toLocaleString(),
                    },
                    {
                      title: "Giá trị tối đa",
                      dataIndex: ["insurancePolicy", "maxParcelValueVnd"],
                      render: (v) => v?.toLocaleString(),
                    },
                    {
                      title: "Tỷ lệ phí",
                      dataIndex: ["insurancePolicy", "insuranceFeeRateOnValue"],
                      render: (v) => v * 100 + "%",
                    },
                    {
                      title: "Bồi thường tiêu chuẩn",
                      dataIndex: [
                        "insurancePolicy",
                        "standardCompensationValueVnd",
                      ],
                      render: (v) => v?.toLocaleString(),
                    },
                    {
                      title: "Hiệu lực từ",
                      dataIndex: ["insurancePolicy", "validFrom"],
                      render: (v) => formatDate(v),
                    },
                  ]}
                />
              </>
            )}
          </Card>
        )}
      </Modal>

      <Modal
        title="Xác nhận xoá loại này?"
        open={isModalConfirmOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Xoá"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xoá loại kiện hàng này không?</p>
      </Modal>
    </div>
  );
}

export default ParcelCategoryManage;
