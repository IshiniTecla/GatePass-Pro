import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import FeedbackForm from "./pages/FeedbackForm";
import FeedbackList from "./pages/FeedbackList";
import EditFeedback from "./pages/EditFeedback";
import VisitorDashboard from "./pages/Dashboards/VisitorDashboard"
import FaceRecognition from "./pages/FaceRecognition";
import ManualCheckIn from "./pages/ManualCheckin";
import AppointmentForm from "./pages/AppointmentForm"
import AppointmentList from "./pages/AppointmentList"
import EditAppointment from "./pages/EditAppointment";
import HostDashboard from './pages/Dashboards/HostDashboard';
import ViewAppointment from './pages/ViewAppointment';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/edit-feedback/:id" element={<EditFeedback />} />
        <Route path="/edit-Appointment/:id" element={<EditAppointment />} />
        <Route path="/feedback-form" element={<FeedbackForm />} />
        <Route path="/feedback-list" element={<FeedbackList />} />
        <Route path="/visitor-dashboard" element={<VisitorDashboard />} />
        <Route path="/host-dashboard" element={<HostDashboard />} />
        <Route path="/face-recognition" element={<FaceRecognition />} />
        <Route path="/manual-checkin" element={<ManualCheckIn />} />
        <Route path="/appointment-form" element={<AppointmentForm />} />
        <Route path="/appointment-list" element={<AppointmentList />} />
        <Route path="/view-appointment" element={<ViewAppointment />} />
      </Routes>
    </Router>
  );
};




export default App
