import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Admin/Sidebar";
import Dashboard from "./Admin/Dashboard";
import Event from "./Admin/Event";
import Emcee from "./Admin/Emcee";
import Shop from "./Admin/Shop";
import Login from "./Admin/Login";
import CreateTix from "./Admin/CreateTix";
import TixMonitor from "./Admin/TixMonitor";

function PrivateLayout({ isLoggedIn, onLogout }) {
  return isLoggedIn ? (
    <div className="flex ">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 ">
        <Outlet />
      </div>
    </div>
  ) : (
    <Navigate to="/admin" />
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loginHandler = () => setIsLoggedIn(true);
  const logoutHandler = () => setIsLoggedIn(false);

  return (
    <Router>
      <Routes>
        <Route path="/admin">
          {/* Redirect if logged in */}
          <Route index element={isLoggedIn ? <Navigate to="/admin/Dashboard" /> : <Login loginHandler={loginHandler} />} />

          {/* Protected Routes inside Sidebar */}
          <Route element={<PrivateLayout isLoggedIn={isLoggedIn} onLogout={logoutHandler} />}>
            <Route path="Dashboard" element={<Dashboard />} />
            <Route path="Event" element={<Event />} />
            <Route path="Shop" element={<Shop />} />
            <Route path="Emcee" element={<Emcee />} />
            <Route path="CreateTix" element ={<CreateTix/>} />
            <Route path="TixMonitor" element ={<TixMonitor/>} />
            
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
