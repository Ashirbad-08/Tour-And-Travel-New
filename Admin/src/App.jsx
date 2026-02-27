import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from './pages/Dashboard';
import Booking from "./pages/Booking";
import Packages from "./pages/Packages";
import Service from "./pages/Service";
import Traveller from "./pages/Traveller";
import Guides from "./pages/Guides";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import AdminProfile from "./pages/AdminProfile";
import Coupons from "./pages/Coupons";
import Feedback from "./pages/Feedback";
// import Hotels from './pages/Hotels';
// import Flights from './pages/Flights';
// import Transportation from './pages/Transportation';
// import Customers from './pages/Customers';
// import Reviews from './pages/Reviews';
import Enquiry from "./pages/Enquiry";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import "./styles/App.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <Routes>
        {/* ── Auth pages — full screen, no shell ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ── Admin shell ── */}
        <Route path="/*" element={
          <div className="app">
            <Header toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/bookings" element={<Booking />} />
                <Route path="/tour-packages" element={<Packages />} />
                <Route path="/services" element={<Service />} />
                <Route path="/customers" element={<Traveller />} />
                <Route path="/guides" element={<Guides />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/profile" element={<AdminProfile />} />
                <Route path="/coupons" element={<Coupons />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/Enquiry" element={<Enquiry />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
