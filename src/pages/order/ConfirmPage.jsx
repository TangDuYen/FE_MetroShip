import { Col, Descriptions, Divider, Row, Typography } from 'antd';

import React from 'react';

const { Title } = Typography;

function ConfirmPage({ personalInfo, parcelInfo, metroSelector, pickedDate, pickedTime }) {
  return (
    <div style={{ padding: '1rem' }}>
      <Title level={3}>Confirm Your Order</Title>

      <Divider orientation="left">Personal Information</Divider>
      <Row gutter={24}>
        <Col span={12}>
          <Descriptions title="Sender" bordered size="small" column={1}>
            <Descriptions.Item label="Name">{personalInfo.senderName}</Descriptions.Item>
            <Descriptions.Item label="Phone">{personalInfo.senderPhone}</Descriptions.Item>
          </Descriptions>
        </Col>
        <Col span={12}>
          <Descriptions title="Recipient" bordered size="small" column={1}>
            <Descriptions.Item label="Name">{personalInfo.recipientName}</Descriptions.Item>
            <Descriptions.Item label="Phone">{personalInfo.recipientPhone}</Descriptions.Item>
            <Descriptions.Item label="Email">{personalInfo.recipientEmail}</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>

      <Divider orientation="left">Order Information</Divider>
      <Row gutter={24}>
        <Col span={12}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Category">{parcelInfo.parcelCategory}</Descriptions.Item>
            <Descriptions.Item label="Weight">{parcelInfo.weightKg} kg</Descriptions.Item>
            <Descriptions.Item label="Dimensions">
              {parcelInfo.lengthCm} x {parcelInfo.widthCm} x {parcelInfo.heightCm} cm
            </Descriptions.Item>
            <Descriptions.Item label="Bulk Item">{parcelInfo.isBulk ? "Yes" : "No"}</Descriptions.Item>
            <Descriptions.Item label="Description">{parcelInfo.description}</Descriptions.Item>
          </Descriptions>
        </Col>
        <Col span={12}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Departure Station">
              {metroSelector.departureStationId || 'Not selected'}
            </Descriptions.Item>
            <Descriptions.Item label="Destination Station">
              {metroSelector.destinationStationId || 'Not selected'}
            </Descriptions.Item>
          </Descriptions>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Date">{pickedDate || "Not selected"}</Descriptions.Item>
            <Descriptions.Item label="Time">{pickedTime || "Not selected"}</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </div>
  );
}

export default ConfirmPage;
