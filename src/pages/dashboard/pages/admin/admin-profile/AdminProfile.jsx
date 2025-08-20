import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Avatar,
  Typography,
  Row,
  Col,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./AdminProfile.scss";
import { useSelector } from "react-redux";
import { selectUser } from "../../../../../redux/features/counterSlice";
import api from "../../../../../config/axios";
import { toast } from "react-toastify";

const { Title } = Typography;

function AdminProfile() {
  const user = useSelector(selectUser);
  const [form] = Form.useForm();
  const [userData, setUserData] = useState({
    userName: "",
    fullName: "",
    email: "",
    avatar: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id || !user?.token) return;
      try {
        const response = await api.get(`users/${user.id}`, {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = response.data.data;
        const newUser = {
          userName: data.userName || "",
          fullName: data.fullName || "",
          email: data.email || "",
          avatar: data.avatar || "",
        };

        setUserData(newUser);
        form.setFieldsValue(newUser);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
      }
    };

    fetchUserData();
  }, [user, form]);

  const handleSaveInformationUser = (values) => {
    console.log("Dữ liệu submit:", values);
  };

  const handleUpload = (info) => {
    const newAvatar = URL.createObjectURL(info.file);
    setUserData({ ...userData, avatar: newAvatar });
  };

  const changePassword = async (values) => {
    try {
      await api.post(
        "auth/password/change",
        {
          oldPassword: values.oldPassword,
          password: values.newPassword,
          confirmPassword: values.confirmPassword,
          userName: userData.userName,
        },
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      toast.success("Đổi mật khẩu thành công!");
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      const errMessage =
      error.response?.data?.message || "Đổi mật khẩu thất bại!";
    toast.error(errMessage);
    }
  };

  return (
    <div className="admin-profile-container">
      <div className="admin-profile">
        <Title level={2}>Thông tin tài khoản</Title>
        <Row gutter={24}>
          {/* Cột trái - Avatar */}
          <Col span={8} style={{ textAlign: "center" }}>
            <Avatar size={150} src={userData.avatar} />
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleUpload}
            >
              <Button icon={<UploadOutlined />} style={{ marginTop: 16 }}>
                Đổi ảnh đại diện
              </Button>
            </Upload>
          </Col>

          {/* Cột phải - Form thông tin */}
          <Col span={16}>
            <Form
              form={form}
              layout="vertical"
              initialValues={userData}
              onFinish={handleSaveInformationUser}
            >
              <Form.Item
                label="Tên đăng nhập"
                name="userName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Tên người dùng"
                name="fullName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: "email", message: "Email không hợp lệ" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </div>

      <div className="admin-reset-password">
        <Title level={2}>Đổi mật khẩu</Title>
        <Form layout="vertical" onFinish={changePassword}>
          <Form.Item
            label="Mật khẩu cũ"
            name="oldPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp")
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default AdminProfile;
