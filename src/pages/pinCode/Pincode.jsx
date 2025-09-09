import './Pincode.scss'

import { Input, message } from 'antd';
import { useEffect, useState } from 'react';

import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function Pincode() {
    const [pin, setPin] = useState("");
    const [count, setCount] = useState(60);
    const [message1, setMessage1] = useState("");
    const nav = useNavigate();
    const registrationData = JSON.parse(sessionStorage.getItem('registrationData'));


    // useEffect(() => {
    //     if (!registrationData) {
    //         nav("/sign-up");
    //     }
    // }, [registrationData, nav]);

    const onChange = (e) => {
        const value = e.target.value;
        setPin(value);
    };

    const verifyPin = async () => {
        try {
            const data = {
                otp: pin,
                userName: registrationData.userName
            }
            const response = await api.post('/auth/email/verification', data);
            const responseData = response.data;
            console.log(responseData);

            if (responseData.statusCode === 200) {
                toast.success(responseData.message);
                console.log(responseData);
                nav('/login');
            } else {
                toast.error(responseData.message);
            }
        } catch (error) {
            const errData = error.response?.data;
            if (errData?.errors) {
                const firstError = Object.values(errData.errors).flat()[0];
                toast.error(firstError);
            } else if (errData?.message) {
                toast.error(errData.message);
            } else {
                toast.error("Lỗi không xác định!");
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
        <div className="pin">
            <div className="pin__wrapper">
                <p className="pin__back" onClick={() => nav("/login")}>
                    <ArrowLeftOutlined /> Quay lại
                </p>
                <h1 className="pin__title">Xác nhận Email</h1>
                <div className="pin__email">{registrationData?.email}</div>
                <Input
                    value={pin}
                    onChange={onChange}
                    maxLength={6}
                    placeholder="Nhập mã OTP gồm 6 mã số"
                    inputMode="numeric"
                    style={{ width: "100%", marginBottom: "10px" }}
                />
                <div className="pin__resend">
                    {count > 0 ? (
                        <span style={{ color: "gray" }}>
                            Gửi lại mã ({count}s)
                        </span>
                    ) : (
                        <a href="#!" onClick={resendOtp}>
                            Gửi lại mã
                        </a>
                    )}
                </div>
                <div className="pin__btn" onClick={verifyPin}>
                    Xác nhận
                </div>
            </div>
        </div>
    );
}

export default Pincode
