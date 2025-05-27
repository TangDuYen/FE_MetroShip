import './Order.scss'

import { Button, Col, ConfigProvider, Modal, Row, Steps, message } from 'antd';

import ConfirmPage from './ConfirmPage';
import MetroPicture from '../../assets/metro.jpg';
import MetroSelector from './MetroSelector';
import { PATH_NAME } from '../../constants/pathname';
import ParcelInfo from './ParcelInfo';
import PersonalInfo from './PersonalInfo';
import { selectUser } from '../../redux/features/counterSlice';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';

function Order() {
  const [currentStep, setCurrentStep] = useState(0);
  const [personalInfo, setPersonalInfo] = useState({
    senderName: "",
    senderPhone: "",
    recipientName: "",
    recipientPhone: "",
    recipientEmail: "",
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
    description: "",
    isBulk: false,
  })
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useSelector(selectUser);
  const nav = useNavigate();
  // const userId = user.Id;
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    handleSubmit();
    setIsModalOpen(false);
    nav(PATH_NAME.HISTORY_ORDERS);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const steps = [
    {
      title: "Xác nhận thông tin",
      description: "Xác nhận thông tin người gửi và người nhận",
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
      description: "Nhập thông tin kiện hàng và chọn thời gian giao",
      component: (
        <ParcelInfo
          personalInfo={personalInfo}
          parcelInfo={parcelInfo}
          setParcelInfo={setParcelInfo}
          metroSelector={metroSelector}
          setMetroSelector={setMetroSelector}
          setPickedDate={setPickedDate}
          setPickedTime={setPickedTime}
          onNext={() => setCurrentStep(2)}
        />
      ),
    },
    {
      title: "Xác nhận đơn hàng",
      description: "Xác nhận thông tin đơn hàng",
      component: (
        <ConfirmPage
          personalInfo={personalInfo}
          metroSelector={metroSelector}
          parcelInfo={parcelInfo}
          pickedDate={pickedDate}
          pickedTime={pickedTime}
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

  const handleSubmit = async () => {
    // const [hour, minute] = appointmentTime.split(":");

    // try {
    //   // Step 1: Create the booking and get bookingId and paymentId
    //   const bookingResponse = await api.post(
    //     `/Booking/AddBooking/AddBooking?CustomerId=${userId}&salonId=${personalInfo.salonId}&SalonMemberId=${selectedStylist.id}&cuttingDate=${appointmentDate}&hour=${hour}&minute=${minute}&ComboServiceId=${selectedService.id}&CustomerName=${personalInfo.fullName}&CustomerPhoneNumber=${personalInfo.phone}`
    //   );

    //   if (bookingResponse.data.error === 1) {
    //     messageApi.error(bookingResponse.data.message);
    //     return;
    //   }

    //   const { id: bookingId, paymentId } = bookingResponse.data.data;
    //   messageApi.success("Booking created successfully!");
    //   console.log(paymentId);
    //   localStorage.setItem("paymentId", paymentId);
    //   console.log("Booking", bookingId);
    //   console.log(bookingResponse.data.data);
    //   const paymentResponse = await api.post(
    //     `/Payments/create?bookingId=${bookingId}`
    //   );

    //   const paymentUrl = paymentResponse.data.data.checkoutUrl;
    //   if (paymentUrl) {
    //     window.location.href = paymentUrl;
    //   } else {
    //     messageApi.error("Cannot find payment URL");
    //   }
    // } catch (error) {
    //   console.error(error);
    //   const errorMessage = error.response?.data.message || "An error occurred";
    //   messageApi.error(errorMessage);
    // }
  };

  return (
    <>
      <div className="order">
        {contextHolder}
        <img
          src="https://tphcm.cdnchinhphu.vn/334895287454388224/2023/8/23/metro-so-1-16618572668742131228344-16882866714571847829823-16927939569321374898356.jpg"
          alt="maverick barber"
          className="order__img"
        />
        <div className="order__text">Thông tin đơn hàng</div>
        <div>
          <Row className="order__container">
            <Col span={6} className="order_container__left">
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
                  direction="vertical"
                  items={steps.map((step) => ({
                    title: step.title,
                    description: step.description,
                  }))}
                  className="order_container__left__steps"
                />
              </ConfigProvider>
            </Col>
            <Col span={18} className="order_container__right">
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
                {/* Cấu hình riêng cho nút Submit */}
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
              <Modal
                title="Confirm order"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Confirm"
                okButtonProps={{ className: "confirm-button" }}
                cancelButtonProps={{ className: "cancel-button" }}
                className="modal-confirm"
              >
                <p>
                  Bạn xác nhận muốn đặt đơn hàng này? Hãy kiểm tra toàn bộ thông tin trước khi đặt đơn.
                </p>
              </Modal>
            </Col>
          </Row>
        </div>
      </div>
    </>
  )
}

export default Order
