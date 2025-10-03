import "./AdminInsurance.scss";

import {
  Button,
  Card,
  ConfigProvider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
} from "antd";
import { useEffect, useState } from "react";

import { PATH_NAME } from "../../../../../constants/pathname";
import { ReloadOutlined } from "@ant-design/icons";
import api from "../../../../../config/axios";
import dayjs from "dayjs";
import { getAllInsurance } from "../../../../../config/metroApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// const fakeInsurancePolicies = [
//   {
//     id: "P001",
//     name: "Chính sách bảo hiểm I",
//     effectiveFrom: "2025-01-01",
//     effectiveTo: "2025-12-31",
//     items: [
//       { category: "Điện tử", feeVnd: 50000 },
//       { category: "Đồ gỗ", feeVnd: 75000 },
//     ],
//   },
//   {
//     id: "P002",
//     name: "Chính sách bảo hiểm II",
//     effectiveFrom: "2025-12-31",
//     effectiveTo: null,
//     items: [
//       { category: "Thực phẩm", feeVnd: 30000 },
//       { category: "Thời trang", feeVnd: 40000 },
//     ],
//   },
// ];

function AdminInsurance() {
  const [policies, setPolicies] = useState([]);
  const navigate = useNavigate();
  const [filteredStatusPolicies, setFilteredStatusPolicies] = useState("");
  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllInsurance();
      setPolicies(data || []);
    } catch (error) {
      console.error("Lỗi fetch dữ liệu bảo hiểm:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể tải dữ liệu bảo hiểm";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPolicies = policies.filter((item) => {
    const matchName = item.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const matchStatus = !filteredStatusPolicies
      ? true
      : filteredStatusPolicies === "active"
      ? item.isActive
      : !item.isActive;

    return matchName && matchStatus;
  });

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCreate = async (values) => {
    try {
      const payload = {
        ...values,
        baseFeeVnd: Number(values.baseFeeVnd || 0),
        maxParcelValueVnd: Number(values.maxParcelValueVnd || 0),
        insuranceFeeRateOnValue: Number(values.insuranceFeeRateOnValue || 0),
        maxCompensationRateOnValue: Number(
          values.maxCompensationRateOnValue || 0
        ),
        minCompensationRateOnValue: Number(
          values.minCompensationRateOnValue || 0
        ),
        minCompensationRateOnShippingFee: Number(
          values.minCompensationRateOnShippingFee || 0
        ),
      };

      const res = await api.post("/insurance-policies", payload); // gọi trực tiếp
      if (res.data?.statusCode === 200) {
        toast.success(res.data?.message || "Tạo chính sách thành công");
        setIsAddModalOpen(false);
        form.resetFields();
        fetchData();
      }
      setIsAddModalOpen(false);
      form.resetFields();
      fetchData(); // refresh danh sách
    } catch (error) {
      console.error("Lỗi tạo chính sách bảo hiểm:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo chính sách";
      toast.error(errorMessage);
    }
  };

  const columns = [
    {
      title: "Tên chính sách",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Hiệu lực từ",
      dataIndex: "validFrom",
      key: "validFrom",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    // {
    //   title: "Đến ngày",
    //   dataIndex: "effectiveTo",
    //   key: "effectiveTo",
    //   render: (date) =>
    //     date ? dayjs(date).format("DD/MM/YYYY") : "Không giới hạn",
    // },
    {
      title: "Phí cơ bản",
      dataIndex: "baseFeeVnd",
      key: "baseFeeVnd",
      render: (v) => v?.toLocaleString("vi-VN") + " VND",
    },
    {
      title: "Giá trị hàng tối đa",
      dataIndex: "maxParcelValueVnd",
      key: "maxParcelValueVnd",
      render: (v) => v?.toLocaleString("vi-VN") + " VND",
    },
    {
      title: "Tỷ lệ phí bảo hiểm",
      dataIndex: "insuranceFeeRateOnValue",
      key: "insuranceFeeRateOnValue",
      render: (v) => `${v * 100}%`,
    },
    {
      title: "Bồi thường (min-max)",
      key: "compensation",
      render: (_, record) =>
        `${(record.minCompensationRateOnValue * 100).toFixed(0)}% - 
         ${(record.maxCompensationRateOnValue * 100).toFixed(0)}%`,
    },
    {
      title: "Bồi thường tối thiểu phí VC",
      dataIndex: "minCompensationRateOnShippingFee",
      key: "minCompensationRateOnShippingFee",
      render: (v) => `${v} lần`,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (v) =>
        v ? (
          <Tag color="green">Đang áp dụng</Tag>
        ) : (
          <Tag color="red">Ngưng hiệu lực</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
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
          <Button
            onClick={() =>
              navigate(
                PATH_NAME.DASHBOARD_ADMIN_METRO_INSURANCE_DETAILS.replace(
                  ":insuranceId",
                  record.id
                )
              )
            }
          >
            Xem chi tiết
          </Button>
        </ConfigProvider>
      ),
    },
  ];

  return (
    <div className="admin-insurance-container">
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openAddModal}>
          + Tạo chính sách mới
        </Button>
        <Input.Search
          placeholder="Tìm theo tên chính sách"
          allowClear
          onChange={(e) => setSearchName(e.target.value)}
          onSearch={(value) => setSearchName(value)}
          style={{ width: 400 }}
        />
        <Select
          placeholder="Trạng thái"
          value={filteredStatusPolicies || undefined}
          onChange={(v) => setFilteredStatusPolicies(v || "")}
          style={{ width: 400 }}
          allowClear
          options={[
            {
              value: "active",
              label: <Tag color="green">Đang áp dụng</Tag>,
            },
            {
              value: "inactive",
              label: <Tag color="red">Ngưng hiệu lực</Tag>,
            },
          ]}
        />

        <Button
          className="clear-filter-button"
          icon={<ReloadOutlined />}
          onClick={() => {
            setFilteredStatusPolicies("");
            setSearchName("");
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
            dataSource={filteredPolicies}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </ConfigProvider>
      </Spin>

      <Modal
        title="Tạo chính sách bảo hiểm mới"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ isActive: true }}
        >
          <Form.Item
            label="Tên chính sách"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên chính sách" },
            ]}
          >
            <Input placeholder="Nhập tên chính sách" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={2} placeholder="Nhập mô tả" />
          </Form.Item>

          <Form.Item
            label="Phí cơ bản (VND)"
            name="baseFeeVnd"
            initialValue={0}
            rules={[{ required: true, message: "Nhập phí cơ bản" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Giá trị hàng tối đa (VND)"
            name="maxParcelValueVnd"
            initialValue={0}
            rules={[{ required: true, message: "Nhập giá trị tối đa" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Tỷ lệ phí bảo hiểm (%)"
            name="insuranceFeeRateOnValue"
            initialValue={0}
          >
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Tỷ lệ bồi thường tối thiểu theo giá trị (%)"
            name="minCompensationRateOnValue"
            initialValue={0}
          >
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Tỷ lệ bồi thường tối đa theo giá trị (%)"
            name="maxCompensationRateOnValue"
            initialValue={0}
          >
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Số lần bồi thường tối thiểu phí vận chuyển"
            name="minCompensationRateOnShippingFee"
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Tạo chính sách
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminInsurance;
