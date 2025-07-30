import React from "react";
import "./ChangePassword.scss";
import Sidebar from "../../components/sidebar_profile/Sidebar";
import api from "../../config/axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/features/counterSlice";
import { Form, Input, Button, Typography, Card } from "antd";

const { Title } = Typography;
function ChangePassword() {
    const user = useSelector(selectUser);
    const changePassword = async (values) => {
    try {
      await api.post(
        "auth/password/change",
        {
          oldPassword: values.oldPassword,
          password: values.newPassword,
          confirmPassword: values.confirmPassword,
          userName: user.UserName,
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
      toast.error("Đổi mật khẩu thất bại!");
    }
  };
  return (
    <div className="change-password">
      <section className="change-password-wrapper">
        <div className="change-password-row">
          <div className="change-password-left">
            <Sidebar />
          </div>
          <div className="change-password-right">
            <Card title="ĐỔI MẬT KHẨU" bordered={false}>
            <Form layout="vertical" onFinish={changePassword}>
              <Form.Item
                label="Mật khẩu cũ"
                name="oldPassword"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu cũ" },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới" },
                ]}
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
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ChangePassword;
