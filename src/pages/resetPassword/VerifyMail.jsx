import './ResetPassword.scss'

import  * as Yup  from 'yup';

import { ErrorMessage, Field, Form, Formik } from 'formik';

import Logo from '../../assets/logo2.png'
import RegisterPicture from '../../assets/login1.png';
import api from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function VerifyMail() {
    const [error, setError] = useState(null);
    const nav = useNavigate();
    const [isChecked, setIsChecked] = useState(false);

    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Invalid email format")
            .matches(/@gmail\.com$/, "Email must be a @gmail.com account")
            .required("Email is required"),
    });

    const handleSubmit = async (values) => {
        // console.log(values);
        // const payload = {
        //     email: values.email,
        // };
        // try {
        //     const response = await api.post(`/User/ForgotPassword?email=${encodeURIComponent(values.email)}`);
        //     const data = response.data;
        //     if (data.error === 0) {
        //         nav("/recovery-password");
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
                                    Submit
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

export default VerifyMail
