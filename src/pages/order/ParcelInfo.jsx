import 'leaflet/dist/leaflet.css';

import { Button, Checkbox, DatePicker, Flex, Form, Input, InputNumber, Modal, Select, Table } from 'antd';
import { getAllParcelCategories, getAllStations, getMetroLines, getMetroTimeSlots } from '../../config/metroApi';
import { useEffect, useState } from 'react';

import Title from 'antd/es/skeleton/Title';
import api from '../../config/axios';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { toast } from 'react-toastify';
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
          const combinedDateTime = dateObj.hour(hour).minute(minute).subtract(30, 'minute').second(0).format("YYYY-MM-DDTHH:mm:ss[Z]");
          console.log(selectedSlot.id);
          console.log('Combined DateTime:', combinedDateTime);
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

  const updateParcel = (index, field, value) => {
    const updatedList = [...parcelInfo];
    updatedList[index][field] = value;
    setParcelInfo(updatedList);
  };

  const addNewParcel = () => {
    setParcelInfo([
      ...parcelInfo,
      {
        parcelCategory: "",
        weightKg: "",
        lengthCm: "",
        heightCm: "",
        widthCm: "",
        description: "",
      },
    ]);
  };

  const buildPriceItineraryPayload = () => {
    return {
      departureStationId: realDepartureStationId || '',
      destinationStationId: metroSelector.destinationStationId || '',
      scheduledDateTime: metroSelector.departureDateTime || null,
      timeSlotId: selectedTime || '',
      parcels: parcelInfo.map(p => ({
        parcelCategoryId: p.parcelCategory || '',
        weightKg: Number(p.weightKg) || 0,
        lengthCm: Number(p.lengthCm) || 0,
        widthCm: Number(p.widthCm) || 0,
        heightCm: Number(p.heightCm) || 0,
      })),
      userLatitude,
      userLongitude,
    };
  };

  useEffect(() => {
    const ready =
      realDepartureStationId &&
      metroSelector.destinationStationId &&
      metroSelector.departureDateTime &&
      parcelInfo.length > 0 &&
      parcelInfo.every(p =>
        p.parcelCategory && p.weightKg && p.lengthCm && p.widthCm && p.heightCm
      );

    if (ready) {
      fetchTotalPriceItinerary();
    }
  }, [
    realDepartureStationId,
    metroSelector.destinationStationId,
    metroSelector.departureDateTime,
    selectedDate,
    selectedTime,
    JSON.stringify(parcelInfo)
  ]);

  const fetchTotalPriceItinerary = async () => {
    const payload = buildPriceItineraryPayload();

    try {
      const res = await api.post('/shipments/total-price-itinerary', payload);
      const data = res.data?.data;
      const standardData = data?.standard;
      const standardParcels = standardData?.parcels || [];

      const solutions = [
        { type: 'standard', data: standardData, label: 'Tiêu chuẩn' },
        { type: 'nearest', data: data.nearest, label: 'Ưu tiên' },
        { type: 'shortest', data: data.shortest, label: 'Tốt nhất' },
      ];

      setRouteSolutions(solutions);

      const defaultIndex = solutions.findIndex(s => s.type === 'standard');

      if (defaultIndex >= 0) {
        const selected = solutions[defaultIndex];
        const stations = selected.data?.stations || [];
        const parcels = selected.data?.parcels || [];

        // Update các parcel trong form với thông tin từ response
        const updatedParcels = parcelInfo.map((original, i) => ({
          ...original,
          shippingFeeVnd: parcels[i]?.shippingFeeVnd || 0,
          insuranceFeeVnd: parcels[i]?.insuranceFeeVnd || 0,
          chargeableWeight: parcels[i]?.chargeableWeight || 0,
          priceVnd: parcels[i]?.priceVnd || 0,
          isBulk: i > 0,
        }));
        setParcelInfo(updatedParcels);

        // Tổng quan đơn hàng
        setSelectedSolutionIndex(defaultIndex);
        setPriceVnd(selected.data?.totalCostVnd || 0);
        setTotalKm(selected.data?.totalKm || 0);
        setShippingFeeVnd(selected.data?.totalShippingFeeVnd || 0);
        setChargeableWeight(parcels[0]?.chargeableWeight || 0);

        const firstStation = stations[0];
        if (firstStation) {
          setMetroSelector(prev => ({ ...prev, departureStationId: firstStation.stationId }));
          setDisplayedDepartureStationId(firstStation.stationId);
        }
      }
    } catch (error) {
      toast.error('Không thể lấy giá vận chuyển. Vui lòng thử lại sau.');
      console.error('Lỗi fetch giá itinerary:', error);
    }
  };

  // const fetchTotalPriceItinerary = async () => {
  //   const payload = buildPriceItineraryPayload();

  //   try {
  //     const res = await api.post('/shipments/total-price-itinerary', payload);
  //     const data = res.data?.data;

  //     const solutions = [
  //       { type: 'standard', data: data.standard, label: 'Tiêu chuẩn' },
  //       { type: 'nearest', data: data.nearest, label: 'Ưu tiên' },
  //       { type: 'shortest', data: data.shortest, label: 'Tốt nhất' },
  //     ];
  //     setRouteSolutions(solutions);

  //     const defaultIndex = solutions.findIndex(s => s.type === 'standard');
  //     if (defaultIndex >= 0) {
  //       setSelectedSolutionIndex(defaultIndex);
  //       setPriceVnd(solutions[defaultIndex].data?.totalCostVnd);
  //       setTotalKm(solutions[defaultIndex].data?.totalKm);
  //       setChargeableWeight(solutions[defaultIndex].data?.parcels?.[0].chargeableWeight);
  //       setShippingFeeVnd(solutions[defaultIndex].data?.parcels?.[0].shippingFeeVnd);
  //       const firstStation = solutions[defaultIndex].stations?.[0];
  //       if (firstStation) {
  //         setMetroSelector(prev => ({ ...prev, departureStationId: firstStation.stationId }));
  //         setDisplayedDepartureStationId(firstStation.stationId);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Lỗi fetch giá itinerary:', error);
  //   }
  // };

  // useEffect(() => {
  //   const ready =
  //     realDepartureStationId &&
  //     metroSelector.destinationStationId &&
  //     metroSelector.departureDateTime &&
  //     parcelInfo.length > 0 &&
  //     parcelInfo.every(p =>
  //       p.parcelCategory &&
  //       p.weightKg &&
  //       p.lengthCm &&
  //       p.widthCm &&
  //       p.heightCm
  //     );

  //   if (ready) fetchTotalPriceItinerary();
  // }, [
  //   realDepartureStationId,
  //   metroSelector.destinationStationId,
  //   metroSelector.departureDateTime,
  //   parcelInfo,
  // ]);
  const removeParcel = (indexToRemove) => {
    const updated = parcelInfo.filter((_, index) => index !== indexToRemove);
    setParcelInfo(updated);
  };

  return (
    <>
      <div>
        <Title level={4}>Điền thông tin kiện hàng</Title>
        {parcelInfo.map((parcel, index) => (
          <div
            key={index}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ marginBottom: '1em' }}>Kiện hàng {index + 1}</h3>
              {parcelInfo.length > 1 && (
                <Button danger type="text" onClick={() => removeParcel(index)}>
                  Xoá
                </Button>
              )}
            </div>
            <Form.Item label="Loại hàng hóa">
              <Select
                value={parcel.parcelCategory}
                onChange={value => updateParcel(index, 'parcelCategory', value)}
              >
                {parcelCategory.map(cat => (
                  <Option key={cat.id} value={cat.id}>{cat.categoryName}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Trọng lượng (kg)">
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                value={parcel.weightKg}
                onChange={value => updateParcel(index, 'weightKg', value)}
              />
            </Form.Item>
            <Form.Item label="Kích thước (cm)">
              <Input.Group compact>
                <InputNumber
                  min={0}
                  placeholder="Dài"
                  style={{ width: '33%' }}
                  value={parcel.lengthCm}
                  onChange={value => updateParcel(index, 'lengthCm', value)}
                />
                <InputNumber
                  min={0}
                  placeholder="Rộng"
                  style={{ width: '33%' }}
                  value={parcel.widthCm}
                  onChange={value => updateParcel(index, 'widthCm', value)}
                />
                <InputNumber
                  min={0}
                  placeholder="Cao"
                  style={{ width: '33%' }}
                  value={parcel.heightCm}
                  onChange={value => updateParcel(index, 'heightCm', value)}
                />
              </Input.Group>
            </Form.Item>

            <Form.Item label="Mô tả">
              <TextArea
                rows={3}
                value={parcel.description}
                onChange={e => updateParcel(index, 'description', e.target.value)}
              />
            </Form.Item>
          </div>
        ))}
        <Button type="dashed" onClick={addNewParcel} style={{ width: '100%', marginBottom: '2rem' }}>
          +
        </Button>

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
