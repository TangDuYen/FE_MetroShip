import './ResetPassword.scss'

import * as Yup from 'yup';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useEffect, useState } from 'react';

import Logo from '../../assets/logo2.png'
import RegisterPicture from '../../assets/login1.png';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {
    const [error, setError] = useState(null);
    const nav = useNavigate();
    const [isChecked, setIsChecked] = useState(false);
    const [count, setCount] = useState(60);

    const validationSchema = Yup.object({
        token: Yup.string()
            .min(6, "OTP cần ít nhất 6 kí tự")
            .required("Không để trống OTP"),
        password: Yup.string()
            .min(8, "Mật khẩu ít nhất 8 kí tự")
            .required("Không để trống mật khẩu!"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Mật khẩu không khớp")
            .required("Cần phải xác nhận mật khẩu"),
    });

    const handleSubmit = async (values) => {
        const payload = {
            otp: values.token,
            password: values.password,
            confirmPassword: values.confirmPassword,
        }
        try {
            const response = await api.post("/auth/password/reset", payload);
            const data = response.data;
            if (response.status === 200) {
                toast.success(data.message);
                nav("/login");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            const errData = error.response?.data;
            if (errData?.errors) {
                const firstError = Object.values(errData.errors).flat()[0];
                toast.error(firstError);
            } else {
                toast.error(errData?.title || "Lỗi không xác định!");
            }
        }
    };

    const resendOtp = async () => {
        try {
            const data = { userName: registrationData.userName };
            const response = await api.post('/auth/email/resend', data);
            const responseData = response.data;

            if (responseData.statusCode === 200) {
                toast.success(responseData.message);
                setCount(60);
            } else {
                toast.error(responseData.message);
            }
        } catch (error) {
            const errData = error.response?.data;
            if (errData?.errors) {
                const firstError = Object.values(errData.errors).flat()[0];
                toast.error(firstError);
            } else {
                toast.error(errData?.title || "Lỗi không xác định!");
            }
        }
    };

    useEffect(() => {
        let timer;
        if (count > 0) {
            timer = setInterval(() => {
                setCount((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [count]);

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
                            token: "",
                            password: "",
                            confirmPassword: "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {() => (
                            <Form className="register-form">
                                <div className="form-group">
                                    <label htmlFor="token" style={{marginRight: "1em"}}>OTP</label>
                                    {count > 0 ? (
                                        <span style={{ color: "gray" }}>
                                            Gửi lại mã ({count}s)
                                        </span>
                                    ) : (
                                        <a href="#!" onClick={resendOtp}>
                                            Gửi lại mã
                                        </a>
                                    )}
                                    <Field name="token" type="text" />
                                    <ErrorMessage
                                        name="token"
                                        component="div"
                                        className="error-message"
                                        style={{ marginTop: '0.5em' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Mật khẩu mới</label>
                                    <Field name="password" type="password" />
                                    <ErrorMessage
                                        name="password"
                                        component="div"
                                        className="error-message"
                                        style={{ marginTop: '0.5em' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                                    <Field name="confirmPassword" type="password" />
                                    <ErrorMessage
                                        name="confirmPassword"
                                        component="div"
                                        className="error-message"
                                        style={{ marginTop: '0.5em' }}
                                    />
                                </div>

                                <button type="submit" className="register-btn">
                                    Đặt lại mật khẩu
                                </button>
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
                    <img src={RegisterPicture} alt="Register" onClick={() => nav("/")}/>
                </div>
            </div>
        </>
    )
}

export default ResetPassword
