import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Registration from "./components/Registration";
import Login from "./components/Login";
import Profile from "./components/Profile";
import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext([]);

function App() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate();
  // const logOut = async () => {
  //   await axios.post(
  //     "http://localhost:3001/logout",
  //     {},
  //     { withCredentials: true }
  //   );
  //   // clear context
  //   setUser({});
  //   navigate("/login");
  // };

  useEffect(() => {
    const checkRefreshToken = async () => {
      const resp = await axios.post(
        "http://localhost:3001/refresh_token",
        {},
        { withCredentials: true }
      );
      const result = await resp.json();
      setUser({
        accessToken: result?.accessToken,
      });
      setLoading(false);
    };
    checkRefreshToken();
  }, []);

  // if (loading)
  //   return (
  //     <div>
  //       <h1>Loading</h1>
  //     </div>
  //   );
  return (
    <>
      <UserContext.Provider value={[user, setUser]}>
        <div className="app">
          <BrowserRouter>
            <Routes>
              <Route path="/register" element={<Registration />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="*" element={<h1>404 Page not found</h1>} />
            </Routes>
          </BrowserRouter>
        </div>
      </UserContext.Provider>
    </>
  );
}

export default App;
