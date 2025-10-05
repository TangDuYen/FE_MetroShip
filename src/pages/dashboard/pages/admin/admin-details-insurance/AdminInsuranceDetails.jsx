import "./AdminInsuranceDetails.scss";

import { Button, Card, Spin, Table, Tag } from "antd";
import React, { useEffect, useState } from "react";

import api from "../../../../../config/axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

// const fakeInsurancePolicies = [
//   {
//     id: 'P001',
//     name: 'Chính sách bảo hiểm I',
//     effectiveFrom: '2025-01-01',
//     effectiveTo: '2025-12-31',
//     items: [
//       { category: 'Điện tử', feeVnd: 50000 },
//       { category: 'Đồ gỗ', feeVnd: 75000 },
//     ],
//   },
//   {
//     id: 'P002',
//     name: 'Chính sách bảo hiểm II',
//     effectiveFrom: '2025-08-01',
//     effectiveTo: null,
//     items: [
//       { category: 'Thực phẩm', feeVnd: 30000 },
//       { category: 'Thời trang', feeVnd: 40000 },
//     ],
//   },
// ];

function AdminInsuranceDetails() {
  const { insuranceId } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/insurance-policies/${insuranceId}`);
      setPolicy(res.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể lấy chi tiết chính sách";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (insuranceId) fetchPolicy();
  }, [insuranceId]);

  if (loading) return <Spin tip="Đang tải chi tiết chính sách..." />;
  if (!policy) return <div>Không tìm thấy chính sách bảo hiểm.</div>;

  const handleToggleActive = async (record) => {
    const action = record.isActive ? "deactivation" : "activation";

    try {
      setLoading(true);
      const res = await api.put(`/insurance-policies/${action}/${record.id}`);
      toast.success(res.data?.data || "Cập nhật trạng thái thành công");
      fetchPolicy();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      const msg =
        error.response?.data?.data || "Cập nhật trạng thái thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  const detailColumns = [
    { title: "Thông tin", dataIndex: "label", key: "label" },
    { title: "Giá trị", dataIndex: "value", key: "value" },
  ];

  const detailData = [
    { label: "Phí cơ bản (VND)", value: policy.baseFeeVnd.toLocaleString() },
    {
      label: "Giá trị kiện hàng tối đa (VND)",
      value: policy.maxParcelValueVnd.toLocaleString(),
    },
    {
      label: "Tỷ lệ phí bảo hiểm (%)",
      value: policy.insuranceFeeRateOnValue * 100 + "%",
    },
    {
      label: "Tỷ lệ bồi thường tối đa (%)",
      value: policy.maxCompensationRateOnValue * 100 + "%",
    },
    {
      label: "Tỷ lệ bồi thường tối thiểu (%)",
      value: policy.minCompensationRateOnValue * 100 + "%",
    },
    {
      label: "Tỷ lệ bồi thường tối thiểu phí ship (%)",
      value: policy.minCompensationRateOnShippingFee * 100 + "%",
    },
    {
      label: "Trạng thái",
      value: policy.isActive ? (
        <Tag color="success">Đang áp dụng</Tag>
      ) : (
        <Tag color="error">Ngừng áp dụng</Tag>
      ),
    },
  ];

  return (
    <div className="admin-insurance-details-container">
      <Card title={policy.name} style={{ marginBottom: 20 }}>
        <p>
          <strong>Hiệu lực từ:</strong>{" "}
          {policy.validForm
            ? dayjs(policy.validForm).format("DD/MM/YYYY")
            : "Chưa có ngày hiệu lực"}
        </p>
        <p>
          <strong>Đến ngày:</strong>{" "}
          {policy.validTo
            ? dayjs(policy.validTo).format("DD/MM/YYYY")
            : "Không giới hạn"}
        </p>

        {!policy.validTo && (
          <Button
            type={policy.isActive ? "default" : "primary"}
            danger={policy.isActive}
            onClick={() => handleToggleActive(policy)}
            style={{ marginTop: 10 }}
          >
            {policy.isActive ? "Ngưng hiệu lực" : "Kích hoạt"}
          </Button>
        )}
      </Card>

      <Card title="Chi tiết chính sách">
        <Table
          columns={detailColumns}
          dataSource={detailData}
          rowKey={(row) => row.label}
          pagination={false}
          bordered
        />
      </Card>
    </div>
  );
}

export default AdminInsuranceDetails;
