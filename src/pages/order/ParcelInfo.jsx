import 'leaflet/dist/leaflet.css';

import { Button, Checkbox, DatePicker, Form, Input, InputNumber, Modal, Select, Table } from 'antd';
import { useEffect, useState } from 'react';

import Card from 'antd/es/card/Card';
import Title from 'antd/es/skeleton/Title';
import api from '../../config/axios';
import dayjs from 'dayjs';
import metroTimeSlot from './../../constants/data';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayedDepartureStationId, setDisplayedDepartureStationId] = useState(null);
  const [realDepartureStationId, setRealDepartureStationId] = useState(null);
  const userLatitude = parseFloat(localStorage.getItem('userLatitude')) || 0;
  const userLongitude = parseFloat(localStorage.getItem('userLongitude')) || 0;
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };
  const handleChange = (field, value) => {
    setParcelInfo({ ...parcelInfo, [field]: value });
  };
  const getSingleTimeOptions = () => {
    return Object.entries(metroTimeSlot).map(([key, slot]) => {
      const [h, m] = slot.from.split(':').map(Number);
      const date = new Date();
      date.setHours(h, m - 30, 0, 0); // -30 phút

      const padded = (n) => n.toString().padStart(2, '0');
      const formattedTime = `${padded(date.getHours())}:${padded(date.getMinutes())}`;

      return {
        label: formattedTime,
        value: formattedTime,
      };
    });
  };
  const timeOptions = getSingleTimeOptions();

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
        const combinedDateTime = dateObj.hour(hour).minute(minute).second(0).format("YYYY-MM-DDTHH:mm:ss");
        setMetroSelector(prev => ({ ...prev, departureDateTime: combinedDateTime }));
      }
    }
  }, [selectedDate, selectedTime]);

  const [metros, setMetros] = useState([]);
  const [parcelCategory, setParcelCategory] = useState([]);

  // const handleDepartureChange = (value) => {
  //   setMetroSelector(prev => {
  //     if (prev.departureStationId !== value) {
  //       return { ...prev, departureStationId: value };
  //     }
  //     return prev;
  //   });
  // };



  const handleDestinationChange = value => {
    setMetroSelector(prev => ({ ...prev, destinationStationId: value }));
  };

  const disabledDate = current => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysAhead = new Date();
    threeDaysAhead.setDate(today.getDate() + 2);
    threeDaysAhead.setHours(23, 59, 59, 999); // để tính hết ngày
    return (
      current &&
      (current.valueOf() < today.getTime() || current.valueOf() <= threeDaysAhead.getTime())
    );
  };

  const buildPriceItineraryPayload = () => {
    const basePayload = {
      departureStationId: realDepartureStationId || '',
      destinationStationId: metroSelector.destinationStationId || '',
      scheduleShipmentDate: metroSelector.departureDateTime || null,
      parcels: [
        {
          parcelCategoryId: parcelInfo.parcelCategory || '',
          weightKg: Number(parcelInfo.weightKg) || 0,
          lengthCm: Number(parcelInfo.lengthCm) || 0,
          widthCm: Number(parcelInfo.widthCm) || 0,
          heightCm: Number(parcelInfo.heightCm) || 0,
          chargeableWeight: Number(parcelInfo.chargeableWeight) || 0,
          isBulk: parcelInfo.isBulk || false,
          priceVnd: 0,
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

      if (!data) return;

      const chargeableWeight = data.parcelRequests?.[0]?.chargeableWeight || 0;
      setParcelInfo(prev => ({
        ...prev,
        chargeableWeight,
      }));

      // 🎯 Tính giá từ 3 phương án API trả về
      const solutions = [
        { type: 'standard', data: data.standard, label: 'Tiêu chuẩn' },
        { type: 'nearest', data: data.nearest, label: 'Ưu tiên' },
        { type: 'cheapest', data: data.cheapest, label: 'Tốt nhất' },
      ];

      const newRouteSolutions = solutions.map(s => {
        const fee = s.data.shippingFeeByItinerary || 0;
        const price = chargeableWeight * fee;

        return {
          type: s.type,
          label: s.label,
          priceVnd: price,
          ...s.data, // 👈 gộp tất cả routes, stations, metroLines vào
        };
      });

      setRouteSolutions(newRouteSolutions);

      // 🧠 Chọn mặc định là “Tiêu chuẩn”
      const defaultIndex = newRouteSolutions.findIndex(s => s.type === 'standard');
      if (defaultIndex >= 0) {
        setSelectedSolutionIndex(defaultIndex);
        setPriceVnd(newRouteSolutions[defaultIndex].priceVnd);

        const firstStation = newRouteSolutions[defaultIndex].stations?.[0];
        if (firstStation) {
          setMetroSelector(prev => ({ ...prev, departureStationId: firstStation.stationId }));
          setDisplayedDepartureStationId(firstStation.stationId); // ✅ UI sync
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
    realDepartureStationId, // ✅ Only real one triggers API
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
              value={displayedDepartureStationId}
              onChange={(value) => {
                // handleDepartureChange();
                setRealDepartureStationId(value); // 🧠 Trigger fetch
                setDisplayedDepartureStationId(value); // 👀 UI update
              }}
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
            {realDepartureStationId && selectedDate && (
              <>
                <Button onClick={showModal} style={{ marginBottom: '1em' }}>
                  Giờ hoạt động
                </Button>
                <div className="timeLabel">
                  <label>Thời gian gửi:</label>
                </div>

                <Select
                  placeholder="Chọn giờ gửi"
                  style={{ width: '100%', marginBottom: "1em", marginTop: "1em" }}
                  className="dateSelector__time"
                  onChange={(value) => setSelectedTime(value)}
                >
                  {timeOptions.map((opt) => (
                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                  ))}
                </Select>


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
              footer={[
                <Button key="close" onClick={handleClose} className="cancel-button">
                  Đóng
                </Button>
              ]}
              className="modal-confirm"
            >
              <Table
                columns={[
                  {
                    title: 'Khung giờ',
                    dataIndex: 'label',
                    key: 'label',
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
                dataSource={Object.entries(metroTimeSlot).map(([key, value], index) => ({
                  key: index,
                  label: value.label,
                  from: value.from,
                  to: value.to,
                }))}
              />
            </Modal>
          </div>
          <div className="night-discount" style={{ marginBottom: "1em" }}>
            <Checkbox>
              Giao vào ban đêm: Giảm 20% trên tổng giá trị đơn hàng
            </Checkbox>
          </div>
          <div className="insurance-fee" style={{ marginBottom: "1em" }}>
            <Checkbox>
              Phí bảo hiểm: 5% trên tổng giá trị đơn hàng
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
                cheapest: '#4CAF50',
                standard: '#0066CC',
                nearest: '#FFC107',
              };
              const hoverMap = {
                cheapest: '#449d48',
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
                    setPriceVnd(solution.priceVnd);

                    const firstStation = solution.stations?.[0];
                    if (firstStation) {
                      setDisplayedDepartureStationId(firstStation.stationId);
                      setMetroSelector(prev => ({ ...prev, departureStationId: firstStation.stationId }));
                      // 💡 Nhưng không setRealDepartureStationId => không fetch lại!
                    }
                  }}



                >
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5em' }}>
                    {solution.label}
                  </h3>
                  <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>
                    {solution.type === 'cheapest'
                      ? 'Tiết kiệm chi phí'
                      : solution.type === 'nearest'
                        ? 'Trạm gần hơn • Phí cao hơn'
                        : 'Giao hàng thông thường'}
                  </p>
                  <p style={{ marginTop: '1em', fontWeight: 'bold', fontSize: '1rem' }}>
                    {solution.priceVnd
                      ? Number(solution.priceVnd).toLocaleString() + ' VND'
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
