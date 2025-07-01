import 'leaflet/dist/leaflet.css';

import { Button, Checkbox, DatePicker, Flex, Form, Input, InputNumber, Modal, Select, Table } from 'antd';
import { getAllParcelCategories, getAllStations, getMetroLines, getMetroTimeSlots } from '../../config/metroApi';
import { useEffect, useState } from 'react';

import Title from 'antd/es/skeleton/Title';
import api from '../../config/axios';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

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
  timeSlots,
  setTimeSlots,
  selectedSolutionIndex,
  setSelectedSolutionIndex,
  routeSolutions,
  setRouteSolutions,
  totalKm,
  setTotalKm,
  priceVnd,
  setPriceVnd,
  chargeableWeight,
  setChargeableWeight,
  shippingFeeVnd,
  setShippingFeeVnd,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayedDepartureStationId, setDisplayedDepartureStationId] = useState(null);
  const [realDepartureStationId, setRealDepartureStationId] = useState(null);
  const userLatitude = parseFloat(localStorage.getItem('userLatitude')) || 0;
  const userLongitude = parseFloat(localStorage.getItem('userLongitude')) || 0;
  const [stations, setStations] = useState([]);
  const [parcelCategory, setParcelCategory] = useState([]);
  const [timeSlot, setTimeSlot] = useState([]);
  const [dimensionError, setDimensionError] = useState('');

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };
  const handleChange = (field, value) => {
    setParcelInfo({ ...parcelInfo, [field]: value });
  };

  //API ONE TIME
  useEffect(() => {
    Promise.all([getMetroTimeSlots(), getAllStations(), getAllParcelCategories()]).then(
      ([timeSlotsData, stationData, parcelCategoryData]) => {
        setStations(stationData);
        setTimeSlot(timeSlotsData);
        setParcelCategory(parcelCategoryData);
      }
    );
  }, []);

  const getSingleTimeOptions = () => {
    return timeSlot.map((slot) => {
      const [h, m] = slot.openTime.split(':').map(Number);
      const date = new Date();
      date.setHours(h, m - 30, 0, 0);

      const padded = (n) => n.toString().padStart(2, '0');
      const labelTime = `${padded(date.getHours())}:${padded(date.getMinutes())}`;

      return {
        label: labelTime,
        value: slot.id,
      };
    });
  };

  const timeOptions = getSingleTimeOptions();

  useEffect(() => {
    if (selectedDate || selectedTime) {
      setPickedDate(selectedDate);
      setPickedTime(selectedTime);

      if (selectedDate && selectedTime) {
        const dateObj = dayjs(selectedDate);
        const selectedSlot = timeSlot.find(slot => slot.id === selectedTime);
        if (selectedSlot) {
          const [hour, minute] = selectedSlot.openTime.split(':').map(Number);
          const combinedDateTime = dateObj.hour(hour).minute(minute).subtract(30, 'minute').second(0).format("YYYY-MM-DDTHH:mm:ssz[Z]");
          const combinedDateTimeObj = dayjs(combinedDateTime).tz(dayjs.tz.guess());
          console.log(selectedSlot.id);
          console.log('Combined DateTime:', combinedDateTime);
          // console.log('Combined DateTime Object:', combinedDateTimeObj.toISOString());
          setTimeSlots(selectedSlot.id);
          setMetroSelector(prev => ({ ...prev, departureDateTime: combinedDateTime }));
        }
      }
    }
  }, [selectedDate, selectedTime, timeSlot]);

  const handleDestinationChange = value => {
    setMetroSelector(prev => ({ ...prev, destinationStationId: value }));
  };

  const disabledDate = current => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysAhead = new Date();
    threeDaysAhead.setDate(today.getDate() + 2);
    threeDaysAhead.setHours(23, 59, 59, 999);
    return (
      current &&
      (current.valueOf() < today.getTime() || current.valueOf() <= threeDaysAhead.getTime())
    );
  };

  useEffect(() => {
    const selectedCategory = parcelCategory.find(cat => cat.id === parcelInfo.parcelCategory);
    if (!selectedCategory) {
      setDimensionError('');
      return;
    }
    const { lengthLimitCm, widthLimitCm, heightLimitCm } = selectedCategory;
    const { lengthCm = 0, widthCm = 0, heightCm = 0 } = parcelInfo;
    const errors = [];
    if (lengthCm > lengthLimitCm) errors.push(`Chiều dài đã vượt quá ${lengthLimitCm}cm`);
    if (widthCm > widthLimitCm) errors.push(`Chiều rộng đã vượt quá ${widthLimitCm}cm`);
    if (heightCm > heightLimitCm) errors.push(`Chiều cao đã vượt quá ${heightLimitCm}cm`);
    setDimensionError(errors.join(', '));
  }, [
    parcelInfo.parcelCategory,
    parcelInfo.lengthCm,
    parcelInfo.widthCm,
    parcelInfo.heightCm,
    parcelCategory,
  ]);

  const buildPriceItineraryPayload = () => {
    const basePayload = {
      departureStationId: realDepartureStationId || '',
      destinationStationId: metroSelector.destinationStationId || '',
      scheduledDateTime: metroSelector.departureDateTime || null,
      timeSlotId: selectedTime || '',
      parcels: [
        {
          parcelCategoryId: parcelInfo.parcelCategory || '',
          weightKg: Number(parcelInfo.weightKg) || 0,
          lengthCm: Number(parcelInfo.lengthCm) || 0,
          widthCm: Number(parcelInfo.widthCm) || 0,
          heightCm: Number(parcelInfo.heightCm) || 0,
        },
      ],
    };
    if (userLatitude && userLongitude) {
      basePayload.userLatitude = userLatitude;
      basePayload.userLongitude = userLongitude;
    }
    return basePayload;
  };

  const fetchTotalPriceItinerary = async () => {
    const payload = buildPriceItineraryPayload();

    try {
      const res = await api.post('/shipments/total-price-itinerary', payload);
      const data = res.data?.data;

      const solutions = [
        { type: 'standard', data: data.standard, label: 'Tiêu chuẩn' },
        { type: 'nearest', data: data.nearest, label: 'Ưu tiên' },
        { type: 'shortest', data: data.shortest, label: 'Tốt nhất' },
      ];
      setRouteSolutions(solutions);

      const defaultIndex = solutions.findIndex(s => s.type === 'standard');
      if (defaultIndex >= 0) {
        setSelectedSolutionIndex(defaultIndex);
        setPriceVnd(solutions[defaultIndex].data?.totalCostVnd);
        setTotalKm(solutions[defaultIndex].data?.totalKm);
        setChargeableWeight(solutions[defaultIndex].data?.parcels?.[0].chargeableWeight);
        setShippingFeeVnd(solutions[defaultIndex].data?.parcels?.[0].shippingFeeVnd);
        const firstStation = solutions[defaultIndex].stations?.[0];
        if (firstStation) {
          setMetroSelector(prev => ({ ...prev, departureStationId: firstStation.stationId }));
          setDisplayedDepartureStationId(firstStation.stationId);
        }
      }
    } catch (error) {
      console.error('Lỗi fetch giá itinerary:', error);
    }
  };

  useEffect(() => {
    const ready =
      realDepartureStationId &&
      metroSelector.destinationStationId &&
      metroSelector.departureDateTime &&
      parcelInfo.parcelCategory &&
      parcelInfo.weightKg &&
      parcelInfo.lengthCm &&
      parcelInfo.widthCm &&
      parcelInfo.heightCm;

    if (ready) fetchTotalPriceItinerary();
  }, [
    realDepartureStationId,
    metroSelector.destinationStationId,
    metroSelector.departureDateTime,
    parcelInfo.parcelCategory,
    parcelInfo.weightKg,
    parcelInfo.lengthCm,
    parcelInfo.widthCm,
    parcelInfo.heightCm,
  ]);

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

          <Form.Item
            label="Kích thước (cm)"
            validateStatus={dimensionError ? 'error' : ''}
            help={dimensionError || ''}
          >
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
              value={displayedDepartureStationId}
              onChange={(value) => {
                setRealDepartureStationId(value);
                setDisplayedDepartureStationId(value);
              }}
            >
              {stations.map(station => (
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
              {stations.map(station => (
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
            {realDepartureStationId && selectedDate && (
              <>
                <Flex>
                  <div className="timeLabel" style={{ marginBottom: '1em', marginRight: '1em' }}>
                    <label>Thời gian gửi:</label>
                  </div>
                  <Select
                    placeholder="Chọn giờ gửi"
                    value={selectedTime}
                    onChange={(value) => setSelectedTime(value)}
                    style={{ marginBottom: '1em', marginRight: '1em' }}
                  >
                    {timeOptions.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </Select>
                  <Button onClick={showModal} style={{ marginBottom: '1em' }}>
                    Giờ hoạt động
                  </Button>
                </Flex>
                <p
                  style={{ fontWeight: 'bold', color: 'red', marginBottom: '1em' }}
                >
                  Lưu ý: Đơn hàng sẽ bị hủy nếu khách hàng đến gửi hàng trễ hơn thời gian đã chọn và sẽ không được hoàn phí
                </p>
              </>
            )}
            <Modal
              title="Giờ hoạt động của trạm"
              open={isModalOpen}
              onCancel={handleClose}
              footer={null}
              className="modal-confirm"
            >
              <Table
                columns={[
                  {
                    title: 'Khung giờ',
                    dataIndex: 'shift',
                    key: 'shift',
                    render: shift => `Ca ${shift}`,
                  },
                  {
                    title: 'Bắt đầu',
                    dataIndex: 'from',
                    key: 'from',
                  },
                  {
                    title: 'Kết thúc',
                    dataIndex: 'to',
                    key: 'to',
                  },
                ]}
                dataSource={timeSlot.map((slot, index) => ({
                  key: index,
                  shift: slot.shift,
                  from: slot.openTime,
                  to: slot.closeTime,
                }))}
              />
            </Modal>
          </div>
          <div className="insurance-fee" style={{ marginBottom: "1em" }}>
            <Checkbox>
              Áp dụng bảo hiểm hàng hóa: {parcelCategory.find(cat => cat.id === parcelInfo.parcelCategory)?.insuranceFeeVnd || 0} VND
            </Checkbox>
          </div>
          <div
            className="solutions"
            style={{
              marginBottom: '1em',
              display: 'flex',
              justifyContent: 'center',
              gap: '1em',
            }}
          >
            {routeSolutions.map((solution, i) => {
              const isSelected = selectedSolutionIndex === i;

              const bgMap = {
                shortest: '#4CAF50',
                standard: '#0066CC',
                nearest: '#FFC107',
              };
              const hoverMap = {
                shortest: '#449d48',
                standard: '#005bb5',
                nearest: '#e6ac00',
              };

              const bg = bgMap[solution.type] || '#ccc';
              const hover = hoverMap[solution.type] || '#aaa';

              return (
                <div
                  key={solution.type}
                  style={{
                    cursor: 'pointer',
                    padding: '1.5em',
                    borderRadius: '1em',
                    backgroundColor: isSelected ? bg : '#fff',
                    color: isSelected ? '#fff' : '#000',
                    border: `2px solid ${bg}`,
                    transition: 'all 0.3s ease',
                    flex: '1 1 0',
                    boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 6px rgba(0,0,0,0.1)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = hover;
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = isSelected ? bg : '#fff';
                    e.currentTarget.style.color = isSelected ? '#fff' : '#000';
                  }}
                  onClick={() => {
                    setSelectedSolutionIndex(i);
                    setPriceVnd(solution.data?.totalCostVnd);
                    setTotalKm(solution.data?.totalKm);
                    setChargeableWeight(solution.data?.parcels?.[0].chargeableWeight);
                    const firstStation = solution.data?.stations?.[0];
                    if (firstStation) {
                      setDisplayedDepartureStationId(firstStation.stationId);
                      setMetroSelector(prev => ({ ...prev, departureStationId: firstStation.stationId }));
                    }
                  }}
                >
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5em' }}>
                    {solution.label}
                  </h3>
                  <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>
                    {solution.type === 'shortest'
                      ? 'Tiết kiệm chi phí'
                      : solution.type === 'nearest'
                        ? 'Trạm gần hơn • Phí cao hơn'
                        : 'Giao hàng thông thường'}
                  </p>
                  <p style={{ marginTop: '1em', fontWeight: 'bold', fontSize: '1rem' }}>
                    {solution.data?.totalCostVnd
                      ? Number(solution.data?.totalCostVnd).toLocaleString() + ' VND'
                      : 'Đang tính...'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default ParcelInfo;
