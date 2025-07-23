import './AdminStaffManage.scss';

import { Card, Descriptions, Divider, Typography } from 'antd';
import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { getAllStaff } from '../../../../../config/metroApi';
import { useParams } from 'react-router-dom';

const { Title } = Typography;

function AdminStaffDetails() {
  const { staffId } = useParams();
  const [staff, setStaff] = useState(null);

  useEffect(() => {
    getAllStaff()
      .then(res => {
        const found = res.find(s => s.id === staffId);
        if (found) setStaff(found);
      })
      .catch(err => console.error('Failed to load staff', err));
  }, [staffId]);

  if (!staff) return <div>Đang tải dữ liệu...</div>;

  const current = Array.isArray(staff.staffAssignments)
    ? staff.staffAssignments.find(a => a.isActive)
    : null;

  return (
    <div className='admin-staff-details-container'>
      <Title level={3}>Thông tin nhân viên: {staff.fullName}</Title>

      <Card title="Thông tin cá nhân" style={{ marginBottom: 20 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="ID">{staff.id}</Descriptions.Item>
          <Descriptions.Item label="Tên đăng nhập">{staff.userName}</Descriptions.Item>
          <Descriptions.Item label="Email">{staff.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{staff.phoneNumber || 'Chưa cập nhật'}</Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {staff.birthDate ? dayjs(staff.birthDate).format('YYYY-MM-DD') : 'Chưa rõ'}
          </Descriptions.Item>
          <Descriptions.Item label="Vai trò">{
            Array.isArray(staff.role) ? staff.role.join(', ') : staff.role
          }</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Thông tin công việc hiện tại" style={{ marginBottom: 20 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Trạm hiện tại">{current?.stationName || 'Chưa phân công'}</Descriptions.Item>
          <Descriptions.Item label="Công việc hiện tại">{current?.assignedRole || 'Chưa phân công'}</Descriptions.Item>
          <Descriptions.Item label="Từ ngày">{current ? dayjs(current.fromTime).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
          <Descriptions.Item label="Đến ngày">{current ? dayjs(current.toTime).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Lịch sử phân công">
        {Array.isArray(staff.staffAssignments) && staff.staffAssignments.length > 0 ? (
          staff.staffAssignments.map((a, idx) => (
            <div key={a.id || idx} style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Trạm">{a.stationName}</Descriptions.Item>
                <Descriptions.Item label="Vai trò">{a.assignedRole}</Descriptions.Item>
                <Descriptions.Item label="Từ">{dayjs(a.fromTime).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
                <Descriptions.Item label="Đến">{dayjs(a.toTime).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {a.isActive ? 'Đang làm' : 'Đã kết thúc'}
                </Descriptions.Item>
              </Descriptions>
              {idx < staff.staffAssignments.length - 1 && <Divider />}
            </div>
          ))
        ) : (
          <p>Chưa có lịch sử phân công</p>
        )}
      </Card>
    </div>
  );
}

export default AdminStaffDetails;
