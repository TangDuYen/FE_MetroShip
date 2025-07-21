import './AdminStaffManage.scss';

import { Button, DatePicker, Form, Input, Modal, Select, Space, Table } from 'antd';
import { getAllAsignedStaffRole, getAllStaff, getAllStations, getMetroTimeSlots } from '../../../../../config/metroApi';
import { useEffect, useState } from 'react';

import api from '../../../../../config/axios';
import { toast } from 'react-toastify';

function AdminStaffManage() {
  const [users, setUsers] = useState([]);
  const [modalAssign, setModalAssign] = useState(false);
  const [stations, setStations] = useState([]); // fetch stations
  const [selectedStation, setSelectedStation] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [timeSlotId, setTimeSlotId] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formAdd] = Form.useForm();
  const [assignRole, setAssignRole] = useState([]);
  const [assignedRoleId, setAssignedRoleId] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState(null);
  const onAssign = (staff) => {
    setAssigningStaff(staff);
    setIsAssignModalOpen(true);
  };

  useEffect(() => {
    getAllStaff()
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu người dùng", error);
      });
  }, []);
  useEffect(() => {
    getAllStations().then(setStations);
    getMetroTimeSlots().then(setTimeSlots);
    getAllAsignedStaffRole().then(setAssignRole);
  }, []);

  const handleAssign = async () => {
    if (!selectedStation || !fromDate || !toDate || !timeSlotId || !assigningStaff || !assignedRoleId) {
      toast.error("Vui lòng chọn đầy đủ thông tin");
      return;
    }

    const payload = {
      staffId: assigningStaff.id,
      stationId: selectedStation,
      fromTime: fromDate.toISOString(),
      toTime: toDate.toISOString(),
      assignedRole: assignedRoleId,
      description: `Phân công vào trạm ${selectedStation}`,
      timeSlotId
    };

    try {
      await api.post("/users/admin/assign-role", payload);
      toast.success("Phân công thành công!");
      setIsAssignModalOpen(false);
      setAssigningStaff(null);
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi phân công.");
    }
  };


  const disabledDate = (current) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset to 00:00 of today

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // +1 day
    return current && current.valueOf() < tomorrow.getTime();
  };
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
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Button
          className='assign-staff-button' onClick={() => {
            setModalAssign(true);
            onAssign(record)
          }}>Giao việc</Button>
      )
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Button
          className='ban-staff-button' onClick={() => onDisable(record)}>Cấm</Button>
      )
    }
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
    <div className="staff-management-container">
      <Button type="primary" style={{ marginBottom: '1em' }} onClick={() => setShowAdd(true)}>
        Thêm nhân viên
      </Button>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={`Giao việc cho ${assigningStaff?.fullName || ''}`}
        open={isAssignModalOpen}
        onCancel={() => {
          setIsAssignModalOpen(false);
          setAssigningStaff(null);
        }}
        cancelText="Hủy"
        okText="Giao việc"
        onOk={handleAssign}
      >
        <Form layout="vertical">
          <Form.Item label="Trạm">
            <Select
              placeholder="Chọn trạm"
              options={stations.map(s => ({
                label: s.stationNameVi,
                value: s.id
              }))}
              onChange={setSelectedStation}
            />
          </Form.Item>

          <Form.Item label="Từ ngày">
            <DatePicker
              disabledDate={disabledDate}
              style={{ width: '100%' }}
              placeholder='Chọn ngày bắt đầu'
              onChange={setFromDate} />
          </Form.Item>

          <Form.Item label="Đến ngày">
            <DatePicker
              disabledDate={disabledDate}
              style={{ width: '100%' }}
              onChange={setToDate}
              placeholder="Chọn ngày kết thúc"
            />
          </Form.Item>

          <Form.Item label="Ca trực">
            <Select
              placeholder="Chọn ca làm việc"
              options={timeSlots.map(slot => ({
                label: `Ca ${slot.shift}: ${slot.openTime} - ${slot.closeTime}`,
                value: slot.id
              }))}
              onChange={setTimeSlotId}
            />
          </Form.Item>
          <Form.Item label="Công việc" name="role" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn công việc"
              options={assignRole.map(role => ({
                label: role.value,
                value: role.id
              }))}
              onChange={setAssignedRoleId}
            />
          </Form.Item>

        </Form>
      </Modal>

      <Modal
        open={showAdd}
        title="Thêm nhân viên"
        onCancel={() => setShowAdd(false)}
        cancelText="Hủy"
        okText="Thêm"
        onOk={async () => {
          try {
            const values = await formAdd.validateFields();
            const payload = {
              ...values,
              birthDate: values.birthDate.toISOString()
            };

            await api.post("/users", payload);
            message.success("Thêm nhân viên thành công!");
            setShowAdd(false);
            formAdd.resetFields();
            await getAllStaff();
          } catch (err) {
            console.error("Add staff error:", err);
            message.error("Thêm nhân viên thất bại!");
          }
        }}
      >
        <Form form={formAdd} layout="vertical">
          <Form.Item label="Tên đăng nhập" name="userName" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Họ tên" name="fullName" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ type: 'email', required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phoneNumber" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item label="Xác nhận mật khẩu" name="confirmPassword" dependencies={['password']} rules={[
            { required: true, message: 'Bắt buộc' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject(new Error('Mật khẩu không khớp!'));
              }
            })
          ]}>
            <Input.Password />
          </Form.Item>
          <Form.Item label="Ngày sinh" name="birthDate" rules={[{ required: true }]}>
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} placeholder='Chọn ngày' />
          </Form.Item>
          <Form.Item label="Vai trò" name="role" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn vai trò"
              options={(assignRole || []).map(role => ({
                label: role.value,
                value: role.id
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
}

export default AdminStaffManage;
