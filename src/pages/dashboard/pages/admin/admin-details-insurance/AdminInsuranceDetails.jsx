import './AdminInsuranceDetails.scss';

import { Card, Table } from 'antd';
import React, { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';

const fakeInsurancePolicies = [
  {
    id: 'P001',
    name: 'Chính sách bảo hiểm I',
    effectiveFrom: '2025-01-01',
    effectiveTo: '2025-12-31',
    items: [
      { category: 'Điện tử', feeVnd: 50000 },
      { category: 'Đồ gỗ', feeVnd: 75000 },
    ],
  },
  {
    id: 'P002',
    name: 'Chính sách bảo hiểm II',
    effectiveFrom: '2025-08-01',
    effectiveTo: null,
    items: [
      { category: 'Thực phẩm', feeVnd: 30000 },
      { category: 'Thời trang', feeVnd: 40000 },
    ],
  },
];


function AdminInsuranceDetails() {
  const { insuranceId } = useParams();
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    const found = fakeInsurancePolicies.find((p) => p.id === insuranceId);
    setPolicy(found);
  }, [insuranceId]);

  if (!policy) return <div>Không tìm thấy chính sách bảo hiểm.</div>;

  const itemColumns = [
    {
      title: 'Danh mục hàng hóa',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Phí bảo hiểm (VND)',
      dataIndex: 'feeVnd',
      key: 'feeVnd',
      render: (fee) => fee.toLocaleString(),
      align: 'right',
    },
  ];

  return (
    <div className="admin-insurance-details-container">
      <Card title={policy.name} style={{ marginBottom: 20 }}>
        <p><strong>Hiệu lực từ:</strong> {dayjs(policy.effectiveFrom).format('DD/MM/YYYY')}</p>
        <p><strong>Đến ngày:</strong> {policy.effectiveTo ? dayjs(policy.effectiveTo).format('DD/MM/YYYY') : 'Không giới hạn'}</p>
      </Card>

      <Card title="Danh sách hàng hóa áp dụng">
        <Table
          columns={itemColumns}
          dataSource={policy.items}
          rowKey={(item) => item.category}
          pagination={false}
        />
      </Card>
    </div>
  );
}

export default AdminInsuranceDetails;
