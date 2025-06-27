import './MetroTrainManagement.scss';

import { Spin, Table } from 'antd';
import { useEffect, useState } from 'react';

import { getAllMetroTrains } from '../../../../../config/metroApi';

function MetroTrainManagement() {
    const [metroTrains, setMetroTrains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [maxCapacity, setMaxCapacity] = useState(0);  // Trọng tải của tàu
    const [maxVolume, setMaxVolume] = useState(0);  // Dung tích của tàu

    useEffect(() => {
        setLoading(true);
        getAllMetroTrains()
            .then((data) => {
                // Set the metro trains data
                setMetroTrains(data.data.items);
                
                // Extract max capacity and max volume from additionalData
                const additionalData = data.additionalData[0];
                const capacity = additionalData.find(item => item.configKey === 'MAX_CAPACITY_PER_LINE_KG');
                const volume = additionalData.find(item => item.configKey === 'MAX_CAPACITY_PER_LINE_M3');
                
                setMaxCapacity(capacity ? capacity.configValue : "Không xác định");
                setMaxVolume(volume ? volume.configValue : "Không xác định");
                
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching metro trains data", error);
            });
    }, []);

    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            render: (_, __, index) => index + 1,  // Generate index for each row
            width: 60,
        },
        {
            title: 'Mã tàu',
            dataIndex: 'trainCode',
            key: 'trainCode',
        },
        {
            title: 'Model tàu',
            dataIndex: 'modelName',
            key: 'modelName',
        },
        {
            title: 'Trọng tải tàu (kg)',
            dataIndex: 'maxCapacity',
            key: 'maxCapacity',
            render: () => maxCapacity,  // Show max capacity
        },
        {
            title: 'Dung tích tàu (m³)',
            dataIndex: 'maxVolume',
            key: 'maxVolume',
            render: () => maxVolume,  // Show max volume
        },
    ];

    // Map the metroTrains data to fit the table format
    const data = metroTrains.map((train, index) => ({
        key: index, // Ensure each row has a unique `key` field
        stt: index + 1,
        trainCode: train.trainCode,
        modelName: train.modelName,
        maxCapacity: maxCapacity,  // Adding max capacity for each train
        maxVolume: maxVolume,  // Adding max volume for each train
    }));

    return (
        <div className='metro-train-management-container'>
            <Spin spinning={loading} tip="Đang tải dữ liệu...">
                <Table
                    columns={columns}
                    dataSource={data}  // Pass the correctly mapped data to `dataSource`
                    rowKey="id"  // Ensure `id` is used as the unique key for each row
                    pagination={{ pageSize: 10 }}
                />
            </Spin>
        </div>
    );
}

export default MetroTrainManagement;
