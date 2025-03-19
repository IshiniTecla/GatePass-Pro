import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FeedbackForm from "./pages/FeedbackForm";
import FeedbackList from "./pages/FeedbackList";
import VisitorDashboard from "./pages/Dashboards/VisitorDashboard"
import "bootstrap/dist/css/bootstrap.min.css";


const App = () => {
  return (
    <Router>
      <Routes>

        <Route path="/feedbackform" element={<FeedbackForm />} />
        <Route path="/feedbacklist" element={<FeedbackList />} />
        <Route path="/visitordashboard" element={<VisitorDashboard />} />
      </Routes>
    </Router>
  );
};




export default App
