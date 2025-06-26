import React, { useState } from "react";
import { toast } from "react-toastify";
import "./Support.scss";

function Support() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, phone, message } = formData;

    if (!name || !email || !phone || !message) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    toast.success("Đã gửi liên hệ thành công!");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };
  return (
    <div className="support-container">
      <h1>Liên hệ ngay với MetroShip</h1>
      <form className="support-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Họ tên</label>
          <input
            type="text"
            name="name"
            placeholder="Nhập họ tên"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Nhập email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            type="text"
            name="phone"
            placeholder="Nhập số điện thoại"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Ghi chú</label>
          <textarea
            name="message"
            placeholder="Nội dung ghi chú"
            value={formData.message}
            onChange={handleChange}
          ></textarea>
        </div>
        <button type="submit">Gửi ngay</button>
      </form>
    </div>
  );
}

export default Support;
