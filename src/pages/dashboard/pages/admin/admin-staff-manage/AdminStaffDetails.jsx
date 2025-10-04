import "./AdminStaffManage.scss";

import { Card, Collapse, Descriptions, Divider, Tag, Typography } from "antd";
import { useEffect, useState } from "react";

import dayjs from "dayjs";
import { getAllStaff } from "../../../../../config/metroApi";
import { useParams } from "react-router-dom";
import api from "../../../../../config/axios";

const { Title } = Typography;
const { Panel } = Collapse;

function AdminStaffDetails() {
  const { staffId } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!staffId) return;

    const fetchStaff = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/${staffId}`);
        setStaff(res.data.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu nhân viên:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [staffId]);

  if (!staff) return <div>Đang tải dữ liệu...</div>;

  const current = Array.isArray(staff.staffAssignments)
    ? staff.staffAssignments.find((a) => a.isActive)
    : null;

  return (
    <div className="admin-staff-details-container">
      <Title level={3}>Thông tin nhân viên: {staff.fullName}</Title>

      <Card title="Thông tin cá nhân" style={{ marginBottom: 20 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="ID">{staff.id}</Descriptions.Item>
          <Descriptions.Item label="Tên đăng nhập">
            {staff.userName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{staff.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {staff.phoneNumber || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {staff.birthDate
              ? dayjs(staff.birthDate).format("DD/MM/YYYY")
              : "Chưa rõ"}
          </Descriptions.Item>
          <Descriptions.Item label="Vai trò">
            {Array.isArray(staff.role) ? staff.role.join(", ") : staff.role}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Thông tin công việc hiện tại" style={{ marginBottom: 20 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Trạm hiện tại">
            {current?.stationName || "Chưa phân công"}
          </Descriptions.Item>
          <Descriptions.Item label="Công việc hiện tại">
            {current?.assignedRole || "Chưa phân công"}
          </Descriptions.Item>
          <Descriptions.Item label="Từ ngày">
            {current ? dayjs(current.fromTime).format("DD/MM/YYYY") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Đến ngày">
            {current ? dayjs(current.toTime).format("DD/MM/YYYY") : "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Lịch sử phân công">
        {Array.isArray(staff.staffAssignments) &&
        staff.staffAssignments.length > 0 ? (
          <>
            {/* 🔹 Hiển thị những assignment đang hoạt động */}
            {staff.staffAssignments
              .filter((a) => a.isActive)
              .map((a, idx) => (
                <div key={a.id || idx} style={{ marginBottom: 16 }}>
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Trạm">
                      {a.stationName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Vai trò">
                      {a.assignedRole}
                    </Descriptions.Item>
                    <Descriptions.Item label="Từ">
                      {dayjs(a.fromTime).format("DD/MM/YYYY")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Đến">
                      {dayjs(a.toTime).format("DD/MM/YYYY")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag color="green">Đang làm</Tag>
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider />
                </div>
              ))}

            {/* 🔹 Phần Collapse cho những cái isActive = false */}
            <Collapse ghost>
              <Panel header={<strong>Phân công đã kết thúc</strong>} key="1">
                {staff.staffAssignments
                  .filter((a) => !a.isActive)
                  .map((a, idx) => (
                    <div key={a.id || idx} style={{ marginBottom: 16 }}>
                      <Descriptions column={2} bordered size="small">
                        <Descriptions.Item label="Trạm">
                          {a.stationName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Vai trò">
                          {a.assignedRole}
                        </Descriptions.Item>
                        <Descriptions.Item label="Từ">
                          {dayjs(a.fromTime).format("DD/MM/YYYY")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Đến">
                          {dayjs(a.toTime).format("DD/MM/YYYY")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                          <Tag color="default">Đã kết thúc</Tag>
                        </Descriptions.Item>
                      </Descriptions>
                      {idx <
                        staff.staffAssignments.filter((x) => !x.isActive)
                          .length -
                          1 && <Divider />}
                    </div>
                  ))}
              </Panel>
            </Collapse>
          </>
        ) : (
          <p>Chưa có lịch sử phân công</p>
        )}
      </Card>
    </div>
  );
}

export default AdminStaffDetails;
