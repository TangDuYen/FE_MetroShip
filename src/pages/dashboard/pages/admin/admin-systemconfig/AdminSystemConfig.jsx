import { useEffect, useState } from "react";
import "./AdminSystemConfig.scss";
import { toast } from "react-toastify";
import {
  Button,
  Col,
  ConfigProvider,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Spin,
  Switch,
  Table,
} from "antd";
import api from "../../../../../config/axios";
import { EditOutlined, ReloadOutlined, SyncOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
function AdminSystemConfig() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [includeDeactivated, setIncludeDeactivated] = useState(false);
  //Modal update
  const [editingConfig, setEditingConfig] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal đổi giá trị
  const [changingConfig, setChangingConfig] = useState(null);
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);

  const [searchKey, setSearchKey] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [typeOptions, setTypeOptions] = useState([]);
  const [typeMap, setTypeMap] = useState({});

  const typeNameMap = {
    System: "Hệ thống",
    Policy: "Chính sách",
  };

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/system-configs?isIncludeDeactivated=${includeDeactivated}`
      );
      const items = res.data.data.items || [];
      setConfigs(items);

      // Lấy danh sách loại và mapping name -> id
      const uniqueTypes = [];
      const map = {};

      items.forEach((i) => {
        if (i.configTypeName && i.configType) {
          map[i.configTypeName] = i.configType;
          if (!uniqueTypes.includes(i.configTypeName)) {
            uniqueTypes.push(i.configTypeName);
          }
        }
      });

      setTypeOptions(uniqueTypes);
      setTypeMap(map);
    } catch (err) {
      console.error(err);
      toast.error("Không tải được danh sách cấu hình");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [includeDeactivated]);

  const handleUpdateConfig = async (values) => {
    try {
      const res = await api.put("/system-configs", {
        id: editingConfig.id,
        description: values.description,
        configType: typeMap[values.configTypeName],
      });

      toast.success(res.data?.data || "Cập nhật thành công");
      setIsModalOpen(false);
      fetchConfigs();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleChangeValue = (record) => {
    setChangingConfig(record);
    setIsValueModalOpen(true);
  };

  const handleSubmitChangeValue = async (values) => {
    try {
      const res = await api.post("/system-configs/config-value", {
        configKey: changingConfig.configKey,
        configValue: values.configValue,
      });

      toast.success(res.data?.data || "Đổi giá trị thành công");
      setIsValueModalOpen(false);
      fetchConfigs();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Đổi giá trị thất bại");
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      render: (_, __, index) => index + 1,
      width: 70,
    },
    {
      title: "Key",
      dataIndex: "configKey",
    },
    {
      title: "Giá trị",
      dataIndex: "configValue",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
    {
      title: "Loại",
      dataIndex: "configTypeName",
      render: (val) => typeNameMap[val] || val,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (isActive) =>
        isActive ? (
          <span style={{ color: "green" }}>Hoạt động</span>
        ) : (
          <span style={{ color: "red" }}>Vô hiệu hóa</span>
        ),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "lastUpdatedAt",
      render: (val) => new Date(val).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingConfig(record);
              setIsModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Button
            icon={<SyncOutlined />}
            onClick={() => handleChangeValue(record)}
            danger
          >
            Đổi giá trị
          </Button>
        </div>
      ),
    },
  ];

  const filteredConfigs = configs.filter((c) => {
    let ok = true;
    if (
      searchKey &&
      !c.configKey.toLowerCase().includes(searchKey.toLowerCase())
    ) {
      ok = false;
    }
    if (filterType && c.configTypeName !== filterType) {
      ok = false;
    }
    if (filterDate) {
      const configDate = dayjs(c.lastUpdatedAt).format("YYYY-MM-DD");
      if (configDate !== filterDate.format("YYYY-MM-DD")) {
        ok = false;
      }
    }
    return ok;
  });

  return (
    <div className="admin-system-config">
      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8 }}>Hiển thị cả vô hiệu hóa:</span>
        <Switch
          checked={includeDeactivated}
          onChange={(checked) => setIncludeDeactivated(checked)}
        />
      </div>

      <div style={{ marginBottom: 16, display: "flex", gap: 16 }}>
        <Input.Search
          placeholder="Tìm theo Key"
          style={{ width: 400 }}
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
        />
        <Select
          placeholder="Chọn loại"
          style={{ width: 200 }}
          allowClear
          value={filterType}
          onChange={(val) => setFilterType(val)}
        >
          {typeOptions.map((t) => (
            <Select.Option key={t} value={t}>
              {typeNameMap[t] || t}
            </Select.Option>
          ))}
        </Select>
        <DatePicker
          placeholder="Ngày cập nhật"
          value={filterDate}
          onChange={(val) => setFilterDate(val)}
          format="DD/MM/YYYY"
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setSearchKey("");
            setFilterType(null);
            setFilterDate(null);
          }}
        ></Button>
      </div>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <ConfigProvider
          renderEmpty={() => (
            <Empty
              description="Không có dữ liệu"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredConfigs}
            pagination={{ pageSize: 10 }}
          />
        </ConfigProvider>
      </Spin>

      {/* Modal update config */}
      <Modal
        title="Cập nhật cấu hình"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        {editingConfig && (
          <Form
            layout="vertical"
            initialValues={{
              configKey: editingConfig.configKey,
              configValue: editingConfig.configValue,
              description: editingConfig.description,
              configTypeName: editingConfig.configTypeName,
            }}
            onFinish={handleUpdateConfig}
          >
            <Form.Item label="Key" name="configKey">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Giá trị" name="configValue">
              <Input disabled placeholder="Dùng Đổi giá trị để thay đổi" />
            </Form.Item>
            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: "Mô tả không được để trống" }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="Loại"
              name="configTypeName"
              rules={[{ required: true, message: "Vui lòng chọn loại" }]}
            >
              <Select placeholder="Chọn loại">
                {typeOptions.map((t) => (
                  <Select.Option key={t} value={t}>
                    {t}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              Lưu
            </Button>
          </Form>
        )}
      </Modal>

      {/* Modal đổi giá trị */}
      <Modal
        title={`Thay đổi giá trị: ${changingConfig?.configKey}`}
        open={isValueModalOpen}
        onCancel={() => setIsValueModalOpen(false)}
        footer={null}
      >
        {changingConfig && (
          <Form layout="vertical" onFinish={handleSubmitChangeValue}>
            <Form.Item
              label="Giá trị mới"
              name="configValue"
              rules={[{ required: true, message: "Vui lòng nhập giá trị mới" }]}
            >
              <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              Xác nhận thay đổi
            </Button>
          </Form>
        )}
      </Modal>
    </div>
  );
}

export default AdminSystemConfig;
