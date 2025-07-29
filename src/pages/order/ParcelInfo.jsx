import 'leaflet/dist/leaflet.css';

import { Button, Checkbox, DatePicker, Flex, Form, Input, InputNumber, Modal, Select, Spin, Table } from 'antd';
import { getAllParcelCategories, getAllStations, getMetroLines, getMetroTimeSlots } from '../../config/metroApi';
import { useEffect, useState } from 'react';

import { PATH_NAME } from '../../constants/pathname';
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
  const [dimensionError, setDimensionError] = useState([]);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyImages, setVerifyImages] = useState(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentParcelIndex, setCurrentParcelIndex] = useState(null);

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
          const combinedDateTime = dateObj.hour(hour).minute(minute).subtract(30, 'minute').second(0).format("YYYY-MM-DDTHH:mm:ss");
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

  const disabledDate = (current) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset to 00:00 of today

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // +1 day
    return current && current.valueOf() < tomorrow.getTime();
  };


  useEffect(() => {
    const errors = parcelInfo.map((parcel) => {
      const selectedCategory = parcelCategory.find(cat => cat.id === parcel.parcelCategory);
      if (!selectedCategory) return '';

      const { lengthLimitCm, widthLimitCm, heightLimitCm } = selectedCategory;
      const { lengthCm = 0, widthCm = 0, heightCm = 0 } = parcel;

      const errorList = [];
      if (lengthCm > lengthLimitCm) errorList.push(`Chiều dài không được vượt quá ${lengthLimitCm}cm`);
      if (widthCm > widthLimitCm) errorList.push(`Chiều rộng không được vượt quá ${widthLimitCm}cm`);
      if (heightCm > heightLimitCm) errorList.push(`Chiều cao không được vượt quá ${heightLimitCm}cm`);

      return errorList.join(', ');
    });

    setDimensionError(errors);
  }, [parcelInfo, parcelCategory]);


  const updateParcel = (index, field, value) => {
    const updatedList = [...parcelInfo];
    updatedList[index][field] = value;

    if (field === 'parcelCategory') {
      const selectedCat = parcelCategory.find(cat => cat.id === value);
      updatedList[index].isInsuranceIncluded = selectedCat?.isInsuranceRequired || false;

      if (selectedCat?.insuranceRate) {
        updatedList[index].valueVnd = updatedList[index].valueVnd || 0;
      } else {
        delete updatedList[index].valueVnd;
      }
    }

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
        descriptionImageUrl: "",
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
        ...p.valueVnd ? { valueVnd: Number(p.valueVnd) } : {},
        descriptionImageUrl: p.descriptionImageUrl || '',
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

        //PARCELS INFO
        const updatedParcels = parcelInfo.map((original, i) => ({
          ...original,
          shippingFeeVnd: parcels[i]?.shippingFeeVnd || 0,
          insuranceFeeVnd: parcels[i]?.insuranceFeeVnd || 0,
          chargeableWeight: parcels[i]?.chargeableWeight || 0,
          priceVnd: parcels[i]?.priceVnd || 0,
          isBulk: i > 0,
        }));
        setParcelInfo(updatedParcels);

        //SHIPMENT INFO
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
              {parcelCategory.find(c => c.id === parcel.parcelCategory)?.isInsuranceRequired && (
                <div style={{ color: 'red', fontWeight: 500, marginTop: '0.5em' }}>
                  ⚠️ Loại hàng này bắt buộc áp dụng bảo hiểm. Phí bảo hiểm: {parcelCategory.find(c => c.id === parcel.parcelCategory)?.insuranceRate?.toLocaleString() || 0}% trên giá trị món hàng.
                  <div>
                    ⚠️ Đây là loại hàng đặc biệt, vui lòng đọc kỹ <a href={PATH_NAME.PARCEL_RULES} target="_blank" rel="noopener noreferrer">chính sách gửi hàng</a> trước khi gửi.
                  </div>
                </div>
              )}
              {(() => {
                const selectedCat = parcelCategory.find(cat => cat.id === parcel.parcelCategory);
                return selectedCat?.isInsuranceRequired && selectedCat?.insuranceRate > 0;
              })() && (
                  <Form.Item label="Giá trị món hàng (VND)" style={{ marginTop: '1em' }}>
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      value={parcel.valueVnd}
                      onChange={value => updateParcel(index, 'valueVnd', value)}
                    />
                    <div style={{ marginTop: '0.5em', color: '#888' }}>
                      Phí bảo hiểm: {Math.round((parcel.valueVnd || 0) * (parcelCategory.find(cat => cat.id === parcel.parcelCategory)?.insuranceRate)).toLocaleString()} VND
                    </div>
                    {parcel.descriptionImageUrl && (
                      <div style={{ marginTop: 10 }}>
                        <strong>Ảnh hóa đơn:</strong>
                        <div style={{ marginTop: 10 }}>
                          <img
                            src={parcel.descriptionImageUrl}
                            alt="invoice"
                            style={{ width: 120, height: 120, objectFit: "cover", border: "1px solid #ccc" }}
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      style={{ marginTop: '0.5em' }}
                      onClick={() => {
                        setCurrentParcelIndex(index); // 👈 index của kiện hàng
                        setVerifyModalOpen(true);
                      }}>Upload hóa đơn</Button>

                  </Form.Item>
                )}

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
              {dimensionError[index] && (
                <div style={{ color: 'red', marginTop: '0.5em', fontWeight: 500 }}>
                  {dimensionError[index]}
                </div>
              )}
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
              // disabledDate={disabledDate}
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
          {/* <div className="insurance-fee" style={{ marginBottom: "1em" }}>
            <Checkbox>
              Áp dụng bảo hiểm hàng hóa: {parcelCategory.find(cat => cat.id === parcelInfo.parcelCategory)?.insuranceFeeVnd || 0} VND
            </Checkbox>
          </div> */}
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
          <Modal
            title={`Upload ảnh xác minh cho giá trị hàng hóa`}
            open={verifyModalOpen}
            onCancel={() => {
              setVerifyModalOpen(false);
              setVerifyImages(null);
              setUploadedImageUrls(null);
            }}
            onOk={async () => {
              if (verifyImages.length === 0) {
                toast.error("Vui lòng chọn 1 ảnh!");
                return;
              }

              const formData = new FormData();
              formData.append("file", verifyImages); // 👈 chỉ lấy ảnh đầu tiên

              setLoading(true);
              try {
                const uploadRes = await api.post("/media/image", formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                });

                const imageUrl = uploadRes.data?.data || uploadRes.data?.secure_url;
                if (!imageUrl) {
                  toast.error("Không lấy được ảnh sau khi upload.");
                  return;
                }

                // 🔥 Ghi đè ảnh duy nhất cho parcel tương ứng
                setParcelInfo(prev => {
                  const copy = [...prev];
                  copy[currentParcelIndex].descriptionImageUrl = imageUrl;
                  return copy;
                });
                toast.success("Upload ảnh thành công!");
                setVerifyModalOpen(false);
                setVerifyImages(null);
              } catch (error) {
                console.error("Upload thất bại:", error);
                toast.error("Lỗi khi upload. Vui lòng thử lại!");
              } finally {
                setLoading(false);
              }
            }}

            okText="Xác nhận"
            cancelText="Huỷ"
          >
            <Spin spinning={loading} tip="Đang xác nhận hóa đơn" size="large">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setVerifyImages(file); // 👈 chỉ 1 file
                }}
              />

              {verifyImages && (
                <div style={{ marginTop: 10 }}>
                  <strong>Ảnh đã chọn:</strong>
                  <br />
                  <img
                    src={URL.createObjectURL(verifyImages)}
                    alt="preview"
                    style={{ maxWidth: "100%", maxHeight: 200, marginTop: 10 }}
                  />
                </div>
              )}
            </Spin>
          </Modal>
        </div>
      </div>
    </>
  );
}

export default ParcelInfo;
