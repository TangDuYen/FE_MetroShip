import React, { useState } from "react";
import "./Profile.scss";
import Sidebar from "../../components/sidebar_profile/Sidebar";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    address: "",
    imageUrl: "",
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Hiển thị ảnh ngay lập tức
      const imageUrl = URL.createObjectURL(file);
      setUserData((prev) => ({ ...prev, imageUrl }));
    }
  };

  const handleImageClick = () => {
    if (isEditing) {
      document.getElementById("fileInput").click(); // Kích hoạt input file ẩn
    }
  };
  return (
    <div className="profile">
      <section className="profile-wrapper">
        <div className="profile-row">
          <div className="profile-left">
            <Sidebar />
          </div>
          <div className="profile-right">
            <div className="account-form">
              <h2>THÔNG TIN TÀI KHOẢN</h2>
              <form>
                <label>Tên khách hàng</label>
                <input type="text" placeholder="Nguyễn Văn A" required />

                <label>Email</label>
                <div className="input-group">
                  <input
                    type="email"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <label>Số điện thoại</label>
                <div className="input-group">
                  <input type="text" placeholder="0912345678" required />
                </div>

                <label>Ngày sinh</label>
                <input type="date" required />

                <label>Chứng minh thư/ Mã số thuế</label>
                <input type="text" />

                <label>Địa chỉ thường trú/ Địa chỉ xuất hóa đơn</label>
                <input type="text" placeholder="123 ABC" />

                <div className="address-row">
                  <select required>
                    <option value="">Tỉnh/Thành phố</option>
                  </select>
                  <select required>
                    <option value="">Quận/Huyện</option>
                  </select>
                  <select required>
                    <option value="">Phường/Xã</option>
                  </select>
                </div>

                <label>Đường/Thôn/Xóm</label>
                <input type="text" />

                <label>Địa chỉ đầy đủ</label>
                <input type="text" />


                <button type="submit" className="btn-save">
                  Lưu
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Profile;
