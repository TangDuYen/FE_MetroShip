import { Avatar } from 'antd';
import React from 'react'
import { UserOutlined } from '@ant-design/icons';
import { selectUser } from '../../redux/features/counterSlice';
import { useSelector } from 'react-redux';

function AdminAccount() {
  const user = useSelector(selectUser);

    return (
        <div className="admin-account">
            <Avatar
                icon={<UserOutlined />}
                className="admin-account_avatar"
            />
            <div className="admin-account_info">
                <p className="admin-account_info_role">{user?.role}</p>
            </div>
        </div>
    );
}

export default AdminAccount
