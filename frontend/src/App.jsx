import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import FeedbackForm from "./pages/FeedbackForm";
import FeedbackList from "./pages/FeedbackList";
import CreateHostProfile from "./components/hosts/CreateHostProfile";
import EditFeedback from "./pages/EditFeedback";
import CheckInOptions from "./components/CheckInOptions";
import FaceRecognition from "./components/user/FaceScannerCheckIn";
import ManualCheckIn from "./components/user/ManualCheckin";
import HomePage from "./pages/Home";
import AboutUsPage from "./pages/AboutUsPage";
import RegisterPage from "./pages/Register";
import ExpertsPage from "./pages/ExpertsPage";
import LoginPage from "./pages/LoginPage";
import HostDashboard from "./components/HostDashboard";
import CheckinDetails from './components/CheckinDetails';
import NotFound from "./components/NotFound";
import SessionManager from "./components/SessionManager";
import UserDashboard from "./components/UserDashboard";  // Make sure this component exists
import TokenWarningModal from './components/common/TokenWarningModal';
import { UserService } from './services/UserService';
import ThankYou from "./pages/Thankyou";
// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to login if no token exists
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const userService = new UserService();  // Instantiate UserService

  const handleRefreshToken = () => {
    userService.refreshAccessToken();
  };

  const handleLogout = () => {
    userService.logout();
  };

  return (
    <Router>
      {/* SessionManager handles token validation and inactivity logout */}
      <SessionManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/host-dashboard" element={
          <ProtectedRoute>
            <HostDashboard />
          </ProtectedRoute>
        } />
        <Route path="/createhost" element={
          <ProtectedRoute>
            <CreateHostProfile />
          </ProtectedRoute>
        } />


        <Route path="/checkin-details" element={<CheckinDetails />} />
        <Route path="/edit-feedback/:id" element={<EditFeedback />} />
        <Route path="/feedback-form" element={<FeedbackForm />} />
        <Route path="/feedback-list" element={<FeedbackList />} />
        <Route path="/checkin" element={<CheckInOptions />} />
        <Route path="/face-checkin" element={<FaceRecognition />} />
        <Route path="/manual-checkin" element={<ManualCheckIn />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/experts" element={<ExpertsPage />} />
        <Route path="/thankyou" element={<ThankYou />} />
        {/* Catch-all route for 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>\
      <TokenWarningModal
        warningThreshold={60}
        onRefresh={handleRefreshToken}
        onLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
