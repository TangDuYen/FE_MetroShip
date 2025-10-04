import "./Profile.scss";

import {
  Avatar,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Upload,
} from "antd";
import React, { useEffect, useState } from "react";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";

import Sidebar from "../../components/sidebar_profile/Sidebar";
import api from "../../config/axios";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";
import { selectUser } from "../../redux/features/counterSlice";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

dayjs.extend(customParseFormat);


function Profile() {
  const user = useSelector(selectUser);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [banksList, setBanksList] = useState([]); // danh sách ngân hàng từ API
  const [bankForm] = Form.useForm();
  const [bankSubmitting, setBankSubmitting] = useState(false);


  const [form] = Form.useForm();

  const parseBirthDate = (raw) => {
    if (!raw) return null;
    const asIso = dayjs(raw);
    if (asIso.isValid()) return asIso;
    const ymd = dayjs(raw, "YYYY-MM-DD", true);
    if (ymd.isValid()) return ymd;
    const dmy = dayjs(raw, "DD/MM/YYYY", true);
    if (dmy.isValid()) return dmy;
    return null;
  };

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
          birthDate: parseBirthDate(data.birthDate),
          bankId: data.bankId || "",
          address: data.address || "",
          accountNo: data.accountNo || "",
          accountName: data.accountName || "",
          avatar: data.avatar || "",
        });

        setAvatarPreview(data.avatar || null);
        if (data.bankId || data.accountNo || data.accountName) {
          bankForm.setFieldsValue({
            bankId: data.bankId,
            accountNo: data.accountNo,
            accountName: data.accountName,
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, form]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await api.get("/transactions/vietqr/banks", {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const list = res.data?.data || [];
        setBanksList(list);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách ngân hàng:", error);
      }
    };
    fetchBanks();
  }, [user]);

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

      toast.success(uploadRes.data?.message || "Upload ảnh thành công!");
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      const errorMsg = error.response?.data?.message || "Lỗi khi upload ảnh!";
      toast.error(errorMsg);
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
      birthDate: values.birthDate
        ? values.birthDate.format("YYYY-MM-DD")
        : null,
      bankId: values.bankId,
      address: values.address,
      accountNo: values.accountNo,
      accountName: values.accountName,
      avatar: values.avatar,
    };

    // console.log("Payload gửi đi:", payload);

    try {
      const res = await api.put("/users", payload, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success(res.data?.message || "Cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật người dùng:", error);
      toast.error(error.response?.data?.message || "Cập nhật thất bại!");
    }
  };

  const handleBankSubmit = async (values) => {
    setBankSubmitting(true);
    try {
      const res = await api.put(
        "/users/bank-info",
        {
          bankId: values.bankId,
          accountNo: values.accountNo,
          accountName: values.accountName,
        },
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(res.data?.message || "Cập nhật thông tin ngân hàng thành công!");
      closeBankModal();
    } catch (error) {
      console.error("Lỗi cập nhật bank info:", error);
      toast.error(error.response?.data?.message || "Cập nhật bank info thất bại!");
    } finally {
      setBankSubmitting(false);
    }
  };

  const openBankModal = () => {
    setBankModalVisible(true);
  };

  const closeBankModal = () => {
    setBankModalVisible(false);
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
                  initialValues={{ birthDate: null }}
                >
                  <Form.Item name="avatar" label="Ảnh đại diện">
                    <div className="avatar">
                      <Spin spinning={uploading}>
                        <Avatar
                          size={64}
                          src={avatarPreview}
                          icon={<UserOutlined />}
                        />
                      </Spin>
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
                      showNow
                      defaultPickerValue={dayjs()}
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

                  <Form.Item label="Ngân hàng" shouldUpdate>
                    {() => {
                      const bankId = form.getFieldValue("bankId");
                      const bankName =
                        banksList.find((b) => b.id === bankId)?.shortName ||
                        banksList.find((b) => b.code === bankId)?.shortName ||
                        "-";
                      return <Input value={bankName} disabled />;
                    }}
                  </Form.Item>

                  <Form.Item name="accountNo" label="Số tài khoản">
                    <Input disabled />
                  </Form.Item>

                  <Form.Item name="accountName" label="Tên chủ tài khoản">
                    <Input disabled />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Lưu thay đổi
                    </Button>
                  </Form.Item>
                  <Form.Item>
                    <Button type="dashed" onClick={openBankModal}>
                      Thêm / Cập nhật thông tin ngân hàng
                    </Button>
                  </Form.Item>
                </Form>
              </Spin>
            </Card>

            <Modal
              title="Cập nhật thông tin ngân hàng"
              visible={bankModalVisible}
              onCancel={closeBankModal}
              footer={null}
            >
              <Form
                form={bankForm}
                layout="vertical"
                onFinish={handleBankSubmit}
              >
                <Form.Item
                  name="bankId"
                  label="Ngân hàng"
                  rules={[{ required: true, message: "Chọn ngân hàng" }]}
                >
                  <Select
                    placeholder="Chọn ngân hàng"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {banksList.map((bank) => (
                      <Option key={bank.id} value={bank.id}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {bank.logo && (
                            <img
                              src={bank.logo}
                              alt={bank.shortName}
                              style={{
                                width: 24,
                                height: 24,
                                marginRight: 8,
                              }}
                            />
                          )}
                          <span>{bank.shortName}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="accountNo"
                  label="Số tài khoản"
                  rules={[{ required: true, message: "Nhập số tài khoản" }]}
                >
                  <Input placeholder="Nhập số tài khoản" />
                </Form.Item>
                <Form.Item
                  name="accountName"
                  label="Tên chủ tài khoản"
                  rules={[{ required: true, message: "Nhập tên chủ tài khoản" }]}
                >
                  <Input placeholder="Nhập tên chủ tài khoản" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={bankSubmitting}
                    style={{ width: "100%" }}
                  >
                    Lưu thông tin ngân hàng
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Profile;
