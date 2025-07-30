import './Order.scss'

import { Button, Col, ConfigProvider, Modal, Row, Spin, Steps, message } from 'antd';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { useEffect, useState } from 'react';

import { Circle } from 'react-leaflet';
import ConfirmPage from './ConfirmPage';
import L from 'leaflet';
import { PATH_NAME } from '../../constants/pathname';
import ParcelInfo from './ParcelInfo';
import PersonalInfo from './PersonalInfo';
import api from '../../config/axios';
import customerIcon from '../../assets/placeholder.webp'
import dayjs from 'dayjs';
import metroMarker from '../../assets/metro-station.webp';
import { selectUser } from '../../redux/features/counterSlice';
import startStation from '../../assets/train.webp';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Order() {
  const [currentStep, setCurrentStep] = useState(0);
  const [personalInfo, setPersonalInfo] = useState({
    senderName: "",
    senderPhone: "",
    recipientName: "",
    recipientPhone: "",
    recipientEmail: "",
    recipientNationalId: "",
  });
  const [metroSelector, setMetroSelector] = useState({
    departureStationId: null,
    destinationStationId: null,
  });
  const [pickedDate, setPickedDate] = useState(null);
  const [pickedTime, setPickedTime] = useState(null);
  const [timeSlots, setTimeSlots] = useState(null);
  const [parcelInfo, setParcelInfo] = useState([{
    parcelCategory: "",
    weightKg: "",
    lengthCm: "",
    heightCm: "",
    widthCm: "",
    description: "",
    descriptionImageUrl: "",
  }]);
  const [userLocation, setUserLocation] = useState({
    latitude: parseFloat(localStorage.getItem('userLatitude')) || 0,
    longitude: parseFloat(localStorage.getItem('userLongitude')) || 0,
  });
  const [loading, setLoading] = useState(false);
  const [chargeableWeight, setChargeableWeight] = useState(0);
  const [shippingFeeVnd, setShippingFeeVnd] = useState(0);
  const [totalKm, setTotalKm] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const user = useSelector(selectUser);
  const nav = useNavigate();
  const [routeSolutions, setRouteSolutions] = useState([]); // chứa giải pháp từ API
  const [selectedSolutionIndex, setSelectedSolutionIndex] = useState(0); // đang chọn giải pháp nào
  const [priceVnd, setPriceVnd] = useState(null); // giá
  const [stationDistances, setStationDistances] = useState(0);

  const customIcon = L.icon({
    iconUrl: metroMarker,
    iconSize: [40, 40],       // size icon (pixel)
    iconAnchor: [20, 40],     // tâm điểm icon nằm dưới
    popupAnchor: [0, -40],    // vị trí popup
  });

  const cusIcon = L.icon({
    iconUrl: customerIcon,
    iconSize: [40, 40],       // size icon (pixel)
    iconAnchor: [20, 40],     // tâm điểm icon nằm dưới
    popupAnchor: [0, -40],    // vị trí popup
  });

  const startMetro = L.icon({
    iconUrl: startStation,
    iconSize: [40, 40],       // size icon (pixel)
    iconAnchor: [20, 40],     // tâm điểm icon nằm dưới
    popupAnchor: [0, -40],    // vị trí popup
  });

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    handleSubmit();
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          localStorage.setItem('userLatitude', latitude);
          localStorage.setItem('userLongitude', longitude);
          setUserLocation({ latitude, longitude });
          toast.success('Vị trí đã được lưu thành công!');
        },
        (error) => {
          message.error('Không thể lấy vị trí của bạn. Bạn sẽ không thể nhận được gợi ý tuyến đường.');
        }
      );
    } else {
      toast.error('Trình duyệt của bạn không hỗ trợ tính năng lấy vị trí.');
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('userLatitude') || !localStorage.getItem('userLongitude')) {
      setIsLocationModalOpen(true);
    }
  }, []);

  const steps = [
    {
      title: "Xác nhận thông tin cá nhân",
      component: (
        <PersonalInfo
          personalInfo={personalInfo}
          setPersonalInfo={setPersonalInfo}
          onNext={() => setCurrentStep(1)}
        />
      ),
    },
    {
      title: "Thông tin kiện hàng",
      component: (
        <ParcelInfo
          personalInfo={personalInfo}
          setPersonalInfo={setPersonalInfo}
          parcelInfo={parcelInfo}
          setParcelInfo={setParcelInfo}
          metroSelector={metroSelector}
          setMetroSelector={setMetroSelector}
          pickedDate={pickedDate}
          setPickedDate={setPickedDate}
          pickedTime={pickedTime}
          setPickedTime={setPickedTime}
          timeSlots={timeSlots}
          setTimeSlots={setTimeSlots}
          routeSolutions={routeSolutions}
          setRouteSolutions={setRouteSolutions}
          selectedSolutionIndex={selectedSolutionIndex}
          setSelectedSolutionIndex={setSelectedSolutionIndex}
          totalKm={totalKm}
          setTotalKm={setTotalKm}
          priceVnd={priceVnd}
          setPriceVnd={setPriceVnd}
          chargeableWeight={chargeableWeight}
          setChargeableWeight={setChargeableWeight}
          shippingFeeVnd={shippingFeeVnd}
          setShippingFeeVnd={setShippingFeeVnd}
          onNext={() => setCurrentStep(2)}
        />
      ),
    },
    {
      title: "Xác nhận thông tin đơn hàng",
      component: (
        <ConfirmPage
          personalInfo={personalInfo}
          metroSelector={metroSelector}
          parcelInfo={parcelInfo}
          pickedDate={pickedDate}
          pickedTime={pickedTime}
          timeSlots={timeSlots}
          priceVnd={priceVnd}
          routeSolutions={routeSolutions}
          selectedSolutionIndex={selectedSolutionIndex}
        />
      ),
    },
  ];
  const handleNext = () => {

    if (currentStep === 0) {
      if (!personalInfo.recipientName?.trim() || !personalInfo.recipientPhone?.trim()) {
        toast.error("Vui lòng điền đầy đủ thông tin người nhận");
        return;
      }
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      showModal();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
    }
  };

  // const buildPayload = () => {
  //   const {
  //     senderName,
  //     senderPhone,
  //     recipientName,
  //     recipientPhone,
  //     recipientEmail,
  //     recipientNationalId,
  //   } = personalInfo;

  //   const { departureStationId, destinationStationId, departureDateTime } = metroSelector;

  //   const {
  //     parcelCategory,
  //     weightKg,
  //     lengthCm,
  //     widthCm,
  //     heightCm,
  //     isBulk,
  //   } = parcelInfo;

  //   // Lấy giải pháp tuyến đã chọn
  //   const itinerary = routeSolutions[selectedSolutionIndex];

  //   // Mảng các tuyến trong shipmentItineraries (routeId, basePriceVndPerKm, legOrder)
  //   const shipmentItineraries = itinerary?.data?.routes.map(route => ({
  //     routeId: route.routeId,
  //     basePriceVndPerKm: route.basePriceVndPerKm || 0,
  //     legOrder: route.legOrder,
  //   })) || [];

  //   return {
  //     departureStationId: departureStationId,
  //     destinationStationId: destinationStationId,
  //     ...(senderName ? { senderName } : {}),
  //     ...(senderPhone ? { senderPhone } : {}),
  //     ...(recipientName ? { recipientName } : {}),
  //     ...(recipientPhone ? { recipientPhone } : {}),
  //     ...(recipientEmail ? { recipientEmail } : {}),
  //     ...(recipientNationalId ? { recipientNationalId } : {}),
  //     scheduledDateTime: departureDateTime,
  //     // scheduledDateTime: departureDateTime ? dayjs(departureDateTime).toISOString() : null,
  //     timeSlotId: timeSlots,
  //     totalCostVnd: priceVnd,
  //     totalKm: Number(totalKm),
  //     totalShippingFeeVnd: Number(priceVnd),
  //     shipmentItineraries: shipmentItineraries,
  //     parcels: [
  //       {
  //         parcelCategoryId: parcelCategory,
  //         weightKg: Number(weightKg),
  //         lengthCm: Number(lengthCm),
  //         widthCm: Number(widthCm),
  //         heightCm: Number(heightCm),
  //         shippingFeeVnd: Number(shippingFeeVnd),
  //         chargeableWeight: Number(chargeableWeight),
  //         isBulk: isBulk || false,
  //         priceVnd: Number(priceVnd),
  //       },
  //     ],
  //   };
  // };

  const buildPayload = () => {
    const {
      senderName,
      senderPhone,
      recipientName,
      recipientPhone,
      recipientEmail,
      recipientNationalId,
    } = personalInfo;

    const {
      departureStationId,
      destinationStationId,
      departureDateTime,
    } = metroSelector;

    const itinerary = routeSolutions[selectedSolutionIndex];

    const shipmentItineraries = itinerary?.data?.routes?.map(route => ({
      routeId: route.routeId,
      legOrder: route.legOrder,
    })) || [];

    const validParcels = parcelInfo
      .filter(p =>
        p.parcelCategory &&
        p.weightKg &&
        p.lengthCm &&
        p.widthCm &&
        p.heightCm
      )
      .map((p, idx) => {
        const base = {
          parcelCategoryId: p.parcelCategory,
          weightKg: Number(p.weightKg),
          lengthCm: Number(p.lengthCm),
          widthCm: Number(p.widthCm),
          heightCm: Number(p.heightCm),
          descriptionImageUrl: p.descriptionImageUrl,
          isBulk: idx > 0,
        };
        if (p.descriptionImageUrl) base.descriptionImageUrl = p.descriptionImageUrl;
        if (p.description) base.description = p.description;
        if (p.shippingFeeVnd !== undefined) base.shippingFeeVnd = Number(p.shippingFeeVnd);
        if (p.insuranceFeeVnd !== undefined) base.insuranceFeeVnd = Number(p.insuranceFeeVnd);
        if (p.chargeableWeight !== undefined) base.chargeableWeight = Number(p.chargeableWeight);
        if (p.priceVnd !== undefined) base.priceVnd = Number(p.priceVnd);
        if (p.valueVnd !== undefined) base.valueVnd = p.valueVnd;

        return base;
      });

    return {
      ...(departureStationId && { departureStationId }),
      ...(destinationStationId && { destinationStationId }),
      ...(senderName && { senderName }),
      ...(senderPhone && { senderPhone }),
      ...(recipientName && { recipientName }),
      ...(recipientPhone && { recipientPhone }),
      ...(recipientEmail ? { recipientEmail } : {}),
      ...(recipientNationalId && { recipientNationalId }),
      ...(departureDateTime && { scheduledDateTime: new Date(departureDateTime).toISOString() }),
      ...(timeSlots && { timeSlotId: timeSlots }),
      ...(priceVnd && {
        totalCostVnd: Number(priceVnd),
        totalShippingFeeVnd: Number(priceVnd),
      }),
      ...(totalKm && { totalKm: Number(totalKm) }),
      ...(shipmentItineraries.length > 0 && { shipmentItineraries }),
      parcels: validParcels,
    };
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = buildPayload();
      const bookingResponse = await api.post('/shipments', payload);
      if (bookingResponse.data.statusCode === 400) {
        toast.error(bookingResponse.data.message);
        setLoading(false);
        return;
      }
      toast.success("Đặt giao thành công!");
      const currentDomain = window.location.origin;
      const paymentPayload = {
        shipmentId: bookingResponse.data.data.shipmentId,
        returnUrl: `${currentDomain}/payment-success`,
        cancelUrl: `${currentDomain}/payment-fail`,
      };
      // const paymentPayload = {
      //   shipmentId: bookingResponse.data.data.shipmentId,
      //   returnUrl: "http://localhost:5173/payment-success",
      //   cancelUrl: "http://localhost:5173/payment-fail",
      // };

      const res = await api.post("/shipments/vnpay/payment-url", paymentPayload);
      console.log(res.data);

      // statusCode nằm trực tiếp trong res.data
      if (res.data?.statusCode === 200 && res.data.data) {
        window.location.href = res.data.data; // Redirect to VNPay
      } else {
        toast.error("Không lấy được link thanh toán!");
      }
      // nav(PATH_NAME.HISTORY_ORDERS);
    } catch (error) {
      console.error(error);
      console.log(buildPayload());
      setLoading(false);
      const errorMessage = error.response?.data.message || "An error occurred";
      toast.error(errorMessage);
    }
  };


  return (
    <>
      <Spin spinning={loading} tip="Đang đặt đơn..." size="large">
        <div className="order">
          <div className="order__map-background">
            <MapContainer center={[10.776, 106.700]} zoom={12} style={{ height: '100vh', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {userLocation.latitude !== 0 && userLocation.longitude !== 0 && (
                <>
                  <Marker
                    position={[userLocation.latitude, userLocation.longitude]}
                    icon={cusIcon}>
                    <Popup>Vị trí của bạn</Popup>
                  </Marker>

                  {/* <Circle
                    center={[userLocation.latitude, userLocation.longitude]}
                    radius={5000} // 5km
                    pathOptions={{
                      color: 'none',          // Viền
                      weight: 2,              // Độ dày viền
                      fillColor: '#2890ffff',   // Màu fill bên trong
                      fillOpacity: 0.2,       // Độ mờ vùng phủ
                      dashArray: '4',         // Đường viền dạng đứt 
                    }}
                  /> */}
                </>
              )}

              {routeSolutions.length > 0 &&
                routeSolutions[selectedSolutionIndex]?.data?.routes.map((routeLeg) => {
                  const stations = routeSolutions[selectedSolutionIndex]?.data?.stations || [];

                  const fromStation = stations.find(s => s.stationId === routeLeg.fromStationId);
                  const toStation = stations.find(s => s.stationId === routeLeg.toStationId);

                  if (!fromStation || !toStation) return null;

                  return (
                    <Polyline
                      key={routeLeg.routeId}
                      positions={[
                        [fromStation.latitude, fromStation.longitude],
                        [toStation.latitude, toStation.longitude],
                      ]}
                    />
                  );
                })}

              {routeSolutions.length > 0 &&
                routeSolutions[selectedSolutionIndex]?.data?.stations.map((station, index) => (
                  <Marker
                    key={station.stationId}
                    position={[station.latitude, station.longitude]}
                    icon={index === 0 ? startMetro : customIcon}
                  >
                    <Popup>{station.stationNameVi}</Popup>
                  </Marker>
                ))}
            </MapContainer>


          </div>
          <div className="order__container--vertical">
            <div className="order__text">Thông tin đơn hàng</div>
            <ConfigProvider
              theme={{
                components: {
                  Steps: {
                    processIconColor: "black",
                    processTitleColor: "black",
                  },
                },
              }}
            >
              <Steps
                progressDot
                current={currentStep}
                direction="horizontal"
                items={steps.map((step) => ({
                  title: step.title,
                  description: step.description,
                }))}
                className="order__steps-horizontal"
              />
            </ConfigProvider>

            <div className="order__step-content">
              {steps[currentStep].component}

              <div
                className="order__buttons"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "1em",
                }}
              >
                {currentStep > 0 && (
                  <ConfigProvider
                    theme={{
                      components: {
                        Button: {
                          defaultColor: "white",
                          defaultBg: "#4CAF50",
                          defaultBorderColor: "#4CAF50",
                          defaultHoverBorderColor: "#FFC107",
                          defaultHoverColor: "black",
                          defaultHoverBg: "#FFC107",
                          defaultActiveBg: "#4CAF50",
                          defaultActiveBorderColor: "#4CAF50",
                          defaultActiveColor: "white",
                        },
                      },
                    }}
                  >
                    <Button
                      onClick={handlePrevious}
                      style={{
                        marginRight: 8,
                        fontWeight: "500",
                      }}
                    >
                      Trước
                    </Button>
                  </ConfigProvider>
                )}
                <ConfigProvider
                  theme={{
                    components: {
                      Button: {
                        defaultColor: "white",
                        defaultBg: "#0066CC",
                        defaultBorderColor: "#0066CC",
                        defaultHoverBorderColor: "#FFC107",
                        defaultHoverColor: "black",
                        defaultHoverBg: "#FFC107",
                        defaultActiveBg: "#0066CC",
                        defaultActiveBorderColor: "#0066CC",
                        defaultActiveColor: "white",
                      },
                    },
                  }}
                >
                  <Button
                    onClick={handleNext}
                    style={{ fontWeight: "500" }}
                  >
                    {currentStep === steps.length - 1 ? "Xác nhận" : "Sau"}
                  </Button>
                </ConfigProvider>
              </div>
            </div>

            <Modal
              title="Xác nhận đơn hàng"
              open={isModalOpen}
              onOk={handleOk}
              onCancel={handleCancel}
              okText="Xác nhận"
              cancelText="Hủy"
              okButtonProps={{ className: "confirm-button" }}
              cancelButtonProps={{ className: "cancel-button" }}
              className="modal-confirm"
            >
              <p>
                Bạn xác nhận muốn đặt đơn hàng này? Hãy kiểm tra toàn bộ thông tin trước khi đặt đơn.
              </p>
            </Modal>

            <Modal
              title="Yêu cầu quyền truy cập vị trí"
              open={isLocationModalOpen}
              onOk={() => {
                requestLocationPermission();
                setIsLocationModalOpen(false);
              }}
              onCancel={() => setIsLocationModalOpen(false)}
              okText="Cho phép"
              cancelText="Không cho phép"
              className="modal-location"
            >
              <p>Để gợi ý tuyến đường tối ưu, ứng dụng cần truy cập vị trí của bạn. Bạn có muốn tiếp tục không?</p>
            </Modal>
          </div>
        </div>
      </Spin>
    </>
  )
}

export default Order
