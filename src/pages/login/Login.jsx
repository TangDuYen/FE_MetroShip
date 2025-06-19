import "./Login.scss";

import { GoogleOutlined } from "@ant-design/icons";
import LoginPicture from "../../assets/login.jpg";
import Logo from "../../assets/logo2.png";
import { Spin } from "antd";
import api from "../../config/axios";
import { jwtDecode } from "jwt-decode";
import { login } from "../../redux/features/counterSlice";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      username,
      password,
    };
    try {
      const response = await api.post("/auth/authentication", payload);

      //DECODE TOKEN 
      const token = response.data.token;
      const user = jwtDecode(token);
      //Dùng đỡ sau khi có api get user by id thì bỏ
      const userId = response.data.id;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      dispatch(
        login({
          ...user,
          id: userId,
          token: token,
        })
      );

      if (user.role.includes("Customer")) {
        nav("/");
      }
      if (user.role.includes("Admin")) {
        nav("/dashboard/admin");
      }
      if (user.role.includes("Staff")) {
        nav("/dashboard/staff/pending-order");
      }
      toast.success("Đăng nhập thành công");
    } catch (error) {
      let errorMessage = "Có lỗi xảy ra. Hãy thử lại.";
      toast.error(errorMessage);
    }
  };

  return (
     <Spin spinning={loading} tip="Đang đăng nhập..." size="large">
      <div className="login-container" style={{ pointerEvents: loading ? "none" : "auto", opacity: loading ? 0.6 : 1 }}>
      <div className="introduction-image">
        <img src={LoginPicture} alt="Login" onClick={() => nav("/")} />
      </div>
      <div className="login-form-container">
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
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="username"
              id="username"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Tên đăng nhập"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              required
            />
          </div>
          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="rememberMe" />
              <label htmlFor="rememberMe">Nhớ đăng nhập</label>
            </div>
            <a href="/verify-mail" className="recovery-link">
              Quên mật khẩu?
            </a>
          </div>
          <div className="login-options">
            <div className="google-login-btn">
              <GoogleOutlined style={{ color: "#0066CC" }} />
            </div>
          </div>
          <button
            type="submit"
            className="login-btn"
            style={{ marginTop: "1em" }}
          >
            Đăng nhập
          </button>
          {/* {error && <p className="error-message">{error}</p>} */}
        </form>
        <div className="login-option">
          <p>
            Chưa có tài khoản?{" "}
            <a href="/sign-up" className="signup-link">
              Đăng kí
            </a>
          </p>
        </div>
      </div>
    </div>
     </Spin>
    
  );
}

export default Login;
