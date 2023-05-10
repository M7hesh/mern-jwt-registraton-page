import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";

const Profile = () => {
  const [user] = useContext(UserContext);
  const [content, setContent] = useState("Please log in!");
  useEffect(() => {
    const getProfile = async () => {
      const resp = await axios.post(
        "http://localhost:3001/profile",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );
      const result = await resp.json();
      if (result.data) {
        setContent(result.data);
      }
    };
    getProfile();
  }, [user]);
  return (
    <div>
      <h1>Profile</h1>
      <div>{content}</div>
    </div>
  );
};

export default Profile;
