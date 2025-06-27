import './MetroLineManagement.scss';

import { useEffect, useState } from 'react';

import { Table } from 'antd';
import { getMetroLines } from '../../../../../config/metroApi';

function MetroLineManagement() {
  const [metroLines, setMetroLines] = useState([]);
  useEffect(() => {
    getMetroLines()
      .then((data) => {
        setMetroLines(data);
      })
      .catch((error) => {
        console.error("Error fetching metro lines data", error);
      });
  }, []);
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên tuyến Vi',
      dataIndex: 'lineNameVi',
      key: 'lineNameVi',
    },
    {
      title: 'Tên tuyến En',
      dataIndex: 'lineNameEn',
      key: 'lineNameEn',
    },
  ];

  const data = metroLines.map((line, index) => ({
    key: index,
    id: line.id,
    lineNameVi: line.lineNameVi,
    lineNameEn: line.lineNameEn,
  }));

  return (
    <div className='metro-line-management-container'>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  )
}

export default MetroLineManagement
