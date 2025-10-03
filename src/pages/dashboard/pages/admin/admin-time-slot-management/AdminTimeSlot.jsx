import "./AdminTimeSlot.scss";

import {
  Button,
  ConfigProvider,
  Empty,
  Form,
  Modal,
  Spin,
  Table,
  Tag,
  TimePicker,
} from "antd";
import React, { useEffect, useState } from "react";

import { CgEnter } from "react-icons/cg";
import { ReloadOutlined } from "@ant-design/icons";
import api from "../../../../../config/axios";
import dayjs from "dayjs";
import { getAllTimeSlot } from "../../../../../config/metroApi";
import { toast } from "react-toastify";

function AdminTimeSlot() {
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form] = Form.useForm();

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const data = await getAllTimeSlot();
      setTimeSlots(data || []);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu time slot:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (record) => {
    setSelectedSlot(record);
    form.setFieldsValue({
      openTime: dayjs(record.openTime, "HH:mm:ss"),
      closeTime: dayjs(record.closeTime, "HH:mm:ss"),
      startReceivingTime: record.startReceivingTime
        ? dayjs(record.startReceivingTime, "HH:mm:ss")
        : null,
      cutOffTime: record.cutOffTime
        ? dayjs(record.cutOffTime, "HH:mm:ss")
        : null,
    });
    setOpenModal(true);
  };

  const handleUpdateTimeSlot = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        id: selectedSlot.id,
        openTime: values.openTime.format("HH:mm:ss"),
        closeTime: values.closeTime.format("HH:mm:ss"),
        startReceivingTime: values.startReceivingTime.format("HH:mm:ss"),
        cutOffTime: values.cutOffTime.format("HH:mm:ss"),
      };

      console.log("Update payload:", payload);

      const res = await api.put("/metro-time-slots", payload);
      toast.success(res.data?.message || "Cập nhật thành công!");
      setOpenModal(false);
      fetchTimeSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Ca trực",
      dataIndex: "shift",
      render: (val) => `Ca ${val}`,
      width: 120,
    },
    {
      title: "Giờ mở",
      dataIndex: "openTime",
      render: (val) => val?.slice(0, 5) || "-",
      width: 120,
    },
    {
      title: "Giờ đóng",
      dataIndex: "closeTime",
      render: (val) => val?.slice(0, 5) || "-",
      width: 120,
    },
    {
      title: "Giờ bắt đầu nhận hàng",
      dataIndex: "startReceivingTime",
      render: (val) => val?.slice(0, 5) || "-",
      width: 120,
    },
    {
      title: "Giờ kết thúc nhận hàng",
      dataIndex: "cutOffTime",
      render: (val) => val?.slice(0, 5) || "-",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "isAbnormal",
      render: (val) =>
        val ? (
          <Tag color="red">Bất thường</Tag>
        ) : (
          <Tag color="green">Bình thường</Tag>
        ),
      width: 100,
    },
    {
      title: "Hành động",
      width: 120,
      render: (_, record) => (
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
          <Button onClick={() => handleUpdate(record)}>Cập nhật</Button>
        </ConfigProvider>
      ),
    },
  ];

  return (
    <div className="admin-time-slot">
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
            columns={columns}
            dataSource={timeSlots}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </ConfigProvider>
      </Spin>

      <Modal
        title={`Cập nhật Ca ${selectedSlot?.shift}`}
        open={openModal}
        onOk={handleUpdateTimeSlot}
        onCancel={() => setOpenModal(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
        styles={{
          header: {
            textAlign: "center",
          },
        }}
      >
        <Form form={form} layout="vertical">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <Form.Item name="openTime" label="Giờ mở">
              <TimePicker
                format="HH:mm"
                style={{ width: "100%" }}
                placeholder="Chọn giờ"
                onChange={(value) => {
                  if (value) {
                    // Lấy giờ mở - 30 phút
                    const cutOff = value.subtract(30, "minute");
                    form.setFieldsValue({
                      cutOffTime: cutOff,
                    });
                  } else {
                    form.setFieldsValue({
                      cutOffTime: null,
                    });
                  }
                }}
              />
            </Form.Item>

            <Form.Item name="closeTime" label="Giờ đóng">
              <TimePicker
                format="HH:mm"
                style={{ width: "100%" }}
                placeholder="Chọn giờ"
              />
            </Form.Item>

            <Form.Item name="startReceivingTime" label="Giờ bắt đầu nhận hàng">
              <TimePicker
                format="HH:mm"
                style={{ width: "100%" }}
                placeholder="Chọn giờ"
              />
            </Form.Item>

            <Form.Item name="cutOffTime" label="Giờ kết thúc nhận hàng">
              <TimePicker
                format="HH:mm"
                style={{ width: "100%" }}
                placeholder="Chọn giờ"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminTimeSlot;
