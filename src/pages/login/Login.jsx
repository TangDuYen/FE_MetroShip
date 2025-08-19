import "./Login.scss";

import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

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

// import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleLoginSuccess = (response) => {
    const token = response.data.token;
    const refreshToken = response.data.refreshToken;
    const refreshTokenExpiredTime = response.data.refreshTokenExpiredTime;
    const userId = response.data.id;
    const staffAssignments = response.data.staffAssignments;

    const user = jwtDecode(token);

    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("refreshTokenExpiredTime", refreshTokenExpiredTime);
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
    } else if (user.role.includes("Admin")) {
      nav("/dashboard/admin");
    } else if (user.role.includes("Staff")) {
      if (Array.isArray(staffAssignments)) {
        localStorage.setItem("staffAssignments", JSON.stringify(staffAssignments));
      }
      nav("/dashboard/staff/pending-order");
    }

    toast.success("Đăng nhập thành công");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      username,
      password,
    };
    try {
      const response = await api.post("/auth/authentication", payload);
      handleLoginSuccess(response);
    } catch (error) {
      const { code, message } = error.response?.data || {};
      if (code === "Password is wrong.") {
        toast.error("Mật khẩu không đúng");
      } else if (code === "Username invalid.") {
        toast.error("Không tìm thấy tài khoản");
      } else {
        toast.error(message || "Đăng nhập thất bại. Vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  };

  // const googleLogin = async (credentialResponse) => {
  //   setLoading(true);
  //   try {
  //     const response = await api.post("/auth/authentication/google", {
  //       idToken: credentialResponse.credential,
  //     });
  //     handleLoginSuccess(response);
  //   } catch (err) {
  //     toast.error("Đăng nhập Google thất bại");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <Spin spinning={loading} tip="Đang đăng nhập..." size="large">
      <div className="login-container" style={{ pointerEvents: loading ? "none" : "auto", opacity: loading ? 0.6 : 1 }}>
        <div className="introduction-image">
          <img src={LoginPicture} alt="Login" onClick={() => nav("/")} />
        </div>
        <div className="login-form-container">
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <img
              onClick={() => nav("/")}
              src={Logo}
              alt="Logo"
              style={{ width: "18vw", height: "20vh", marginBottom: "1em", cursor: "pointer" }}
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
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  required
                  style={{ paddingRight: "40px" }}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#888",
                  }}
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </span>
              </div>
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe">Nhớ đăng nhập</label>
              </div>
              <a href="/verify-mail" className="recovery-link">
                Quên mật khẩu?
              </a>
            </div>
            {/* <div className="login-options">
              <div className="google-login-btn">
                <GoogleLogin
                  onSuccess={googleLogin}
                  onError={() => toast.error("Đăng nhập Google thất bại")}
                />
              </div>
            </div> */}
            <button type="submit" className="login-btn" style={{ marginTop: "1em" }}>
              Đăng nhập
            </button>
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
