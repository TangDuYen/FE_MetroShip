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
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./AdminProfile.scss";
import { useSelector } from "react-redux";
import { selectUser } from "../../../../../redux/features/counterSlice";
import api from "../../../../../config/axios";

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
    </div>
  );
}

export default AdminProfile;
