import './Pincode.scss'

import { Input, message } from 'antd';
import { useEffect, useState } from 'react';

import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../../config/axios';
import { useNavigate } from 'react-router-dom';

function Pincode() {
  const [pin, setPin] = useState(""); 
    const [count, setCount] = useState(60);
    const [message1, setMessage] = useState("");
    const nav = useNavigate();
    const registrationData = JSON.parse(sessionStorage.getItem('registrationData'));

    useEffect(() => {
        if (!registrationData) {
            nav("/sign-up");
        }
    }, [registrationData, nav]);

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
                message.success(responseData.data);
                console.log(responseData);
                nav('/login'); 
            } else {
                message.error(responseData.message);
            }
        } catch (error) {
            console.error(error);
            setMessage("Pin verification failed!");
        }
    };

    return (
        <div className="pin">
            <div className="pin__wrapper">
                <p className="pin__back" onClick={() => nav("/login")}>
                    <ArrowLeftOutlined /> Back
                </p>
                <h1 className="pin__title">Enter Pin Code</h1>
                <div className="pin__email">{registrationData?.email}</div>
                <Input
                    value={pin}
                    onChange={onChange}
                    maxLength={6} 
                    placeholder="Enter 6-digit PIN"
                    inputMode="numeric"
                    style={{ width: "100%", marginBottom: "10px" }} 
                />
                {message1 && <p className="pin__error">{message1}</p>}
                <div className="pin__btn" onClick={verifyPin}>
                    Verify Pin
                </div>
            </div>
        </div>
    );
}

export default Pincode
