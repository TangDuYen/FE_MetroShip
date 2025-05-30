import './Order.scss'

import { MailOutlined, PhoneOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { Input } from 'antd';
import api from '../../config/axios';
import { selectUser } from '../../redux/features/counterSlice';

function PersonalInfo({ personalInfo, setPersonalInfo, onNext }) {
  //Sau thay bằng api get user by Id 
  const userData = JSON.parse(localStorage.getItem("userData"));
  useEffect(() => {
    if (userData) {
      setPersonalInfo((prev) => ({
        ...prev,
        senderName: userData.fullName || '',
        senderPhone: userData.phoneNumber || ''
      }));
    }
  }, [setPersonalInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("Phone")) {
      const isNumber = /^[0-9]*$/.test(value);
      if (!isNumber) return;
    }
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  return (
    <div className="personalInfo">
      <p>Customer Information</p>
      <div className="personalInfo__input">
        <Input
          size="middle"
          placeholder="Tên người gửi"
          prefix={<UserOutlined />}
          name="senderName"
          value={personalInfo.senderName}
          onChange={handleChange}
          className="personalInfo__input__inside"
        />
        <Input
          size="middle"
          placeholder="Số điện thoại người gửi"
          name="senderPhone"
          className="personalInfo__input__inside"
          value={personalInfo.senderPhone}
          prefix={<PhoneOutlined />}
          onChange={handleChange}
        />
      </div>
      <div className="personalInfo__input">
        <Input
          size="middle"
          placeholder="Tên người nhận"
          prefix={<UserOutlined />}
          name="recipientName"
          value={personalInfo.recipientName}
          onChange={handleChange}
          className="personalInfo__input__inside"
        />
        <Input
          size="middle"
          placeholder="Số điện thoại người nhận"
          name="recipientPhone"
          className="personalInfo__input__inside"
          value={personalInfo.recipientPhone}
          prefix={<PhoneOutlined />}
          onChange={handleChange}
        />
        <Input
          size="middle"
          placeholder="Email người nhận"
          name="recipientEmail"
          className="personalInfo__input__inside"
          value={personalInfo.recipientEmail}
          prefix={<MailOutlined />}
          onChange={handleChange}
        />
        <Input
          size="middle"
          placeholder="CCCD/CMT người nhận"
          name="recipientNationalId"
          className="personalInfo__input__inside"
          value={personalInfo.recipientNationalId}
          prefix={<SolutionOutlined />}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default PersonalInfo
