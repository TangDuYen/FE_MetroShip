import "./AdminStaffManage.scss";

import {
  Button,
  ConfigProvider,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
} from "antd";
import {
  getAllAsignedStaffRole,
  getAllStaff,
  getAllStations,
  getMetroTimeSlots,
} from "../../../../../config/metroApi";
import { useEffect, useState } from "react";

import { PATH_NAME } from "../../../../../constants/pathname";
import { ReloadOutlined } from "@ant-design/icons";
import api from "../../../../../config/axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function AdminStaffManage() {
  const [users, setUsers] = useState([]);
  const [modalAssign, setModalAssign] = useState(false);
  const [stations, setStations] = useState([]); // fetch stations
  // const [selectedStation, setSelectedStation] = useState(null);
  // const [fromDate, setFromDate] = useState(null);
  // const [toDate, setToDate] = useState(null);
  // const [timeSlotId, setTimeSlotId] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formAdd] = Form.useForm();
  const [assignRole, setAssignRole] = useState([]);
  // const [assignedRoleId, setAssignedRoleId] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState(null);
  const [formAssign] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterStations, setFilterStations] = useState([]);
  const [filterRoles, setFilterRoles] = useState([]);

  const nav = useNavigate();

  const onAssign = (staff) => {
    setAssigningStaff(staff);
    setIsAssignModalOpen(true);
  };

  useEffect(() => {
    if (!assigningStaff) return;

    const currentAssignment = assigningStaff.staffAssignments?.find(
      (a) => a.isActive === true
    );
    console.log("Current assignment:", currentAssignment);

    if (currentAssignment) {
      formAssign.setFieldsValue({
        role: currentAssignment.assignedRole,
        stationId: currentAssignment.stationId,
        timeSlotId: currentAssignment.timeSlotId,
        fromDate: currentAssignment.fromTime
          ? dayjs(currentAssignment.fromTime)
          : null,
        toDate: currentAssignment.toTime
          ? dayjs(currentAssignment.toTime)
          : null,
      });
    } else {
      formAssign.resetFields();
    }
  }, [assigningStaff]);

  useEffect(() => {
    getAllStaff()
      .then((data) => {
        const mapped = data.map((staff) => {
          const currentAssignment = staff.staffAssignments?.find(
            (a) => a.isActive === true
          );
          return {
            ...staff,
            assignedStation: currentAssignment?.stationName || "Chưa phân công",
            currentRole: currentAssignment?.assignedRole || null,
            assignedStationId: currentAssignment?.stationId || null,
            currentRoleId: currentAssignment?.assignedRoleId || null,
          };
        });
        setUsers(mapped);
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
    try {
      const values = await formAssign.validateFields();
      const payload = {
        staffId: assigningStaff.id,
        stationId: values.stationId,
        fromTime: values.fromDate.toISOString(),
        toTime: values.toDate.toISOString(),
        assignedRole: values.role,
        description: `Phân công vào trạm ${values.stationId}`,
        timeSlotId: values.timeSlotId,
      };

      await api.post("/users/admin/assign-role", payload);
      toast.success("Phân công thành công!");
      setIsAssignModalOpen(false);
      setAssigningStaff(null);

      const station = stations.find((s) => s.stationId === values.stationId);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === assigningStaff.id
            ? {
              ...user,
              assignedStation: station?.stationNameVi || "Đã phân công",
            }
            : user
        )
      );
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Có lỗi xảy ra khi phân công.";
      toast.error(errorMessage);
    }
  };

  const filteredData = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchText.toLowerCase()) &&
      (filterStations.length === 0 ||
        filterStations.includes(String(u.assignedStationId))) &&
      (filterRoles.length === 0 || filterRoles.includes(u.currentRole))
  );

  const disabledDate = (current) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return current && current.valueOf() < tomorrow.getTime();
  };
  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text) => <span>{text || "Chưa cập nhật"}</span>,
    },
    {
      title: "Công việc hiện tại",
      dataIndex: "currentRole",
      key: "currentRole",
      render: (text) => text || "Chưa phân công",
    },
    {
      title: "Trạm hiện tại",
      dataIndex: "assignedStation",
      key: "assignedStation",
      render: (text) => text || "Chưa phân công",
    },
    // {
    //   title: 'Ca làm việc',
    //   dataIndex: 'timeSlot',
    //   key: 'timeSlot',
    //   render: (text) => text || 'Chưa phân công'
    // },
    {
      title: "Giao việc",
      key: "assign",
      render: (_, record) => (
        <Button
          className="assign-staff-button"
          onClick={() => {
            setModalAssign(true);
            onAssign(record);
          }}
        >
          Giao việc
        </Button>
      ),
    },
    {
      title: "Xem chi tiết",
      key: "view",
      render: (_, record) => (
        <Button
          className="view-staff-button"
          onClick={() => {
            nav(
              PATH_NAME.DASHBOARD_ADMIN_STAFF_DETAILS.replace(
                ":staffId",
                record.id
              )
            );
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
    {
      title: "Cấm",
      key: "ban",
      render: (_, record) => (
        <Button className="ban-staff-button" onClick={() => onDisable(record)}>
          Cấm
        </Button>
      ),
    },
  ];

  // const data = users.map((u, index) => ({ ...u, key: index }));
  // Lấy unique roles
  const uniqueRoles = [
    ...new Set(users.map((u) => u.currentRole).filter(Boolean)),
  ];

  return (
    <div className="staff-management-container">
      <div className="staff-filter-bar">
        <Space wrap size="middle">
          <Button type="primary" onClick={() => setShowAdd(true)}>
            + Thêm nhân viên
          </Button>
          <Input.Search
            allowClear
            placeholder="Tìm kiếm theo họ tên..."
            style={{ width: 400 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="Lọc theo trạm"
            style={{ width: 400 }}
            value={filterStations}
            onChange={setFilterStations}
            options={stations.map((s) => ({
              label: s.stationNameVi,
              value: String(s.stationId),
            }))}
            optionFilterProp="label"
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="Lọc theo công việc"
            style={{ width: 400 }}
            value={filterRoles}
            onChange={setFilterRoles}
          >
            {uniqueRoles.map((role) => (
              <Option key={role} value={role}>
                {role}
              </Option>
            ))}
          </Select>

          <Button
            className="clear-filter-button"
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchText("");
              setFilterStations([]);
              setFilterRoles([]);
            }}
          ></Button>
        </Space>
      </div>
      <ConfigProvider
        renderEmpty={() => (
          <Empty
            image={Empty.PRESENTED_IMAGE_DEFAULT}
            description="Không có dữ liệu"
          />
        )}
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </ConfigProvider>
      <Modal
        title={`Giao việc cho ${assigningStaff?.fullName || ""}`}
        open={isAssignModalOpen}
        onCancel={() => {
          setIsAssignModalOpen(false);
          setAssigningStaff(null);
        }}
        cancelText="Hủy"
        okText="Giao việc"
        onOk={handleAssign}
      >
        <Form form={formAssign} layout="vertical">
          <Form.Item label="Trạm" name="stationId">
            <Select
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              placeholder="Chọn trạm"
              options={stations.map((s) => ({
                label: s.stationNameVi,
                value: s.stationId,
              }))}
            />
          </Form.Item>

          <Form.Item label="Từ ngày" name="fromDate">
            <DatePicker
              // disabledDate={disabledDate}
              style={{ width: "100%" }}
              placeholder="Chọn ngày bắt đầu"
            />
          </Form.Item>

          <Form.Item label="Đến ngày" name="toDate">
            <DatePicker
              disabledDate={disabledDate}
              style={{ width: "100%" }}
              placeholder="Chọn ngày kết thúc"
            />
          </Form.Item>

          {/* <Form.Item label="Ca trực" name="timeSlotId">
            <Select
              placeholder="Chọn ca làm việc"
              options={timeSlots.map((slot) => ({
                label: `Ca ${slot.shift}: ${slot.openTime} - ${slot.closeTime}`,
                value: slot.id,
              }))}
            />
          </Form.Item> */}

          <Form.Item label="Công việc" name="role" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn công việc"
              options={assignRole.map((role) => ({
                label: role.value,
                value: role.id,
              }))}
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
              role: 2,
              birthDate: values.birthDate.toISOString(),
            };

            await api.post("/users", payload);
            toast.success("Thêm nhân viên thành công!");
            setShowAdd(false);
            formAdd.resetFields();
            await getAllStaff();
          } catch (err) {
            console.error("Add staff error:", err);
            toast.error(
              "Thêm nhân viên thất bại! Nhân viên đã tồn tại trong hệ thống"
            );
          }
        }}
      >
        <Form form={formAdd} layout="vertical">
          <Form.Item
            label="Tên đăng nhập"
            name="userName"
            rules={[{ required: true, message: "Không được để trống tên đăng nhập" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: "Không được để trống họ tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: "email", required: true, message: "Không được để trống email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[{ required: true, message: "Không được để trống số điện thoại" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Không được để trống mật khẩu" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Không được để trống mật khẩu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value)
                    return Promise.resolve();
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Ngày sinh"
            name="birthDate"
            rules={[{ required: true }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
              placeholder="Chọn ngày"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminStaffManage;
