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
  const [includeOptionalInsurance, setIncludeOptionalInsurance] = useState(false);

  //MODAL OPERATION
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
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

  const filterValidTimeSlots = (timeSlots, selectedDate) => {
    const now = dayjs();
    const isToday = selectedDate && dayjs(selectedDate).isSame(now, 'day');

    return timeSlots.filter(slot => {
      if (!isToday) return true;

      const [h, m] = slot.openTime.split(':').map(Number);
      const slotTime = dayjs().hour(h).minute(m).second(0)
        .subtract(slot.scheduleBeforeShiftMinutes || 0, 'minute');

      return now.isBefore(slotTime);
    });
  };

  const getSingleTimeOptions = () => {
    const validSlots = filterValidTimeSlots(timeSlot, selectedDate);

    return validSlots.map((slot) => {
      const [h, m] = slot.openTime.split(':').map(Number);
      const baseTime = dayjs().hour(h).minute(m).second(0);

      const latestDrop = baseTime.subtract(slot.scheduleBeforeShiftMinutes || 30, 'minute');
      const earliestDrop = baseTime.subtract(slot.maxScheduleBeforeShiftMinutes || 120, 'minute');

      return {
        label: `${earliestDrop.format('HH:mm')} - ${latestDrop.format('HH:mm')}`,
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
    const now = dayjs();
    const today = now.startOf('day');
    const selected = dayjs(current).startOf('day');

    if (selected.isBefore(today)) return true;

    if (!timeSlot || timeSlot.length === 0) {
      return false;
    }

    //FIND LAST SHIFT
    const caLast = timeSlot.reduce((latest, cur) =>
      cur.shift > latest.shift ? cur : latest, timeSlot[0]
    );

    const [h, m] = caLast.openTime.split(':').map(Number);
    const buffer = caLast.scheduleBeforeShiftMinutes || 0;

    const deadline = dayjs(today).hour(h).minute(m).subtract(buffer, 'minute');

    //DISABLE TODAY IF LAST SHIFT 
    if (selected.isSame(today, 'day') && now.isAfter(deadline)) {
      return true;
    }
    return false;
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

  const fetchChargeableWeight = async ({ weightKg, lengthCm, widthCm, heightCm }) => {
    try {
      const res = await api.post("/parcels/chargeable-weight", {
        weightKg, lengthCm, widthCm, heightCm
      });
      return res.data?.data || 0;
    } catch (err) {
      console.error("Lỗi khi tính chargeable weight", err);
      return 0;
    }
  };

  const updateParcel = async (index, field, value) => {
    const updatedList = [...parcelInfo];
    updatedList[index][field] = value;
    const affectedFields = ['weightKg', 'lengthCm', 'widthCm', 'heightCm'];
    const currentParcel = updatedList[index];

    if (affectedFields.includes(field)) {
      const { weightKg, lengthCm, widthCm, heightCm } = currentParcel;

      if (weightKg && lengthCm && widthCm && heightCm) {
        const calculatedWeight = await fetchChargeableWeight({
          weightKg: Number(weightKg),
          lengthCm: Number(lengthCm),
          widthCm: Number(widthCm),
          heightCm: Number(heightCm),
        });
        updatedList[index].chargeableWeight = calculatedWeight;
      }
    }

    // if (field === 'parcelCategory') {
    //   const selectedCat = parcelCategory.find(cat => cat.id === value);

    //   updatedList[index].categoryInsuranceId = selectedCat?.categoryInsurances?.[0]?.id || "";
    //   updatedList[index].isInsuranceIncluded = selectedCat?.isInsuranceRequired || false;
    //   updatedList[index].includeOptionalInsurance = updatedList[index].includeOptionalInsurance ?? false;

    //   if (selectedCat?.isInsuranceRequired) {
    //     updatedList[index].valueVnd = updatedList[index].valueVnd;
    //   } else {
    //     delete updatedList[index].valueVnd;
    //   }
    // }
    if (field === 'parcelCategory') {
      const selectedCat = parcelCategory.find(cat => cat.id === value);

      updatedList[index].categoryInsuranceId =
        selectedCat?.categoryInsurances?.[0]?.id || '';

      //REQUIRED INSURANCE
      if (selectedCat?.isInsuranceRequired) {
        updatedList[index].includeOptionalInsurance = false;
        updatedList[index].valueVnd = updatedList[index].valueVnd; //USER INPUT VALUEVND
      } else {
        updatedList[index].includeOptionalInsurance = updatedList[index].includeOptionalInsurance ?? false;
        delete updatedList[index].valueVnd;
      }
    }
    setParcelInfo(updatedList);
  };

  //GET ACTIVE POLICY
  const getPolicyForCategory = (categoryId) => {
    const cat = parcelCategory.find(c => c.id === categoryId);
    return cat?.categoryInsurances?.find(i => i.insurancePolicy?.isActive)?.insurancePolicy || null;
  };

  //OPTIONAL INSURANCE (CHECKBOX IS CHECKED)
  const computeOptionalInsuranceFeeForParcel = (p) => {
    const policy = getPolicyForCategory(p.parcelCategory);
    if (!p?.includeOptionalInsurance || !policy) return 0;

    const cat = parcelCategory.find(c => c.id === p.parcelCategory);
    const base = Number(policy.baseFeeVnd || 0);

    //BASEFEEVND FOR OPTIONAL
    if (!cat?.isInsuranceRequired) {
      return Math.round(base);
    }

    //INSURANCERATE FOR REQUIRED
    const value = Number(p.valueVnd || 0);
    const rate = Number(policy.insuranceFeeRateOnValue || 0);

    const ratePart = value * rate;

    return Math.round(base + ratePart);
  };

  //TOTAL OPTIONAL INSURANCE FEE
  const computeOptionalInsuranceTotal = () => parcelInfo.reduce((sum, p) => sum + computeOptionalInsuranceFeeForParcel(p), 0);

  const addNewParcel = () => {
    setParcelInfo([
      ...parcelInfo,
      {
        parcelCategory: "",
        categoryInsuranceId: "",
        weightKg: "",
        lengthCm: "",
        heightCm: "",
        widthCm: "",
        description: "",
        descriptionImageUrl: "",
        isInsuranceIncluded: false,
        insuranceFeeVnd: "",
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
        categoryInsuranceId: p.categoryInsuranceId || '',
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

  //DEBOUNCE API
  useEffect(() => {
    const ready =
      realDepartureStationId &&
      metroSelector.destinationStationId &&
      metroSelector.departureDateTime &&
      parcelInfo.length > 0 &&
      parcelInfo.every(p =>
        p.parcelCategory && p.weightKg && p.lengthCm && p.widthCm && p.heightCm
      );

    if (!ready) return;

    const handler = setTimeout(() => {
      fetchTotalPriceItinerary();
    }, 800); //800MS AFTER CHANGING

    return () => clearTimeout(handler);
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

  //RELOAD DATA WHEN BACK-WARD
  useEffect(() => {
    const storedData = sessionStorage.getItem("parcelFormData");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.parcelInfo) setParcelInfo(parsed.parcelInfo);
        if (parsed.metroSelector) setMetroSelector(parsed.metroSelector);
        if (parsed.pickedDate) {
          setPickedDate(parsed.pickedDate);
          setSelectedDate(parsed.pickedDate);
        }
        if (parsed.pickedTime) {
          setPickedTime(parsed.pickedTime);
          setSelectedTime(parsed.pickedTime);
        }
        if (parsed.timeSlots) setTimeSlots(parsed.timeSlots);
        if (parsed.selectedSolutionIndex !== undefined) setSelectedSolutionIndex(parsed.selectedSolutionIndex);
        if (parsed.displayedDepartureStationId) setDisplayedDepartureStationId(parsed.displayedDepartureStationId);
        if (parsed.realDepartureStationId) setRealDepartureStationId(parsed.realDepartureStationId);
      } catch (e) {
        console.error("Lỗi khi parse dữ liệu cache:", e);
      }
    }
  }, []);

  //SAVE DATA AFTER CHANGING
  useEffect(() => {
    const saveData = {
      parcelInfo,
      metroSelector,
      pickedDate,
      pickedTime,
      timeSlots,
      selectedSolutionIndex,
      displayedDepartureStationId,
      realDepartureStationId
    };
    sessionStorage.setItem("parcelFormData", JSON.stringify(saveData));
  }, [
    parcelInfo,
    metroSelector,
    pickedDate,
    pickedTime,
    timeSlots,
    selectedSolutionIndex,
    displayedDepartureStationId,
    realDepartureStationId
  ]);

  //JUST UI CHANGE - NOT TRIGGER API
  const persistUiTotals = (solution) => {
    const base = Number(solution?.data?.totalCostVnd || 0);
    const opt = computeOptionalInsuranceTotal();
    const uiFinal = base + opt;

    const breakdown = parcelInfo.map((p, i) => ({
      parcelIndex: i,
      categoryId: p.parcelCategory,
      includeOptionalInsurance: !!p.includeOptionalInsurance,
      declaredValueVnd: Number(p.valueVnd || 0),
      optionalInsuranceFeeVnd: computeOptionalInsuranceFeeForParcel(p),
    }));
    sessionStorage.setItem('uiFinalTotalCostVnd', String(uiFinal));
    sessionStorage.setItem('uiOptionalInsuranceTotalVnd', String(opt));
    sessionStorage.setItem('uiOptionalInsuranceBreakdown', JSON.stringify(breakdown));
  };

  return (
    <>
      <div>
        <Title level={4}>Điền thông tin kiện hàng</Title>
        {/* PARCEL INFORMATION */}
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
                onChange={async (value) => await updateParcel(index, 'parcelCategory', value)}
              >
                {parcelCategory.map(cat => (
                  <Option key={cat.id} value={cat.id}>{cat.categoryName}</Option>
                ))}
              </Select>

              {/* OPTIONAL INSURANCE */}
              {(() => {
                const selectedCat = parcelCategory.find(cat => cat.id === parcel.parcelCategory);
                const policy = selectedCat?.categoryInsurances
                  ?.find(ins => ins.insurancePolicy?.isActive)?.insurancePolicy;

                if (selectedCat && !selectedCat.isInsuranceRequired) {
                  const baseFee = policy?.baseFeeVnd ?? 0;
                  return (
                    <Checkbox
                      style={{ marginTop: '0.5em', color: '#444' }}
                      checked={parcel.includeOptionalInsurance || false}
                      onChange={(e) => {
                        const updated = [...parcelInfo];
                        updated[index].includeOptionalInsurance = e.target.checked;
                        setParcelInfo(updated);
                      }}
                    >
                      Tính phí bảo hiểm cho hàng này
                      {policy ? ` (${baseFee.toLocaleString('vi-VN')} VND)` : ' (sẽ cộng khi tính giá)'}
                    </Checkbox>
                  );
                }
                return null;
              })()}

              {/* REQUIRED INSURANCE */}
              {(() => {
                const selectedCat = parcelCategory.find(c => c.id === parcel.parcelCategory);
                const policy = selectedCat?.categoryInsurances?.find(ins => ins.insurancePolicy?.isActive)?.insurancePolicy;
                if (selectedCat?.isInsuranceRequired || selectedCat?.insuranceRate) {
                  return (
                    <div style={{ color: 'red', fontWeight: 500, marginTop: '0.5em' }}>
                      ⚠️ Loại hàng này bắt buộc áp dụng bảo hiểm. Phí bảo hiểm: {policy.insuranceFeeRateOnValue * 100}% trên giá trị món hàng.
                      <div>
                        ⚠️ Đây là loại hàng đặc biệt, vui lòng đọc kỹ <a href={PATH_NAME.PARCEL_RULES} target="_blank" rel="noopener noreferrer">chính sách gửi hàng</a> trước khi gửi.
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* UPLOAD BILL */}
              {(() => {
                const selectedCat = parcelCategory.find(cat => cat.id === parcel.parcelCategory);
                const policy = selectedCat?.categoryInsurances?.find(ins => ins.insurancePolicy?.isActive)?.insurancePolicy;
                if (selectedCat?.isInsuranceRequired) {
                  const insuranceCost = Math.round((parcel.valueVnd || 0) * policy.insuranceFeeRateOnValue);
                  return (
                    <Form.Item label="Giá trị món hàng (VND)" style={{ marginTop: '1em' }}>
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        value={parcel.valueVnd}
                        onChange={(value) => updateParcel(index, 'valueVnd', value)}
                      />
                      <div style={{ marginTop: '0.5em', color: '#888' }}>
                        Phí bảo hiểm: {insuranceCost.toLocaleString('vi-VN')} VND
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
                          setCurrentParcelIndex(index);
                          setVerifyModalOpen(true);
                        }}
                      >
                        Upload hóa đơn
                      </Button>
                    </Form.Item>
                  );
                }
                return null;
              })()}
            </Form.Item>

            <Form.Item label="Trọng lượng (kg)">
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                value={parcel.weightKg}
                onChange={async (value) => updateParcel(index, 'weightKg', value)}
              />
            </Form.Item>
            <Form.Item label="Kích thước (cm)">
              <Input.Group compact>
                <InputNumber
                  min={0}
                  placeholder="Dài"
                  style={{ width: '33%' }}
                  value={parcel.lengthCm}
                  onChange={async (value) => updateParcel(index, 'lengthCm', value)}
                />
                <InputNumber
                  min={0}
                  placeholder="Rộng"
                  style={{ width: '33%' }}
                  value={parcel.widthCm}
                  onChange={async (value) => updateParcel(index, 'widthCm', value)}
                />
                <InputNumber
                  min={0}
                  placeholder="Cao"
                  style={{ width: '33%' }}
                  value={parcel.heightCm}
                  onChange={async (value) => updateParcel(index, 'heightCm', value)}
                />
              </Input.Group>
              {dimensionError[index] && (
                <div style={{ color: 'red', marginTop: '0.5em', fontWeight: 500 }}>
                  {dimensionError[index]}
                </div>
              )}
            </Form.Item>
            <Form.Item label="Trọng lượng quy đổi (kg)">
              <InputNumber
                style={{ width: '100%' }}
                value={parcel.chargeableWeight}
                disabled
              />
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

        {/* METRO DEPARTURE & DESTINATION */}
        <div className="metro-selector">
          <Title level={4}>Chọn trạm Metro</Title>
          <div className="selector-group">
            <label>Trạm gửi:</label>
            <Select
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
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
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
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

          {/* DATE - TIME PICKER */}
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
                  Lưu ý:
                </p>
                <p
                  style={{ fontWeight: 'bold', color: 'red', marginBottom: '1em' }}
                >
                  Đơn hàng sẽ bị hủy nếu khách hàng đến gửi hàng trễ hơn thời gian đã chọn và sẽ không được hoàn phí.
                </p>
                <p
                  style={{ fontWeight: 'bold', color: 'red', marginBottom: '1em' }}
                >
                  MetroShip chỉ hỗ trợ nhận hàng trong khoảng thời gian khách đã chọn.
                </p>
              </>
            )}

            {/* METRO TIME SLOT */}
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

          {/* 3 SOLUTIONS RENDER */}
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

              {/* OPTIONAL INSURANCE FEE */ }
              const optionalFee = computeOptionalInsuranceTotal(); 
              const displayPrice = (solution.data?.totalCostVnd || 0) + optionalFee;

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
                    persistUiTotals(solution); 
                  }}
                >
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5em' }}>
                    {solution.label}
                  </h3>
                  <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>
                    {
                      solution.type === 'shortest'
                        ? 'Giá tối ưu'
                        : solution.type === 'nearest'
                          ? 'Gần bạn nhất '
                          : 'Do bạn chọn'
                    }
                  </p>
                  <p style={{ marginTop: '1em', fontWeight: 'bold', fontSize: '1rem' }}>
                    {displayPrice.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VND
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
              formData.append("file", verifyImages);

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
                  if (file) setVerifyImages(file);
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
