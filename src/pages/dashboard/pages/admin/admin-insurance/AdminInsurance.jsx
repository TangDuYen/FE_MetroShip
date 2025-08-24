import "./AdminInsurance.scss";

import {
  Button,
  Card,
  ConfigProvider,
  Empty,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import { useEffect, useState } from "react";

import { PATH_NAME } from "../../../../../constants/pathname";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getAllInsurance } from "../../../../../config/metroApi";
import { useNavigate } from "react-router-dom";

// const fakeInsurancePolicies = [
//   {
//     id: "P001",
//     name: "Chính sách bảo hiểm I",
//     effectiveFrom: "2025-01-01",
//     effectiveTo: "2025-12-31",
//     items: [
//       { category: "Điện tử", feeVnd: 50000 },
//       { category: "Đồ gỗ", feeVnd: 75000 },
//     ],
//   },
//   {
//     id: "P002",
//     name: "Chính sách bảo hiểm II",
//     effectiveFrom: "2025-12-31",
//     effectiveTo: null,
//     items: [
//       { category: "Thực phẩm", feeVnd: 30000 },
//       { category: "Thời trang", feeVnd: 40000 },
//     ],
//   },
// ];

function AdminInsurance() {
  const [policies, setPolicies] = useState([]);
  const navigate = useNavigate();
  const [filteredStatusPolicies, setFilteredStatusPolicies] = useState("");
  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAllInsurance();
        setPolicies(data || []);
      } catch (error) {
        console.error("Lỗi fetch dữ liệu bảo hiểm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPolicies = policies.filter((item) => {
    const matchName = item.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const matchStatus =
      filteredStatusPolicies === ""
        ? true
        : filteredStatusPolicies === "active"
        ? item.isActive
        : !item.isActive;

    return matchName && matchStatus;
  });

  const columns = [
    {
      title: "Tên chính sách",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Hiệu lực từ",
      dataIndex: "validFrom",
      key: "validFrom",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    // {
    //   title: "Đến ngày",
    //   dataIndex: "effectiveTo",
    //   key: "effectiveTo",
    //   render: (date) =>
    //     date ? dayjs(date).format("DD/MM/YYYY") : "Không giới hạn",
    // },
    {
      title: "Phí cơ bản",
      dataIndex: "baseFeeVnd",
      key: "baseFeeVnd",
      render: (v) => v?.toLocaleString("vi-VN") + " VND",
    },
    {
      title: "Giá trị hàng tối đa",
      dataIndex: "maxParcelValueVnd",
      key: "maxParcelValueVnd",
      render: (v) => v?.toLocaleString("vi-VN") + " VND",
    },
    {
      title: "Tỷ lệ phí bảo hiểm",
      dataIndex: "insuranceFeeRateOnValue",
      key: "insuranceFeeRateOnValue",
      render: (v) => `${(v * 100).toFixed(2)}%`,
    },
    {
      title: "Bồi thường (min-max)",
      key: "compensation",
      render: (_, record) =>
        `${(record.minCompensationRateOnValue * 100).toFixed(0)}% - 
         ${(record.maxCompensationRateOnValue * 100).toFixed(0)}%`,
    },
    {
      title: "Bồi thường tối đa phí VC",
      dataIndex: "maxCompensationRateOnShippingFee",
      key: "maxCompensationRateOnShippingFee",
      render: (v) => `${v} lần`,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (v) =>
        v ? (
          <Tag color="green">Đang áp dụng</Tag>
        ) : (
          <Tag color="red">Ngưng hiệu lực</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() =>
            navigate(
              PATH_NAME.DASHBOARD_ADMIN_METRO_INSURANCE_DETAILS.replace(
                ":insuranceId",
                record.id
              )
            )
          }
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="admin-insurance-container">
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm theo tên chính sách"
          allowClear
          onChange={(e) => setSearchName(e.target.value)}
          onSearch={(value) => setSearchName(value)}
          style={{ width: 400 }}
        />
        <Select
          placeholder="Trạng thái"
          value={filteredStatusPolicies}
          onChange={(v) => setFilteredStatusPolicies(v)}
          style={{ width: 400 }}
          allowClear
        >
          <Option value="active">
            <Tag color="green">Đang áp dụng</Tag>
          </Option>
          <Option value="inactive">
            {" "}
            <Tag color="red">Ngưng hiệu lực</Tag>
          </Option>
        </Select>
        <Button
          className="clear-filter-button"
          icon={<ReloadOutlined />}
          onClick={() => {
            setFilteredStatusPolicies([]);
            setSearchName("");
          }}
        ></Button>
      </Space>
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
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
            dataSource={filteredPolicies}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </ConfigProvider>
      </Spin>
    </div>
  );
}

export default AdminInsurance;
