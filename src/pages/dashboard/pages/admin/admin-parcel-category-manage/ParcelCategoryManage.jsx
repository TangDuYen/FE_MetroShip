import "./ParcelCategoryManage.scss";

import {
  Button,
  Checkbox,
  ConfigProvider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";

import api from "../../../../../config/axios";
import { getAllParcelCategories } from "../../../../../config/metroApi";
import { toast } from "react-toastify";

function ParcelCategoryManage() {
  const [parcelCategories, setParcelCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [filterCategory, setFilterCategory] = useState([]);

  useEffect(() => {
    fetchParcelCategories();
  }, []);

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
    form.setFieldsValue(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/parcel-category/${id}`);
      toast.success("Đã xoá thành công!");
      fetchParcelCategories();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Xoá thất bại!";
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
    {
      title: "Phí bảo hiểm (vnd)",
      dataIndex: "insuranceFeeVnd",
      render: (value) => (value ? value.toLocaleString() : "Không có"),
    },
    {
      title: "Tỷ lệ bảo hiểm",
      dataIndex: "insuranceRate",
      render: (value) => (value ? value.toLocaleString() : "0"),
    },
    {
      title: "Bắt buộc bảo hiểm",
      dataIndex: "isInsuranceRequired",
      render: (value) => <Checkbox checked={value} disabled />,
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Xác nhận xoá loại này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xoá"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
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
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="isBulk"
            label="Hàng cồng kềnh"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="weightLimitKg"
            label="Khối lượng tối đa (Kg)"
            rules={[
              { required: true, message: "Vui lòng nhập khối lượng giới hạn" },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="volumeLimitCm3"
            label="Thể tích tối đa (cm³)"
            rules={[
              { required: true, message: "Vui lòng nhập thể tích giới hạn" },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="lengthLimitCm"
            label="Chiều dài tối đa (cm)"
            rules={[
              { required: true, message: "Vui lòng nhập chiều dài tối đa" },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="widthLimitCm"
            label="Chiều rộng tối đa (cm)"
            rules={[
              { required: true, message: "Vui lòng nhập chiều rộng tối đa" },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="heightLimitCm"
            label="Chiều cao tối đa (cm)"
            rules={[
              { required: true, message: "Vui lòng nhập chiều cao tối đa" },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ParcelCategoryManage;
