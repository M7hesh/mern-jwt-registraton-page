import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registration from "./components/Registration";
import Login from "./components/Login";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/profile/:id" Component={<Profile />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
