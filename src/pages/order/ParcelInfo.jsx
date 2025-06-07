import 'leaflet/dist/leaflet.css';

import { Button, Checkbox, DatePicker, Form, Input, InputNumber, Modal, Select, Table } from 'antd';
import { useEffect, useState } from 'react';

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

  const handleDepartureChange = value => {
    setMetroSelector(prev => ({ ...prev, departureStationId: value }));
  };

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

  const buildPriceItineraryPayload = () => ({
    departureStationId: metroSelector.departureStationId || '',
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
  });

  const fetchTotalPriceItinerary = async () => {
    const payload = buildPriceItineraryPayload();

    try {
      const res = await api.post('/shipments/total-price-itinerary', payload);
      const data = res.data?.data;

      if (data) {
        // Lấy chargeableWeight từ API và cập nhật vào parcelInfo
        const chargeableWeightFromApi = data.parcelRequests?.[0]?.chargeableWeight || 0;
        setParcelInfo(prev => ({
          ...prev,
          chargeableWeight: chargeableWeightFromApi,
        }));

        const shippingFee = Number(data.bestPathGraphResponses?.[0]?.shippingFeeByItinerary) || 0;
        const totalPrice = chargeableWeightFromApi * shippingFee;
        setPriceVnd(totalPrice);
        setRouteSolutions(data.bestPathGraphResponses || []);
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
  }, [metroSelector]);

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
            {metroSelector.departureStationId && selectedDate && (
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
          <div className="insurance-fee">
            <Checkbox>
              Phí bảo hiểm: 5% trên tổng giá trị đơn hàng
            </Checkbox>
          </div>
          <div className="calculatePrice">
            <p>
              Giá tiền dự tính: {priceVnd ? Number(priceVnd).toLocaleString() + ' VND' : 'Chưa có'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ParcelInfo;
