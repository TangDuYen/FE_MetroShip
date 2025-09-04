import './ResetPassword.scss'

import * as Yup from 'yup';

import { ErrorMessage, Field, Form, Formik } from 'formik';

import Logo from '../../assets/logo2.png'
import RegisterPicture from '../../assets/login1.png';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function VerifyMail() {
    const [error, setError] = useState(null);
    const nav = useNavigate();

    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Email không hợp lệ")
            .required("Cần phải nhập email để nhận OTP"),
    });

    const handleSubmit = async (values) => {
        console.log(values);
        const payload = {
            email: values.email,
        };
        try {
            const response = await api.post('/auth/password/forgot', payload);
            const data = response.data;
            if (response.status === 200) {
                nav("/recovery-password");
            } else {
                toast.error(data?.message || "Có lỗi xảy ra!");
            }
        } catch (error) {
            const errData = error.response?.data;
            if (errData?.errors) {
                // Lấy tất cả lỗi từ object errors
                const firstError = Object.values(errData.errors).flat()[0];
                toast.error(firstError);
            } else {
                toast.error(errData?.title || "Lỗi không xác định!");
            }
        }
    };

    return (
        <>
            <div className="register-container">
                <div className="register-form-container">
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
                    <Formik
                        initialValues={{
                            email: "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {() => (
                            <Form className="register-form">
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <Field name="email" type="email" />
                                    <ErrorMessage
                                        name="email"
                                        component="div"
                                        className="error-message"
                                    />
                                </div>

                                <button type="submit" className="register-btn">
                                    Xác nhận
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
                    <img src={RegisterPicture} alt="Register" />
                </div>
            </div>
        </>
    )
}

export default VerifyMail
