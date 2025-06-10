import './ResetPassword.scss'

import  * as Yup  from 'yup';

import { ErrorMessage, Field, Form, Formik } from 'formik';

import Logo from '../../assets/logo2.png'
import RegisterPicture from '../../assets/login1.png';
import api from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function ResetPassword() {
    const [error, setError] = useState(null);
    const nav = useNavigate();
    const [isChecked, setIsChecked] = useState(false);

    const validationSchema = Yup.object({
        token: Yup.string()
            .min(6, "OTP must be at least 6 numbers")
            .required("OTP is required"),
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Passwords must match")
            .required("Confirm password is required"),
    });

    const handleSubmit = async (values) => {
        // const formData = new FormData();
        // formData.append('Token', values.token);
        // formData.append('Password', values.password);
        // formData.append('ConfirmPassword', values.confirmPassword);

        // console.log([...formData]);
        // try {
        //     const response = await api.post("/User/ResetPassword", formData, {
        //         headers: {
        //             'Content-Type': 'multipart/form-data',
        //         },
        //     });
        //     const data = response.data;
        //     if (data.error === 0) {
        //         message.success(data.message);
        //         nav("/login");
        //     } else {
        //         message.error(data.message);
        //     }
        // } catch (error) {
        //     setError(error.message);
        // }
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
                                    <label htmlFor="token">OTP</label>
                                    <Field name="token" type="text" />
                                    <ErrorMessage
                                        name="token"
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

                                <button type="submit" className="register-btn">
                                    Recovery Password
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
    )
}

export default ResetPassword
