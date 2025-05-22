import './Register.scss'

import * as Yup from "yup";

import { Checkbox, message } from 'antd';
import { ErrorMessage, Field, Form, Formik } from 'formik';

import Logo from '../../assets/logo2.png'
import RegisterPicture from '../../assets/login1.png';
import api from '../../config/axios';
import {useNavigate} from 'react-router-dom';
import { useState } from 'react';

function Register() {
  const [error, setError] = useState(null);
  const nav = useNavigate();
  const [isChecked, setIsChecked] = useState(false);

  //VALIDATION
  const validationSchema = Yup.object({
    userName: Yup.string().required("Username is required"),
    fullName: Yup.string().required("Full Name is required"),
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits")
      .required("Phone number is required"),
    email: Yup.string().required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const handleSubmit = async (values) => {
    if (!isChecked) {
      message.error(
        "You must agree to the Term of Service and Privacy Policy before registering"
      ); 
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
      }
    } catch (error) {
      setError(error.message);
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
              userName:"",
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
                  <label htmlFor="userName">Username</label>
                  <Field name="userName" type="text" />
                  <ErrorMessage
                    name="userName"
                    component="div"
                    className="error-message"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <Field name="fullName" type="text" />
                  <ErrorMessage
                    name="fullName"
                    component="div"
                    className="error-message"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
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
                  <label htmlFor="password">Password</label>
                  <Field name="password" type="password" />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="error-message"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
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
                  I agree with the{" "}
                  <span style={{ fontWeight: "bold" }}>Term of Service</span>{" "}
                  and <span style={{ fontWeight: "bold" }}>Privacy Policy</span>
                  .{" "}
                </Checkbox>
                <button
                  type="submit"
                  className="register-btn"
                  disabled={!isChecked}
                >
                  Register
                </button>
                {error && <p className="error-message">{error}</p>}
              </Form>
            )}
          </Formik>
          <div className="register-options">
            <p>
              Have an account yet?{" "}
              <a href="/login" className="login-link">
                Back to login
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
