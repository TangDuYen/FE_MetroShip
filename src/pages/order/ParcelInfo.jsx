import 'leaflet/dist/leaflet.css';

import { Button, DatePicker, Form, Input, InputNumber, Select } from 'antd';
import { useEffect, useState } from 'react';

import Title from 'antd/es/skeleton/Title';
import api from '../../config/axios';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

function ParcelInfo({
  parcelInfo,
  setParcelInfo,
  metroSelector,
  setMetroSelector,
  pickedDate,
  setPickedDate,
  pickedTime,
  setPickedTime,
  selectedSolutionIndex,
  setSelectedSolutionIndex,
  routeSolutions,
  setRouteSolutions,
  priceVnd,
  setPriceVnd,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const handleChange = (field, value) => {
    setParcelInfo({ ...parcelInfo, [field]: value });
  };

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await api.get('/stations');
        setMetros(res.data.data);
      } catch {
        console.log('Error fetching metro stations');
      }
    };
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories/get-all');
        setParcelCategory(res.data.data.items);
      } catch {
        console.log('Error fetching parcel categories');
      }
    };

    fetchStations();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedDate || selectedTime) {
      setPickedDate(selectedDate);
      setPickedTime(selectedTime);

      const dateObj = dayjs(selectedDate, "YYYY-MM-DD");

      if (selectedTime) {
        const [hour, minute] = selectedTime.split(':').map(Number);
        const combinedDateTime = dateObj.hour(hour).minute(minute).second(0).toDate();
        setMetroSelector(prev => ({ ...prev, departureDateTime: combinedDateTime }));
      }
    }
  }, [selectedDate, selectedTime]);

  const [metros, setMetros] = useState([]);
  const [parcelCategory, setParcelCategory] = useState([]);

  const handleDepartureChange = value => {
    setMetroSelector(prev => ({ ...prev, departureStationId: value }));
  };

  const handleDestinationChange = value => {
    setMetroSelector(prev => ({ ...prev, destinationStationId: value }));
  };

  const disabledDate = current => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return current && current.valueOf() < today.getTime();
  };

  const buildPriceItineraryPayload = () => ({
    departureStationId: metroSelector.departureStationId || '',
    destinationStationId: metroSelector.destinationStationId || '',
    scheduleShipmentDate: metroSelector.departureDateTime
      ? metroSelector.departureDateTime.toISOString()
      : null,
    parcels: [
      {
        parcelCategoryId: parcelInfo.parcelCategory || '',
        weightKg: Number(parcelInfo.weightKg) || 0,
        lengthCm: Number(parcelInfo.lengthCm) || 0,
        widthCm: Number(parcelInfo.widthCm) || 0,
        heightCm: Number(parcelInfo.heightCm) || 0,
        chargeableWeight: Number(parcelInfo.weightKg) || 0,
        isBulk: parcelInfo.isBulk || false,
        priceVnd: 0,
      },
    ],
  });

  const calculateChargeableWeight = () => {
    const weight = Number(parcelInfo.weightKg) || 0;
    const length = Number(parcelInfo.lengthCm) || 0;
    const width = Number(parcelInfo.widthCm) || 0;
    const height = Number(parcelInfo.heightCm) || 0;

    const volumetricWeight = (length * width * height) / 5000;
    return Math.max(weight, volumetricWeight);
  };

  const fetchTotalPriceItinerary = async () => {
    const payload = buildPriceItineraryPayload();

    try {
      const res = await api.post('/shipments/total-price-itinerary', payload);
      const data = res.data?.data;

      if (data) {
        const chargeableWeight = calculateChargeableWeight();

        // Lấy shippingFeeByItinerary từ bestPathGraphResponses[0]
        const shippingFee = data.bestPathGraphResponses?.[0]?.shippingFeeByItinerary || 0;

        // Tính giá tiền cuối cùng = trọng lượng quy đổi * phí vận chuyển
        const totalPrice = chargeableWeight * shippingFee;

        setPriceVnd(totalPrice);
      }
    } catch (error) {
      console.error('Failed to fetch price itinerary:', error);
    }
  };

  useEffect(() => {
    const ready =
      metroSelector.departureStationId &&
      metroSelector.destinationStationId &&
      parcelInfo.parcelCategory &&
      parcelInfo.weightKg &&
      parcelInfo.lengthCm &&
      parcelInfo.widthCm &&
      parcelInfo.heightCm &&
      metroSelector.departureDateTime;

    if (ready) fetchTotalPriceItinerary();
  }, [metroSelector, parcelInfo]);

  return (
    <>
      <div>
        <Title level={4}>Điền thông tin kiện hàng</Title>
        <Form layout="vertical" style={{ padding: '1rem' }}>
          <Title level={4}>Chọn trạm Metro</Title>
          <Form.Item label="Loại hàng hóa">
            <Select
              placeholder="Chọn loại hàng"
              value={parcelInfo.parcelCategory}
              onChange={value => handleChange('parcelCategory', value)}
            >
              {parcelCategory.map(parcels => (
                <Option key={parcels.id} value={parcels.id}>
                  {parcels.categoryName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Trọng lượng (kg)">
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              value={parcelInfo.weightKg}
              onChange={value => handleChange('weightKg', value)}
            />
          </Form.Item>

          <Form.Item label="Kích thước (cm)">
            <Input.Group compact>
              <InputNumber
                min={0}
                placeholder="Dài"
                style={{ width: '33%' }}
                value={parcelInfo.lengthCm}
                onChange={value => handleChange('lengthCm', value)}
              />
              <InputNumber
                min={0}
                placeholder="Rộng"
                style={{ width: '33%' }}
                value={parcelInfo.widthCm}
                onChange={value => handleChange('widthCm', value)}
              />
              <InputNumber
                min={0}
                placeholder="Cao"
                style={{ width: '33%' }}
                value={parcelInfo.heightCm}
                onChange={value => handleChange('heightCm', value)}
              />
            </Input.Group>
          </Form.Item>

          <Form.Item label="Mô tả">
            <TextArea
              rows={4}
              value={parcelInfo.description}
              onChange={e => handleChange('description', e.target.value)}
            />
          </Form.Item>
        </Form>
        <div className="metro-selector">
          <Title level={4}>Chọn trạm Metro</Title>
          <div className="selector-group">
            <label>Trạm gửi:</label>
            <Select
              style={{ width: '100%', marginBottom: '1em', marginTop: '0.5em' }}
              placeholder="Chọn trạm để gửi hàng"
              value={metroSelector.departureStationId}
              onChange={handleDepartureChange}
            >
              {metros.map(station => (
                <Option key={station.id} value={station.id}>
                  {station.stationNameVi}
                </Option>
              ))}
            </Select>
          </div>

          <div className="selector-group">
            <label>Trạm nhận:</label>
            <Select
              style={{ width: '100%', marginBottom: '1em', marginTop: '0.5em' }}
              placeholder="Chọn trạm để nhận hàng"
              value={metroSelector.destinationStationId}
              onChange={handleDestinationChange}
            >
              {metros.map(station => (
                <Option key={station.id} value={station.id}>
                  {station.stationNameVi}
                </Option>
              ))}
            </Select>
          </div>

          <div className="selector-group">
            <label>Ngày gửi:</label>
            <DatePicker
              style={{ width: '100%', marginTop: '0.5em', marginBottom: '1em' }}
              disabledDate={disabledDate}
              placeholder="Chọn ngày gửi"
              value={pickedDate ? dayjs(pickedDate) : null}
              onChange={(date) => {
                const formattedDate = date ? dayjs(date).format("YYYY-MM-DD") : null;
                setSelectedDate(formattedDate);
              }}
            />
            <label>Thời gian gửi:</label>
            <Select
              placeholder="Chọn giờ gửi"
              style={{ width: '100%', marginBottom: "1em", marginTop: "1em" }}
              className="dateSelector__time"
              onChange={(value) => setSelectedTime(value)}
            >
              <Option value="08:00">08:00</Option>
              <Option value="08:15">08:15</Option>
              <Option value="08:30">08:30</Option>
              <Option value="08:45">08:45</Option>
              <Option value="09:00">09:00</Option>
              <Option value="09:15">09:15</Option>
              <Option value="09:30">09:30</Option>
              <Option value="09:45">09:45</Option>
              <Option value="10:00">10:00</Option>
              <Option value="10:15">10:15</Option>
              <Option value="10:30">10:30</Option>
              <Option value="10:45">10:45</Option>
              <Option value="11:00">11:00</Option>
              <Option value="11:15">11:15</Option>
              <Option value="11:30">11:30</Option>
              <Option value="11:45">11:45</Option>
              <Option value="12:00">12:00</Option>
              <Option value="12:15">12:15</Option>
              <Option value="12:30">12:30</Option>
              <Option value="12:45">12:45</Option>
              <Option value="13:00">13:00</Option>
              <Option value="13:15">13:15</Option>
              <Option value="13:30">13:30</Option>
              <Option value="13:45">13:45</Option>
              <Option value="14:00">14:00</Option>
              <Option value="14:15">14:15</Option>
              <Option value="14:30">14:30</Option>
              <Option value="14:45">14:45</Option>
              <Option value="15:00">15:00</Option>
              <Option value="15:15">15:15</Option>
              <Option value="15:30">15:30</Option>
              <Option value="15:45">15:45</Option>
              <Option value="16:00">16:00</Option>
              <Option value="16:15">16:15</Option>
              <Option value="16:30">16:30</Option>
              <Option value="16:45">16:45</Option>
              <Option value="17:00">17:00</Option>
              <Option value="17:15">17:15</Option>
              <Option value="17:30">17:30</Option>
              <Option value="17:45">17:45</Option>
              <Option value="18:00">18:00</Option>
              <Option value="18:15">18:15</Option>
              <Option value="18:30">18:30</Option>
              <Option value="18:45">18:45</Option>
              <Option value="19:00">19:00</Option>
              <Option value="19:15">19:15</Option>
              <Option value="19:30">19:30</Option>
              <Option value="19:45">19:45</Option>
              <Option value="21:00">21:00</Option>
            </Select>
            <p
              style={{ fontWeight: 'bold', color: 'red', marginBottom: '1em' }}
            >
              Lưu ý: Khách hàng cần phải mang hàng đến trạm gửi trước giờ gửi trễ
              nhất 30 phút trước khi tàu chạy
            </p>
          </div>

          <div
            className="solutions"
            style={{ marginBottom: '1em', display: 'flex', gap: '1em' }}
          >
            {[1, 2, 3].map((n, i) => {
              const isSelected = selectedSolutionIndex === i;

              const colors = [
                { bg: '#0066CC', hover: '#005bb5' },
                { bg: '#FFC107', hover: '#e6ac00' },
                { bg: '#4CAF50', hover: '#449d48' },
              ];

              const style = {
                backgroundColor: isSelected ? colors[i].bg : '#fff',
                color: isSelected ? '#fff' : '#000',
                border: `1px solid ${colors[i].bg}`,
                transition: 'all 0.3s ease',
              };

              return (
                <Button
                  key={n}
                  style={style}
                  onMouseEnter={e =>
                    (e.target.style.backgroundColor = colors[i].hover)
                  }
                  onMouseLeave={e =>
                  (e.target.style.backgroundColor = isSelected
                    ? colors[i].bg
                    : '#fff')
                  }
                  onClick={() => {
                    setSelectedSolutionIndex(i);
                    setPriceVnd(routeSolutions[i]?.priceVnd || null);
                  }}
                >
                  Giải pháp {n}
                </Button>
              );
            })}
          </div>

          <div className="calculatePrice">
            <p>
              Giá tiền dự tính: {priceVnd ? priceVnd.toLocaleString() + ' VND' : 'Chưa có'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ParcelInfo;
