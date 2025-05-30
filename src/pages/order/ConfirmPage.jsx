import { Col, Descriptions, Divider, Row, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import api from '../../config/axios';

const { Title } = Typography;

function ConfirmPage({ personalInfo, parcelInfo, metroSelector, pickedDate, pickedTime, priceVnd, routeSolutions }) {
   const getStationName = (stations, stationId) => {
    const station = stations.find(s => s.stationId === stationId);
    return station ? station.stationNameVi : stationId;
  };

  // Lấy stations từ solution đầu tiên (hoặc bạn có thể lấy theo index phù hợp)
  const stations = routeSolutions?.[0]?.stations || [];

  // Lấy tên trạm gửi và nhận
  const departureStationName = getStationName(stations, metroSelector.departureStationId);
  const destinationStationName = getStationName(stations, metroSelector.destinationStationId);
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
            <Descriptions.Item label="Mô tả">{parcelInfo.description}</Descriptions.Item>
          </Descriptions>
        </Col>
        <Col span={12}>
          <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Trạm gửi">
          {departureStationName || 'Not selected'}
        </Descriptions.Item>
        <Descriptions.Item label="Trạm nhận">
          {destinationStationName || 'Not selected'}
        </Descriptions.Item>
      </Descriptions>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Ngày">{pickedDate || "Not selected"}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">{pickedTime || "Not selected"}</Descriptions.Item>
            <Descriptions.Item label="Giá tiền dự tính">
              {priceVnd ? `${Number(priceVnd).toLocaleString()} VND` : "Chưa có"}
            </Descriptions.Item>
          </Descriptions>
        </Col>
        <Divider orientation="left">Lộ trình đơn hàng</Divider>
      <div style={{ paddingLeft: 12 }}>
        {(!routeSolutions || routeSolutions.length === 0) && <p>Chưa có dữ liệu lộ trình</p>}

        {routeSolutions && routeSolutions.length > 0 && routeSolutions.map((solution, index) => {
          const routes = solution.routes || [];
          const stations = solution.stations || [];

          return (
            <div key={index} style={{ marginBottom: '1rem' }}>
              {routes.length === 0 ? (
                <p>Không có tuyến nào</p>
              ) : (
                routes.map(route => (
                  <p key={route.routeId} style={{ marginBottom: 4 }}>
                    <b>{route.legOrder}:</b> {getStationName(stations, route.fromStationId)} - {getStationName(stations, route.toStationId)} - {route.lengthKm.toFixed(2)} km - {route.travelTimeMin} phút
                  </p>
                ))
              )}
            </div>
          );
        })}
      </div>

      </Row>
    </div>
  );
}

export default ConfirmPage;
