import './Login.scss'

import {GoogleOutlined} from '@ant-design/icons';
import  LoginPicture  from '../../assets/login.jpg';
import  Logo  from "../../assets/logo2.png";
import api from '../../config/axios';
import { jwtDecode } from 'jwt-decode';
import { login } from '../../redux/features/counterSlice';
import { message } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Login() {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      username,
      password,
    };
    try {
      const response = await api.post("/auth/authentication", payload);
      const token = response.data.token;
      localStorage.setItem("token", token);
      const user = jwtDecode(token);
      dispatch(login(user));
      if (user.role.includes("Customer")) {
        nav("/");
      }
      if (user.role.includes("Admin")) {
        nav("/dashboard/admin");
      }
      if (user.role.includes("Staff")) {
        nav("/dashboard/staff");
      }
      message.success('Login successfully')
    } catch (error) {
      let errorMessage = "An error occurred. Please try again.";
      if (error.response && error.response.data) {
        errorMessage = error.response.data;
      }
      message.error(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <div className="introduction-image">
        <img
          src={LoginPicture}
          alt="Login"
          onClick={() => nav("/")}
        />
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
            <label htmlFor="username">User name</label>
            <input
              type="username"
              id="username"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="rememberMe" />
              <label htmlFor="rememberMe">Remember Me</label>
            </div>
            <a href="/verify-mail" className="recovery-link">
              Recovery Password
            </a>
          </div>
          <div className="login-options">
            <div className="google-login-btn">
              <GoogleOutlined style= {{color: "#0066CC"}} />
            </div>
          </div>
          <button type="submit" className="login-btn" style={{marginTop:'1em'}}>
            Login
          </button>
          {/* {error && <p className="error-message">{error}</p>} */}
        </form>
        <div className="login-option">
          <p>
            Don’t have an account yet?{" "}
            <a href="/sign-up" className="signup-link">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
