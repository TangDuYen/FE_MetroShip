import './Order.scss'

import { Button, Col, ConfigProvider, Modal, Row, Steps, message } from 'antd';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { useEffect, useState } from 'react';

import ConfirmPage from './ConfirmPage';
import { PATH_NAME } from '../../constants/pathname';
import ParcelInfo from './ParcelInfo';
import PersonalInfo from './PersonalInfo';
import api from '../../config/axios';
import metroMarker from '../../assets/subway.png'
import { selectUser } from '../../redux/features/counterSlice';
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
  const [parcelInfo, setParcelInfo] = useState({
    parcelCategory: "",
    weightKg: "",
    lengthCm: "",
    heightCm: "",
    widthCm: "",
    chargeableWeight: "",
    description: "",
    isBulk: false,
  });
  const [userLocation, setUserLocation] = useState({
    latitude: parseFloat(localStorage.getItem('userLatitude')) || 0,
    longitude: parseFloat(localStorage.getItem('userLongitude')) || 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const user = useSelector(selectUser);
  const nav = useNavigate();
  const [routeSolutions, setRouteSolutions] = useState([]); // chứa giải pháp từ API
  const [selectedSolutionIndex, setSelectedSolutionIndex] = useState(0); // đang chọn giải pháp nào
  const [priceVnd, setPriceVnd] = useState(null); // giá
  const customIcon = L.icon({
    iconUrl: metroMarker,
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
          routeSolutions={routeSolutions}
          setRouteSolutions={setRouteSolutions}
          selectedSolutionIndex={selectedSolutionIndex}
          setSelectedSolutionIndex={setSelectedSolutionIndex}
          priceVnd={priceVnd}
          setPriceVnd={setPriceVnd}
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
          priceVnd={priceVnd}
          routeSolutions={routeSolutions}
          selectedSolutionIndex={selectedSolutionIndex}
        />
      ),
    },
  ];
  const handleNext = () => {
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
  const buildPayload = () => {
    const {
      senderName,
      senderPhone,
      recipientName,
      recipientPhone,
      recipientEmail,
      recipientNationalId,
    } = personalInfo;

    const { departureStationId, destinationStationId, departureDateTime } = metroSelector;

    const {
      parcelCategory,
      weightKg,
      lengthCm,
      widthCm,
      heightCm,
      isBulk,
      chargeableWeight,
    } = parcelInfo;

    // Lấy giải pháp tuyến đã chọn
    const itinerary = routeSolutions[selectedSolutionIndex];

    // Mảng các tuyến trong shipmentItineraries (routeId, basePriceVndPerKm, legOrder)
    const shipmentItineraries = itinerary?.routes.map(route => ({
      routeId: route.routeId,
      basePriceVndPerKm: route.basePriceVndPerKm || 0,
      legOrder: route.legOrder,
    })) || [];

    // Convert departureDateTime to Date if it's not already a Date object
    let scheduledDateTime = null;
    if (departureDateTime) {
      if (typeof departureDateTime === 'string') {
        scheduledDateTime = new Date(departureDateTime).toISOString(); // Convert string to Date object
      } else if (departureDateTime instanceof Date) {
        scheduledDateTime = departureDateTime.toISOString(); // Already a Date object, use it
      }
    }

    return {
      departureStationId: departureStationId || "",
      destinationStationId: destinationStationId || "",
      senderName: senderName || "",
      senderPhone: senderPhone || "",
      recipientId: "",
      recipientName: recipientName || "",
      recipientPhone: recipientPhone || "",
      recipientEmail: recipientEmail || "",
      recipientNationalId: recipientNationalId,
      scheduledDateTime: scheduledDateTime,
      totalCostVnd: priceVnd,
      shippingFeeVnd: priceVnd,
      shipmentItineraries: shipmentItineraries,
      parcels: [
        {
          parcelCategoryId: parcelCategory || "",
          weightKg: Number(weightKg) || 0,
          lengthCm: Number(lengthCm) || 0,
          widthCm: Number(widthCm) || 0,
          heightCm: Number(heightCm) || 0,
          chargeableWeight: chargeableWeight,
          isBulk: isBulk || false,
          priceVnd: Number(priceVnd) || 0,
        },
      ],
    };
  };


  const handleSubmit = async () => {
    try {
      const payload = buildPayload();
      console.log(payload);
      console.log(typeof (payload.totalCostVnd));


      const bookingResponse = await api.post('/shipments', payload);

      if (bookingResponse.data.statusCode === 400) {
        toast.error(bookingResponse.data.message);
        console.log(payload);

        return;
      }
      toast.success("Đặt giao thành công!");
      nav(PATH_NAME.HISTORY_ORDERS);
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data.message || "An error occurred";
      toast.error(errorMessage);
    }
  };


  return (
    <>
      <div className="order">
        <div className="order__map-background">
          <MapContainer
            center={[10.776, 106.700]}
            zoom={12}
            style={{ height: '100vh', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {routeSolutions.length > 0 && routeSolutions[selectedSolutionIndex]?.routes.map((routeLeg, idx) => {
              // Lấy toạ độ fromStation và toStation từ danh sách stations
              const fromStation = routeSolutions[selectedSolutionIndex].stations.find(
                (s) => s.stationId === routeLeg.fromStationId
              );
              const toStation = routeSolutions[selectedSolutionIndex].stations.find(
                (s) => s.stationId === routeLeg.toStationId
              );

              if (!fromStation || !toStation) return null;

              // Vẽ polyline cho đoạn tuyến này
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

            {/* Vẽ marker tất cả các trạm tuyến */}
            {routeSolutions.length > 0 && routeSolutions[selectedSolutionIndex]?.stations.map((station) => (
              <Marker
                key={station.stationId}
                position={[station.latitude, station.longitude]}
                icon={customIcon}
              >
                <Popup>
                  {station.stationNameVi}
                </Popup>
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
    </>
  )
}

export default Order
