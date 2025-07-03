import React, { useEffect, useState } from "react";
import "./Profile.scss";
import Sidebar from "../../components/sidebar_profile/Sidebar";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/features/counterSlice";
import api from "../../config/axios";
import { toast } from "react-toastify";

function Profile() {
  const user = useSelector(selectUser);
  const [userData, setUserData] = useState({
    id: "",
    userName: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    bankId: "",
    address: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id || !user?.token) return;

      try {
        const response = await api.get(`users/${user.id}`, {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = response.data.data;

        setUserData({
          id: data.id || "",
          userName: data.userName || "",
          fullName: data.fullName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          birthDate: data.birthDate || "",
          bankId: data.bankId || "",
          address: data.address || "",
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSaveInfomationUser = async (e) => {
    e.preventDefault();

    // if (!userData.id) {
    //   alert("Không tìm thấy ID người dùng. Vui lòng tải lại trang.");
    //   return;
    // }

    const patchUserData = {
      userName: userData.userName,
      fullName: userData.fullName,
      email: userData.email,
      birthDate: userData.birthDate,
      bankId: userData.bankId,
      address: userData.address,
    };

     console.log("Payload gửi đi:", patchUserData);

    try {
      await api.put("/users", patchUserData, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("Cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật người dùng:", error);
      toast.error("Cập nhật thất bại!");
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
              <form onSubmit={handleSaveInfomationUser}>
                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  value={userData.userName}
                  onChange={(e) =>
                    setUserData({ ...userData, userName: e.target.value })
                  }
                />
                <label>Tên khách hàng</label>
                <input
                  type="text"
                  value={userData.fullName}
                  onChange={(e) =>
                    setUserData({ ...userData, fullName: e.target.value })
                  }
                />

                <label>Email</label>
                <div className="input-group">
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) =>
                      setUserData({ ...userData, email: e.target.value })
                    }
                  />
                </div>

                <label>Số điện thoại</label>
                <div className="input-group">
                  <input type="text" value={userData.phoneNumber} readOnly />
                </div>

                <label>Ngày sinh</label>
                <input
                  type="date"
                  value={userData.birthDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, birthDate: e.target.value })
                  }
                />

                <label>Chứng minh thư/ Mã số thuế</label>
                <input
                  type="text"
                  value={userData.bankId || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, bankId: e.target.value })
                  }
                />

                <label>Địa chỉ thường trú/ Địa chỉ xuất hóa đơn</label>
                <input
                  type="text"
                  placeholder="123 ABC"
                  value={userData.address || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, address: e.target.value })
                  }
                />

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
