import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import FeedbackForm from "./pages/FeedbackForm";
import FeedbackList from "./pages/FeedbackList";
import EditFeedback from "./pages/EditFeedback";
import CheckInOptions from "./Pages/CheckInOptions";
import FaceRecognition from "./Pages/FaceScannerCheckIn";
import ManualCheckIn from "./Pages/ManualCheckin";
import CheckinDetails from "./Pages/CheckinDetails";
import EditCheckin from "./Pages/EditCheckin";
import ThankYou from "./pages/Thankyou";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/edit-checkin/:checkInId" element={<EditCheckin />} />
        <Route path="/checkin-details" element={<CheckinDetails />} />
        <Route path="/edit-feedback/:id" element={<EditFeedback />} />
        <Route path="/feedback-form" element={<FeedbackForm />} />
        <Route path="/feedback-list" element={<FeedbackList />} />
        <Route path="/checkin" element={<CheckInOptions />} />
        <Route path="/face-checkin" element={<FaceRecognition />} />
        <Route path="/manual-checkin" element={<ManualCheckIn />} />
        <Route path="/thankyou" element={<ThankYou />} />
      </Routes>
    </Router>
  );
}

export default App;
