import React, { useState } from "react";

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    password: "",
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // const handlePasswordValidation = (e) => {
  //   e.preventDefault();
  //   const passwordFormat =
  //     /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  //   if (!e.target.value.match(passwordFormat) && e.target.value) {
  //     document.getElementById(`passwordError`).innerHTML = `Wrong password!`;
  //     setIspasswordValid(false);
  //   } else {
  //     setIspasswordValid(true);
  //   }
  // };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add form submission logic here
  };

  return <></>;
};

export default Registration;
