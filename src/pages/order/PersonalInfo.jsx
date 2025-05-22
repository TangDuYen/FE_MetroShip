import './Order.scss'

import { MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';

import { Input } from 'antd';
import { selectUser } from '../../redux/features/counterSlice';
import { useSelector } from 'react-redux';
import { useState } from 'react';

function PersonalInfo({ personalInfo, setPersonalInfo, onNext }) {
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
          placeholder="Sender Name"
          prefix={<UserOutlined />}
          name="senderName"
          value={personalInfo.senderName}
          onChange={handleChange}
          className="personalInfo__input__inside"
        />
        <Input
          size="middle"
          placeholder="Sender Phone Number"
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
          placeholder="Recipient Name"
          prefix={<UserOutlined />}
          name="recipientName"
          value={personalInfo.recipientName}
          onChange={handleChange}
          className="personalInfo__input__inside"
        />
        <Input
          size="middle"
          placeholder="Recipient Phone Number"
          name="recipientPhone"
          className="personalInfo__input__inside"
          value={personalInfo.recipientPhone}
          prefix={<PhoneOutlined />}
          onChange={handleChange}
        />
        <Input
          size="middle"
          placeholder="Recipient Email"
          name="recipientEmail"
          className="personalInfo__input__inside"
          value={personalInfo.recipientEmail}
          prefix={<MailOutlined />}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default PersonalInfo
