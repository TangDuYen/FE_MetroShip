import "./UserManagement.scss";

import { Button, Input, Space, Table } from "antd";
import { useEffect, useState } from "react";

import { ReloadOutlined } from "@ant-design/icons";
import { getAllCustomer } from "../../../../../config/metroApi";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");

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

  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
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
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

export default UserManagement;
