import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import FeedbackForm from "./pages/FeedbackForm";
import FeedbackList from "./pages/FeedbackList";
import EditFeedback from "./pages/EditFeedback";
import VisitorDashboard from "./pages/Dashboards/VisitorDashboard"
import FaceRecognition from "./pages/FaceRecognition";
import ManualCheckIn from "./pages/ManualCheckin";
import HostDashboard from './pages/Dashboards/HostDashboard';
import AdminDashboard from './pages/Dashboards/AdminDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/edit-feedback/:id" element={<EditFeedback />} />
        <Route path="/feedback-form" element={<FeedbackForm />} />
        <Route path="/feedback-list" element={<FeedbackList />} />
        <Route path="/visitor-dashboard" element={<VisitorDashboard />} />
        <Route path="/host-dashboard" element={<HostDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/face-recognition" element={<FaceRecognition />} />
        <Route path="/manual-checkin" element={<ManualCheckIn />} />
      </Routes>
    </Router>
  );
};




export default App
