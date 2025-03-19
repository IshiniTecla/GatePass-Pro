import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FeedbackForm from "./pages/FeedbackForm";
import FeedbackList from "./pages/FeedbackList";
import VisitorDashboard from "./pages/Dashboards/VisitorDashboard"
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/global.css";


const App = () => {
  return (
    <Router>
      <Routes>

        <Route path="/feedback-form" element={<FeedbackForm />} />
        <Route path="/feedback-list" element={<FeedbackList />} />
        <Route path="/visitor-dashboard" element={<VisitorDashboard />} />
      </Routes>
    </Router>
  );
};




export default App
