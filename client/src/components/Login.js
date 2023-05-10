import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../App";

const Login = () => {
  const [formData, setFormData] = useState({
    mobileNumber: "",
    password: "",
  });
  const [isMobileNumberValid, setIsMobileNumberValid] = useState(false);
  const [user, setUser] = useContext(UserContext);
  const navigate = useNavigate();
  const { mobileNumber, password } = formData;

  useEffect(() => {
    console.log("login user changed", user);
  }, [user]);

  const handleMobileNumberValidation = () => {
    const mobileNoRegex = /^\d{10}$/;
    if (mobileNumber && !mobileNumber.match(mobileNoRegex)) {
      document.getElementById(
        `mobileNumber-error`
      ).innerHTML = `Invalid Mobile number!`;
      setIsMobileNumberValid(false);
    } else {
      setIsMobileNumberValid(true);
      document.getElementById(`mobileNumber-error`).innerHTML = "";
    }
  };

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    setFormData((prevState) => {
      return { ...prevState, [name]: value };
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    handleMobileNumberValidation();
    if (!(password && mobileNumber) || !isMobileNumberValid) {
      return;
    } else {
      const resp = await axios.post("https://localhost:3001/login", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      const result = await resp.json();
      console.log("login: result", result);
      if (result.accessToken) {
        //add it in context
        setUser({ accessToken: result.accessToken });
        navigate(`/profile/${result.id}`);
      } else {
        console.log(result.error);
      }
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h1>Log in</h1>
      <div>
        <label htmlFor="mobile-number">Mobile number</label>
        <input
          id="mobile-number"
          name="mobileNumber"
          type="text"
          placeholder="Mobile number"
          value={mobileNumber}
          maxLength={10}
          onChange={handleChange}
          required
        />
        <span>*</span>
        <p id="mobileNumber-error"></p>
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={handleChange}
          required
        />
        <span>*</span>
      </div>

      <button type="submit">Log in</button>
      {/* forgot password */}
      <p className="register">
        Not a member? &nbsp;
        <a href="/register">Register here!</a>
      </p>
    </form>
  );
};

export default Login;
