import './MetroTrainManagement.scss';

import { Button, Form, Input, Modal, Popconfirm, Space, Spin, Table, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

import api from '../../../../../config/axios';
import { getAllMetroTrains } from '../../../../../config/metroApi';

function MetroTrainManagement() {
  const [metroTrains, setMetroTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxCapacity, setMaxCapacity] = useState(0);
  const [maxVolume, setMaxVolume] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    try {
      setLoading(true);
      const data = await getAllMetroTrains();

      setMetroTrains(data.data.items);

      const additionalData = data.additionalData[0];
      const capacity = additionalData.find(item => item.configKey === 'MAX_CAPACITY_PER_LINE_KG');
      const volume = additionalData.find(item => item.configKey === 'MAX_CAPACITY_PER_LINE_M3');

      setMaxCapacity(capacity ? capacity.configValue : "Không xác định");
      setMaxVolume(volume ? volume.configValue : "Không xác định");
    } catch (err) {
      message.error("Không thể tải dữ liệu tàu");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    form.resetFields();
    setEditingTrain(null);
    setIsModalOpen(true);
  };

  const openEditModal = (train) => {
    setEditingTrain(train);
    form.setFieldsValue(train);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/metro-trains/${id}`);
      message.success('Đã xoá tàu thành công!');
      fetchTrains();
    } catch {
      message.error('Xoá tàu thất bại!');
    }
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        try {
          if (editingTrain) {
            await api.put(`/api/metro-trains/${editingTrain.id}`, values);
            message.success('Cập nhật tàu thành công!');
          } else {
            await api.post('/api/metro-trains', values);
            message.success('Thêm tàu thành công!');
          }

          setIsModalOpen(false);
          form.resetFields();
          fetchTrains();
        } catch (err) {
          message.error('Gửi dữ liệu thất bại!');
        }
      })
      .catch((info) => {
        console.error('Validate Failed:', info);
      });
  };

  const columns = [
    {
      title: 'STT',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: 'Mã tàu',
      dataIndex: 'trainCode',
    },
    {
      title: 'Model tàu',
      dataIndex: 'modelName',
    },
    {
      title: 'Trọng tải tàu (kg)',
      render: () => maxCapacity,
    },
    {
      title: 'Dung tích tàu (m³)',
      render: () => maxVolume,
    },
    {
      title: 'Hành động',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title="Xác nhận xoá tàu này?"
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
    <div className="metro-train-management-container">
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Thêm tàu
        </Button>
      </div>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <Table
          columns={columns}
          dataSource={metroTrains}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      <Modal
        title={editingTrain ? "Cập nhật tàu" : "Thêm tàu mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText={editingTrain ? "Lưu" : "Thêm"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="trainCode"
            label="Mã tàu"
            rules={[{ required: true, message: 'Vui lòng nhập mã tàu' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="modelName"
            label="Model tàu"
            rules={[{ required: true, message: 'Vui lòng nhập model tàu' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MetroTrainManagement;
