import './Pincode.scss'

import { useEffect, useState } from 'react';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import api from '../../config/axios';
import { useNavigate } from 'react-router-dom';

function Pincode() {
  const [pin, setPin] = useState(""); 
    const [count, setCount] = useState(60);
    const [message1, setMessage] = useState("");
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
                token: pin,
            }
            const response = await api.post('User/Verify/verify', data);
            const responseData = response.data;
            if (responseData.error === 0) {
                message.success(responseData.message, 3);
                console.log(responseData);
                nav('/login'); 
            } else {
                message.error(response.message);
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
