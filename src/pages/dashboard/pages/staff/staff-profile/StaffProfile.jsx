import React, { useEffect, useState } from "react";
import "./StaffProfile.scss";
import {
  Form,
  Input,
  Button,
  Avatar,
  Typography,
  Row,
  Col,
  Upload,
  Spin,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import api from "../../../../../config/axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../../../../redux/features/counterSlice";
import { toast } from "react-toastify";

const { Title } = Typography;
function StaffProfile() {
  const user = useSelector(selectUser);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [userData, setUserData] = useState({
    userName: "",
    fullName: "",
    email: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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
        toast.error(
          error.response?.data?.message || "Không thể tải dữ liệu người dùng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, form]);

  const handleSaveInformationUser = async (values) => {
    if (!user?.token) return;
    setSavingProfile(true);

    const payload = {
      userName: values.userName,
      fullName: values.fullName,
      avatar: values.avatar || userData.avatar,
    };
    console.log("Payload update user:", payload);

    try {
      const res = await api.put("/users", payload, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success(res.data?.message || "Cập nhật thành công!");
      setUserData((prev) => ({
        ...prev,
        ...values,
      }));
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
      toast.error(error.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setSavingProfile(false);
    }
  };

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

      setUserData((prev) => ({ ...prev, avatar: imageUrl }));
      form.setFieldsValue({ avatar: imageUrl });
      toast.success(uploadRes.data?.message || "Upload ảnh thành công!");
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      toast.error(error.response?.data?.message || "Lỗi khi upload ảnh!");
    } finally {
      setUploading(false);
    }
  };

  const changePassword = async (values) => {
    setSavingPassword(true);
    try {
      const res = await api.post(
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

      toast.success(res.data?.message || "Đổi mật khẩu thành công!");
      passwordForm.resetFields([
        "oldPassword",
        "newPassword",
        "confirmPassword",
      ]);
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại!");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="staff-profile-container">
      <div className="staff-profile">
        <Title level={2}>Thông tin tài khoản</Title>
        <Row gutter={24}>
          {/* Cột trái - Avatar */}
          <Col span={8} style={{ textAlign: "center" }}>
            <Spin spinning={uploading}>
              <Avatar size={150} src={userData.avatar} />
            </Spin>
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleAvatarChange}
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
                <Input disabled style={{ fontWeight: "600" }} />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={savingProfile}
                >
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </div>
      <div className="staff-reset-password">
        <Title level={2}>Đổi mật khẩu</Title>
        <Form form={passwordForm} layout="vertical" onFinish={changePassword}>
          <Form.Item
            label="Mật khẩu cũ"
            name="oldPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu cũ" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
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
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={savingPassword}
            >
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default StaffProfile;
