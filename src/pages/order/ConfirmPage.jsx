import { Checkbox, Col, Descriptions, Divider, Row, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import api from '../../config/axios';
import dayjs from 'dayjs';
import { getMetroTimeSlots } from '../../config/metroApi';

const { Title } = Typography;

function ConfirmPage({ personalInfo, parcelInfo, metroSelector, pickedDate, pickedTime,
  priceVnd, routeSolutions, selectedSolutionIndex }) {
  const [parcelCategory, setParcelCategory] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [departureStationName, setDepartureStationName] = useState("");
  const [destinationStationName, setDestinationStationName] = useState("");
  
  const selectedSolution = routeSolutions?.[selectedSolutionIndex];
  const stations = selectedSolution?.stations || [];

  const departureStationId = metroSelector.departureStationId;
  const destinationStationId = metroSelector.destinationStationId;

  const getStationByID = async () => {
  try {
    const [departureStationRes, destinationStationRes] = await Promise.all([
      api.get(`/stations/${departureStationId}`),
      api.get(`/stations/${destinationStationId}`)
    ]);

    const departureStation = departureStationRes.data;
    const destinationStation = destinationStationRes.data;
    setDepartureStationName(departureStation.stationNameVi);
    setDestinationStationName(destinationStation.stationNameVi);

  } catch (error) {
    console.error('Error fetching station details:', error);
  }
};

  const getParcelCategoryByID = async () => {
    try {
      const response = await api.get(`/parcel-category/${parcelInfo.parcelCategory}`);
      const name = response.data.data.categoryName;
      setParcelCategory(name);
    } catch (error) {
      console.log("Error");
    }
  }


  useEffect(() => {
    getParcelCategoryByID();
    getMetroTimeSlots().then(timeSlots => {
      const timeSlot = timeSlots.find(slot => slot.id === pickedTime);
      if (timeSlot) {
        setSelectedTime(timeSlot.openTime);
      }
    });
    getStationByID();
  }, []);

  const adjustedTime = dayjs(selectedTime, 'HH:mm:ss').subtract(30, 'minute').format('HH:mm');

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
          </Descriptions>
        </Col>
      </Row>

      <Divider orientation="left">Thông tin đơn hàng</Divider>
      <Row gutter={24}>
        <Col span={12}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Loại hàng hóa">{parcelCategory}</Descriptions.Item>
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
              {departureStationName || 'Chưa chọn'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạm nhận">
              {destinationStationName || 'Chưa chọn'}
            </Descriptions.Item>
          </Descriptions>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Ngày">{pickedDate || "Chưa chọn"}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">{adjustedTime || "Chưa chọn selected"}</Descriptions.Item>
            <Descriptions.Item label="Giá tiền dự tính">
              {priceVnd ? `${Number(priceVnd).toLocaleString()} VND` : "Chưa có"}
            </Descriptions.Item>
          </Descriptions>
        </Col>
        <div className="user-payment">
          <Checkbox>
            Người nhận trả tiền
          </Checkbox>
        </div>
      </Row>
    </div>
  );
}

export default ConfirmPage;
