import './AdminInsurance.scss';

import { Button, Card, Table } from 'antd';
import { useEffect, useState } from 'react';

import { PATH_NAME } from '../../../../../constants/pathname';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

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
        effectiveFrom: '2025-12-31',
        effectiveTo: null,
        items: [
            { category: 'Thực phẩm', feeVnd: 30000 },
            { category: 'Thời trang', feeVnd: 40000 },
        ],
    },
];


function AdminInsurance() {
    const [policies, setPolicies] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setPolicies(fakeInsurancePolicies);
    }, []);

    const columns = [
        {
            title: 'Tên chính sách',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Hiệu lực từ',
            dataIndex: 'effectiveFrom',
            key: 'effectiveFrom',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Đến ngày',
            dataIndex: 'effectiveTo',
            key: 'effectiveTo',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'Không giới hạn',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() =>
                        navigate(
                            PATH_NAME.DASHBOARD_ADMIN_METRO_INSURANCE_DETAILS.replace(':insuranceId', record.id)
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
            <Card title="Danh sách chính sách bảo hiểm">
                <Table columns={columns} dataSource={policies} rowKey="id" pagination={false} />
            </Card>
        </div>
    );
}

export default AdminInsurance;
