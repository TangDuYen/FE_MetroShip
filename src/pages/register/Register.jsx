import './Register.scss'

import * as Yup from "yup";

import { Checkbox, message } from 'antd';
import { ErrorMessage, Field, Form, Formik } from 'formik';

import Logo from '../../assets/logo2.png'
import RegisterPicture from '../../assets/login.jpg';
import api from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Register() {
  const [error, setError] = useState(null);
  const nav = useNavigate();
  const [isChecked, setIsChecked] = useState(false);
const [messageApi, contextHolder] = message.useMessage();
  //VALIDATION
  const validationSchema = Yup.object({
    userName: Yup.string().required("Tên đăng nhập không được để trống"),
    fullName: Yup.string().required("Họ tên không được để trống"),
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10,11}$/, "Số điện thoại không đúng chuẩn")
      .required("Số điện thoại không được để trống"),
    email: Yup.string().required("Email không được để trống"),
    password: Yup.string()
      .min(6, "Mật khẩu dài ít nhất 6 kí tự")
      .required("Mật khẩu không được để trống"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Mật khẩu chưa khớp")
      .required("Xác minh mật khẩu không được để trống"),
  });

  const handleSubmit = async (values) => {
    if (!isChecked) {
      messageApi.open({
        type: 'error',
        content:  "Bạn cần đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật trước khi đăng kí.",
      });
      return;
    }

    const payload = {
      userName: values.userName,
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
    };

    try {
      const response = await api.post("/auth/register", values);
      const responseData = response.data;
      console.log(responseData);

      if (responseData.statusCode === 200) {
        message.success(responseData.data);
        sessionStorage.setItem("registrationData", JSON.stringify(payload));
        console.log("registrationData");
        nav("/pin-code");
      } else {
        message.error(responseData.data);
        console.log(message.error("Hello"));

      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error?.response?.data || error.message);
      message.error("Đăng ký thất bại, vui lòng kiểm tra thông tin.");
    }
  };

  return (
    <>
      <div className="register-container">
        <div className="register-form-container">
          <div
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <img
              onClick={() => nav("/")}
              src={Logo}
              alt="Logo"
              style={{
                width: "18vw",
                height: "20vh",
                marginBottom: "1em",
                cursor: "pointer",
              }}
            />
          </div>
          <Formik
            initialValues={{
              userName: "",
              fullName: "",
              phoneNumber: "",
              email: "",
              password: "",
              confirmPassword: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="register-form">
                <div className="form-group">
                  <label htmlFor="userName">Tên đăng nhập</label>
                  <Field name="userName" type="text" />
                  <ErrorMessage
                    name="userName"
                    component="div"
                    className="error-message"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fullName">Họ tên</label>
                  <Field name="fullName" type="text" />
                  <ErrorMessage
                    name="fullName"
                    component="div"
                    className="error-message"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phoneNumber">Số điện thoại</label>
                  <Field name="phoneNumber" type="text" />
                  <ErrorMessage
                    name="phoneNumber"
                    component="div"
                    className="error-message"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <Field name="email" type="email" />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="error-message"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Mật khẩu</label>
                  <Field name="password" type="password" />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="error-message"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                  <Field name="confirmPassword" type="password" />
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="error-message"
                  />
                </div>
                <Checkbox
                  className="privacy-checked"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                >
                  Tôi đồng ý với{" "}
                  <span style={{ fontWeight: "bold" }}>Điều khoản dịch vụ</span>{" "}
                  và <span style={{ fontWeight: "bold" }}>Chính sách bảo mật</span>
                  .{" "}
                </Checkbox>
                <button
                  type="submit"
                  className="register-btn"
                  disabled={!isChecked}
                >
                  Đăng kí
                </button>
                {error && <p className="error-message">{error}</p>}
              </Form>
            )}
          </Formik>
          <div className="register-options">
            <p>
              Đã có tài khoản?{" "}
              <a href="/login" className="login-link">
                Đăng nhập
              </a>
            </p>
          </div>
        </div>
        <div className="introduction-image">
          <img src={RegisterPicture} alt="Register" />
        </div>
      </div>
    </>
  );
}

export default Register;
