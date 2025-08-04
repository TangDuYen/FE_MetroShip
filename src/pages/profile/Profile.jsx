import React, { useEffect, useState } from "react";
import "./Profile.scss";
import Sidebar from "../../components/sidebar_profile/Sidebar";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/features/counterSlice";
import api from "../../config/axios";
import { toast } from "react-toastify";
import { Card, DatePicker, Form, Input, Button, Upload, Avatar, Spin } from "antd";
import moment from "moment";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";

function Profile() {
  const user = useSelector(selectUser);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id || !user?.token) return;
      setLoading(true);

      try {
        const response = await api.get(`users/${user.id}`, {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = response.data.data;

        form.setFieldsValue({
          id: data.id || "",
          userName: data.userName || "",
          fullName: data.fullName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          birthDate: data.birthDate ? moment(data.birthDate) : null,
          bankId: data.bankId || "",
          address: data.address || "",
          accountNo: data.accountNo || "",
          accountName: data.accountName || "",
          avatar: data.avatar || "",
        });

        setAvatarPreview(data.avatar || null);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, form]);

  const handleAvatarChange = async ({ file }) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const uploadRes = await api.post("/media/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = uploadRes.data?.data || uploadRes.data?.secure_url;
      if (!imageUrl) {
        toast.error("Không lấy được link ảnh sau khi upload.");
        return;
      }

      // Cập nhật preview + giá trị form
      setAvatarPreview(imageUrl);
      form.setFieldsValue({ avatar: imageUrl });

      toast.success("Upload ảnh thành công!");
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      toast.error("Lỗi khi upload ảnh!");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveInfomationUser = async (values) => {
    const payload = {
      // id: user.id,
      userName: values.userName,
      fullName: values.fullName,
      email: values.email,
      birthDate: values.birthDate ? values.birthDate.toISOString() : null,
      bankId: values.bankId,
      address: values.address,
      accountNo: values.accountNo,
      accountName: values.accountName,
      avatar: values.avatar,
    };

    console.log("Payload gửi đi:", payload);

    try {
      await api.put("/users", payload, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("Cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật người dùng:", error);
      toast.error("Cập nhật thất bại!");
    }
  };

  return (
    <div className="profile">
      <section className="profile-wrapper">
        <div className="profile-row">
          <div className="profile-left">
            <Sidebar />
          </div>
          <div className="profile-right">
            <Card title="THÔNG TIN TÀI KHOẢN" bordered={false}>
              <Spin spinning={loading} tip="Đang tải dữ liệu...">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSaveInfomationUser}
                >
                  <Form.Item name="avatar" label="Ảnh đại diện">
                    <div className="avatar">
                      <Avatar
                        size={64}
                        src={avatarPreview}
                        icon={<UserOutlined />}
                      />
                      <Upload
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={({ file }) => handleAvatarChange({ file })}
                      >
                        <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                      </Upload>
                    </div>
                  </Form.Item>
                  <Form.Item name="userName" label="Tên đăng nhập">
                    <Input />
                  </Form.Item>

                  <Form.Item name="fullName" label="Tên khách hàng">
                    <Input />
                  </Form.Item>

                  <Form.Item name="email" label="Email">
                    <Input type="email" />
                  </Form.Item>

                  <Form.Item label="Số điện thoại" name="phoneNumber">
                    <Input readOnly />
                  </Form.Item>

                  <Form.Item name="birthDate" label="Ngày sinh">
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                      placeholder="Chọn ngày sinh"
                    />
                  </Form.Item>

                  <Form.Item name="bankId" label="Chứng minh thư/ Mã số thuế">
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="address"
                    label="Địa chỉ thường trú/ Địa chỉ xuất hóa đơn"
                  >
                    <Input placeholder="Nhập địa chỉ" />
                  </Form.Item>

                  <Form.Item name="accountNo" label="Số tài khoản">
                    <Input placeholder="Nhập số tài khoản" />
                  </Form.Item>

                  <Form.Item name="accountName" label="Tên chủ tài khoản">
                    <Input placeholder="Nhập tên chủ tài khoản" />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Lưu thay đổi
                    </Button>
                  </Form.Item>
                </Form>
              </Spin>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Profile;
