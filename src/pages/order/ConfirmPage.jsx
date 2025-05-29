import { Col, Descriptions, Divider, Row, Typography } from 'antd';

import React from 'react';

const { Title } = Typography;

function ConfirmPage({ personalInfo, parcelInfo, metroSelector, pickedDate, pickedTime }) {
  return (
    <div style={{ padding: '1rem' }}>
      <Title level={3}>Xác nhận thông tin đơn hàng của bạn</Title>

      <Divider orientation="left">Thông tin người gửi và người nhận</Divider>
      <Row gutter={24}>
        <Col span={12}>
          <Descriptions title="Người gửi" bordered size="small" column={1}>
            <Descriptions.Item label="Name">{personalInfo.senderName}</Descriptions.Item>
            <Descriptions.Item label="Phone">{personalInfo.senderPhone}</Descriptions.Item>
          </Descriptions>
        </Col>
        <Col span={12}>
          <Descriptions title="Người nhận" bordered size="small" column={1}>
            <Descriptions.Item label="Name">{personalInfo.recipientName}</Descriptions.Item>
            <Descriptions.Item label="Phone">{personalInfo.recipientPhone}</Descriptions.Item>
            <Descriptions.Item label="Email">{personalInfo.recipientEmail}</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>

      <Divider orientation="left">Thông tin đơn hàng</Divider>
      <Row gutter={24}>
        <Col span={12}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Loại hàng hóa">{parcelInfo.parcelCategory}</Descriptions.Item>
            <Descriptions.Item label="Trọng lượng">{parcelInfo.weightKg} kg</Descriptions.Item>
            <Descriptions.Item label="Kích thước">
              {parcelInfo.lengthCm} x {parcelInfo.widthCm} x {parcelInfo.heightCm} cm
            </Descriptions.Item>
            <Descriptions.Item label="Nhiều hàng 1 đơn">{parcelInfo.isBulk ? "Có" : "Không"}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{parcelInfo.description}</Descriptions.Item>
          </Descriptions>
        </Col>
        <Col span={12}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Trạm gửi">
              {metroSelector.departureStationId || 'Not selected'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạm nhận">
              {metroSelector.destinationStationId || 'Not selected'}
            </Descriptions.Item>
          </Descriptions>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Ngày">{pickedDate || "Not selected"}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">{pickedTime || "Not selected"}</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </div>
  );
}

export default ConfirmPage;
