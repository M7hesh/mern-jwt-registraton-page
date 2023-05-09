import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    password: "",
  });

  const [isMobileNumberValid, setIsMobileNumberValid] = useState(false);
  const [isPasswordValid, setIspasswordValid] = useState(false);

  const navigate = useNavigate();
  const { firstName, lastName, mobileNumber, password } = formData;

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

  const handlePasswordValidation = () => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (password && !password.match(passwordRegex)) {
      document.getElementById(
        `password-error`
      ).innerHTML = `Password length should be atleast 8 including 1 number and 1 special character`;
      setIspasswordValid(false);
    } else {
      setIspasswordValid(true);
      document.getElementById(`password-error`).innerHTML = "";
    }
  };

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    setFormData((prevState) => {
      return { ...prevState, [name]: value };
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    handleMobileNumberValidation();
    handlePasswordValidation();
    if (
      !(firstName && lastName && password && mobileNumber) ||
      !isMobileNumberValid ||
      !isPasswordValid
    ) {
      return;
    } else {
      const resp = await axios.post(
        "https://localhost:3001/register",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const result = await resp.json();
      if (result.accessToken) {
        //add it in context
        navigate("/profile");
      } else {
        console.log(result.error);
      }
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h1>Register</h1>
      <div>
        <label htmlFor="first-name">First name</label>
        <input
          id="first-name"
          name="firstName"
          type="text"
          placeholder="Enter your first name"
          value={firstName}
          onChange={handleChange}
          required
        />
        <span>*</span>
        <p id="firstName-error"></p>
      </div>

      <div>
        <label htmlFor="last-name">Last name</label>
        <input
          id="last-name"
          name="lastName"
          type="text"
          placeholder="Enter your last name"
          value={lastName}
          onChange={handleChange}
          required
        />
        <span>*</span>
        <p id="lastName-error"></p>
      </div>

      <div>
        <label htmlFor="mobile-number">Mobile</label>
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
          placeholder="Password"
          value={password}
          onChange={handleChange}
          required
        />
        <span>*</span>
        <p id="password-error"></p>
      </div>

      <button type="submit">Register</button>
      {/* forgot password */}
      <p className="register">
        Already registered? &nbsp;<a href="/login">Log in</a>
      </p>
    </form>
  );
};

export default Registration;
