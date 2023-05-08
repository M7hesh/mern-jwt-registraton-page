import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    mobileNumber: "",
    password: "",
  });
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const navigate = useNavigate();
  const { mobileNumber, password } = formData;

  const handlePhoneNumberValidation = (e) => {
    e.preventDefault();
    const phoneNoRegex = /^\d{10}$/;
    if (!e.target.value.match(phoneNoRegex) && e.target.value) {
      document.getElementById(
        `mobileNumberError`
      ).innerHTML = `Invalid Phone number!`;
      setIsPhoneValid(false);
    } else {
      setIsPhoneValid(true);
      document.getElementById(`mobileNumberError`).innerHTML = "";
    }
  };

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value, placeholder } = event.target;
    if (name === "mobileNumber") {
      console.log(value.length);
      handlePhoneNumberValidation(event);
    }
    setFormData((prevState) => {
      return { ...prevState, [name]: value };
    });

    // validation
    // if (value === "" || value === null) {
    //   document.getElementById(
    //     `${name}Error`
    //   ).innerHTML = `${placeholder} is a required field`;
    // } else {
    //   document.getElementById(`${name}Error`).innerHTML = "";
    // }
  };

  const handlePaymentProceed = (e) => {
    e.preventDefault();
    if (!(password && mobileNumber)) {
      document.getElementById("proceedError").innerHTML =
        "Please enter the credentials!";
    }
    // else {
    //   navigate("/profile");
    // }
  };

  return (
    <main>
      <label htmlFor="mobileNumber">Mobile number:</label>
      <div>
        <input
          id="mobileNumber"
          name="mobileNumber"
          type="text"
          placeholder="Mobile number"
          value={mobileNumber}
          maxLength={10}
          onChange={handleChange}
          required
        />
        <span>*</span>
        <p id="mobileNumberError"></p>
      </div>

      <label htmlFor="password">Password:</label>
      <div>
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

      <div>
        {"  "}
        <p id="proceedError"></p>
      </div>

      <button id="btn2" type="button" onClickS={handlePaymentProceed}>
        Log in
      </button>
      {/* forgot password */}
      <p className="register">
        Not a member? <a href="/register">Register here!</a>
      </p>
    </main>
  );
};

export default Login;
