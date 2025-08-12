import { Checkbox, Col, Descriptions, Divider, Row, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import api from '../../config/axios';
import dayjs from 'dayjs';
import { formatCurrency } from '../../constants/statusMap';
import { getMetroTimeSlots } from '../../config/metroApi';

const { Title } = Typography;

function ConfirmPage({
  personalInfo,
  parcelInfo,   
  metroSelector,
  pickedDate,
  pickedTime,
  priceVnd,
  routeSolutions,
  selectedSolutionIndex,
}) {
  const [stationsMap, setStationsMap] = useState({});
  const [parcelCategoriesMap, setCategoriesMap] = useState({});
  const [selectedTimeLabel, setSelectedTimeLabel] = useState('');
  const selectedSolution = routeSolutions[selectedSolutionIndex] || {};
  const optionalInsuranceFee = selectedSolution?.data?.parcels
    ?.filter((p, idx) => parcelInfo[idx]?.includeOptionalInsurance)
    .reduce((sum, p) => sum + (p.insuranceFeeVnd || 0), 0) || 0;
  const finalDisplayPrice = (selectedSolution?.data?.totalCostVnd || 0) + optionalInsuranceFee;
  const uiFinal = Number(sessionStorage.getItem('uiFinalTotalCostVnd') || 0);

  // Fetch station names
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const ids = [metroSelector.departureStationId, metroSelector.destinationStationId].filter(Boolean);
        const requests = ids.map(id => api.get(`/stations/${id}`));
        const responses = await Promise.all(requests);
        const map = {};
        responses.forEach(res => {
          const st = res.data;
          map[st.id] = st.stationNameVi;
        });
        setStationsMap(map);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStations();
  }, [metroSelector.departureStationId, metroSelector.destinationStationId]);

  // Fetch parcel category names
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const ids = [...new Set(parcelInfo.map(p => p.parcelCategory).filter(Boolean))];
        const responses = await Promise.all(ids.map(id => api.get(`/parcel-category/${id}`)));
        const map = {};
        responses.forEach(res => {
          const cat = res.data.data;
          map[cat.id] = cat.categoryName;
        });
        setCategoriesMap(map);
      } catch (e) {
        console.error(e);
      }
    };
    if (parcelInfo.length) fetchCategories();
  }, [parcelInfo]);

  // Fetch time label
  useEffect(() => {
    getMetroTimeSlots().then(slots => {
      const slot = slots.find(s => s.id === pickedTime);
      if (slot) {
        const adj = dayjs(slot.openTime, 'HH:mm:ss').subtract(30, 'minute').format('HH:mm');
        setSelectedTimeLabel(adj);
      }
    });
  }, [pickedTime]);

  const totalParcels = parcelInfo.length;
  const totalWeight = parcelInfo.reduce((sum, p) => sum + Number(p.weightKg || 0), 0);

  return (
    <div style={{ padding: '1rem' }}>
      <Title level={3}>Xác nhận thông tin đơn hàng</Title>

      <Divider orientation="left">Thông tin người gửi / nhận</Divider>
      <Row gutter={24}>
        <Col span={12}>
          <Descriptions title="Người gửi" bordered size="small" column={1}>
            <Descriptions.Item label="Tên">{personalInfo.senderName}</Descriptions.Item>
            <Descriptions.Item label="SĐT">{personalInfo.senderPhone}</Descriptions.Item>
          </Descriptions>
        </Col>
        <Col span={12}>
          <Descriptions title="Người nhận" bordered size="small" column={1}>
            <Descriptions.Item label="Tên">{personalInfo.recipientName}</Descriptions.Item>
            <Descriptions.Item label="SĐT">{personalInfo.recipientPhone}</Descriptions.Item>
            {personalInfo.recipientEmail && (
              <Descriptions.Item label="Email">{personalInfo.recipientEmail}</Descriptions.Item>
            )}
          </Descriptions>
        </Col>
      </Row>

      <Divider orientation="left">Chi tiết kiện hàng ({totalParcels})</Divider>
      {parcelInfo.map((parcel, i) => {
        const items = [
          <Descriptions.Item label="Loại" key="type">
            {parcelCategoriesMap[parcel.parcelCategory] || parcel.parcelCategory}
          </Descriptions.Item>,
          <Descriptions.Item label="Trọng lượng" key="weight">
            {parcel.weightKg} kg
          </Descriptions.Item>,
          <Descriptions.Item label="Kích thước" key="size">
            {parcel.lengthCm} × {parcel.widthCm} × {parcel.heightCm} cm
          </Descriptions.Item>,
          parcel.parcelCategory.insuranceFeeVnd && (
            <Descriptions.Item label="Phí bảo hiểm">{parcel.insuranceFeeVnd}</Descriptions.Item>
          ),
          parcel.description && (
            <Descriptions.Item label="Mô tả" key="desc">{parcel.description}</Descriptions.Item>
          ),
          parcel.descriptionImageUrl && (
            <Descriptions.Item label="Ảnh hóa đơn" key="img">
              <a href={parcel.descriptionImageUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={parcel.descriptionImageUrl}
                  alt={`invoice-${i}`}
                  style={{ width: 120, height: 120, objectFit: "cover", border: "1px solid #ccc" }}
                />
              </a>
            </Descriptions.Item>
          )
        ].filter(Boolean);

        return (
          <Descriptions
            key={i}
            bordered
            size="small"
            column={1}
            style={{ marginBottom: 16 }}
            title={`Kiện ${i + 1}`}
          >
            {items}
          </Descriptions>
        );
      })}


      <Divider orientation="left">Thông tin vận chuyển</Divider>
      <Row gutter={24}>
        <Col span={12}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Từ trạm">
              {stationsMap[metroSelector.departureStationId] || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Đến trạm">
              {stationsMap[metroSelector.destinationStationId] || '—'}
            </Descriptions.Item>
          </Descriptions>
        </Col>

        <Col span={12}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Ngày gửi">{pickedDate || '—'}</Descriptions.Item>
            <Descriptions.Item label="Thời gian gửi">{selectedTimeLabel || '—'}</Descriptions.Item>
            <Descriptions.Item label="Tổng trọng lượng">
              {totalWeight} kg
            </Descriptions.Item>
            <Descriptions.Item label="Tổng chi phí">
              {/* {finalDisplayPrice
                ? `${Number(finalDisplayPrice).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VND`
                : '—'} */}
                {formatCurrency(uiFinal)}
            </Descriptions.Item>

          </Descriptions>
        </Col>
      </Row>
      <Divider />
    </div>
  );
}

export default ConfirmPage;
