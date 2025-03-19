import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FeedbackForm from "./pages/FeedbackForm";
import FeedbackList from "./pages/FeedbackList";

const App = () => {
  return (
    <Router>
      <Routes>

        <Route path="/feedback-form" element={<FeedbackForm />} />
        <Route path="/feedback-list" element={<FeedbackList />} />

      </Routes>
    </Router>
  );
};




export default App
