import './Login.scss'

import { LoginPicture } from '../../assets/login.jpg';
import { Logo } from "../../assets/logo.png";
import api from '../../config/axios';
import { jwtDecode } from 'jwt-decode';
import { token } from './../../components/GetToken';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Login() {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const nav = useNavigate();
  // const dispatch = useDispatch();

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const payload = {
  //     email,
  //     password,
  //   };
  //   try {
  //     const response = await api.post("/User/Login/login", payload);
  //     const token = response.data;
  //     localStorage.setItem("token", token);
  //     const user = jwtDecode(token);
  //     dispatch(login(user));
  //     if (user.Role === "Customer") {
  //       nav("/");
  //     }
  //     if (user.Role === "Admin") {
  //       nav("/dashboard/admin");
  //     }
  //     if (user.Role === "Staff") {
  //       nav("/dashboard/staff");
  //     }
  //     message.success('Login successfully')
  //   } catch (error) {
  //     let errorMessage = "An error occurred. Please try again.";
  //     if (error.response && error.response.data) {
  //       errorMessage = error.response.data;
  //     }
  //     message.error(errorMessage);
  //   }
  // };

  return (
    <div className="login-container">
      <div className="introduction-image">
        <img
          src={LoginPicture}
          alt="Login"
          onClick={() => nav("/")}
          style={{ cursor: "pointer" }}
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
              height: "9vh",
              marginBottom: "1em",
              cursor: "pointer",
            }}
          />
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@gmail.com"
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
          <button type="submit" className="login-btn" style={{marginTop:'3em'}}>
            Login
          </button>
          {/* {error && <p className="error-message">{error}</p>} */}
        </form>
        <div className="login-options">
         
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
