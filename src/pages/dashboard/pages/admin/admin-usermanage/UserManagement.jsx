import "./UserManagement.scss";

import { Button, ConfigProvider, Empty, Input, Modal, Space, Table } from "antd";
import { useEffect, useState } from "react";

import { ReloadOutlined } from "@ant-design/icons";
import api from "../../../../../config/axios";
import { getAllCustomer } from "../../../../../config/metroApi";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [banUser, setBanUser] = useState(null);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);

  useEffect(() => {
    getAllCustomer()
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu người dùng", error);
      });
  }, []);

  const filteredData = users.filter((u) => {
    const keyword = searchText.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(keyword) ||
      u.email?.toLowerCase().includes(keyword)
    );
  });

  const onDisable = (user) => {
    setBanUser(user);
    setIsBanModalOpen(true);
  };

  const handleConfirmBan = async () => {
    if (!banUser) return;
    try {
      await api.delete(`/users/${banUser.id}`);
      toast.success(`Đã cấm người dùng ${banUser.fullName}`);
      setUsers((prev) => prev.filter((u) => u.id !== banUser.id));
      setIsBanModalOpen(false);
      setBanStaff(null);
    } catch (error) {
      console.error("Ban user error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi cấm người dùng này.";
      toast.error(errorMessage);
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Cấm",
      key: "ban",
      render: (_, record) => (
        <Button
          className="ban-user-button"
          danger
          onClick={() => onDisable(record)}
        >
          Cấm
        </Button>
      ),
    },

  ];

  const data = filteredData.map((user, index) => ({
    key: index,
    id: user.id,
    userName: user.userName,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
  }));

  return (
    <div className="user-management-container">
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm theo họ tên hoặc email..."
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button
          className="clear-filter-button"
          icon={<ReloadOutlined />}
          onClick={() => {
            setSearchText("");
          }}
        ></Button>
      </Space>
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
          dataSource={data}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </ConfigProvider>

      <Modal
        open={isBanModalOpen}
        title="Xác nhận cấm người dùng này khỏi hệ thống"
        onCancel={() => {
          setIsBanModalOpen(false);
          setBanUser(null);
        }}
        okText="Cấm"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        onOk={handleConfirmBan}
      >
        <p>
          Bạn có chắc chắn muốn cấm người dùng{" "}
          <strong>{banUser?.fullName}</strong>?
        </p>
        <p style={{ color: "red" }}>Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
}

export default UserManagement;
