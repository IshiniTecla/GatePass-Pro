import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import FeedbackForm from "./pages/FeedbackForm";
import FeedbackList from "./pages/FeedbackList";
import EditFeedback from "./pages/EditFeedback";
import FaceRecognition from "./pages/FaceRecognition";
import ManualCheckIn from "./pages/ManualCheckin";
import HomePage from "./pages/Home";
import AboutUsPage from "./pages/AboutUsPage";
import RegisterPage from "./pages/Register";
import ExpertsPage from "./pages/ExpertsPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./components/NotFound";
import UserDashboard from "./components/UserDashboard";  // Make sure this component exists
import TokenWarningModal from './components/common/TokenWarningModal';
import { UserService } from './services/UserService';
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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/edit-feedback/:id" element={<EditFeedback />} />
        <Route path="/feedback-form" element={<FeedbackForm />} />
        <Route path="/feedback-list" element={<FeedbackList />} />
        <Route path="/face-recognition" element={<FaceRecognition />} />
        <Route path="/manual-checkin" element={<ManualCheckIn />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/experts" element={<ExpertsPage />} />
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
