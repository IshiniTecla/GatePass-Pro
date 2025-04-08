import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/edit-feedback/:id" element={<EditFeedback />} />
        <Route path="/feedback-form" element={<FeedbackForm />} />
        <Route path="/feedback-list" element={<FeedbackList />} />
        <Route path="/face-recognition" element={<FaceRecognition />} />
        <Route path="/manual-checkin" element={<ManualCheckIn />} />
        <Route path="" element={<HomePage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/experts" element={<ExpertsPage />} />
      </Routes>
    </Router>
  );
};




export default App
