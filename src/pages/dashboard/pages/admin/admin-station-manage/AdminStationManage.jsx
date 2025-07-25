import './AdminStationManage.scss';

import { Button, Spin, Table } from 'antd';
import { useEffect, useState } from 'react';

import { getAllStations } from '../../../../../config/metroApi';

function AdminStationManage() {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                setLoading(true);
                const response = await getAllStations();
                setStations(response);
            } catch (error) {
                console.error('Failed to fetch stations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStations();
    }, []);

    const columns = [
        {
            title: 'Tên trạm (Tiếng Việt)',
            dataIndex: 'stationNameVi',
            key: 'stationNameVi',
        },
        {
            title: 'Tên trạm (Tiếng Anh)',
            dataIndex: 'stationNameEn',
            key: 'stationNameEn',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (value) => (
                <span>
                    {value ? 'Đang hoạt động' : 'Không hoạt động'}
                </span>
            ),
        },
        {
            title: 'Mã trạm',
            dataIndex: 'stationCode',
            key: 'stationCode',
        },
        {
            title: "Đóng trạm",
            key: "close",
            render: (_, record) => (
                <Button
                    className='close-station-button' onClick={() => {
                    }}>Đóng trạm</Button>
            )
        },
    ];

    return (
        <div className='admin-station-manage-container'>
            <Spin spinning={loading}>
                <Table
                    dataSource={stations.map((s, index) => ({ ...s, key: s.id || index }))}
                    columns={columns}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Spin>
        </div>
    );
}

export default AdminStationManage;
