import './UserManagement.scss';

import { useEffect, useState } from 'react';

import { Table } from 'antd';
import { getAllUsers } from '../../../../../config/metroApi';

function UserManagement() {
    const [users, setUsers] = useState([]); 

    useEffect(() => {
        getAllUsers() 
            .then((data) => {
                setUsers(data); 
            })
            .catch((error) => {
                console.error("Lỗi khi lấy dữ liệu người dùng", error);
            });
    }, []); 

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Tên đăng nhập',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
    ];

    const data = users.map((user, index) => ({
        key: index,  
        id: user.id,
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
    }));

    return (
        <div className="user-management-container">
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
