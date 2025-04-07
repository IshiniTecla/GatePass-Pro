import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import VisitorDashboard from "./pages/Dashboards/VisitorDashboard"
import AppointmentForm from "./pages/AppointmentForm"
import AppointmentList from "./pages/AppointmentList"
import EditAppointment from "./pages/EditAppointment";
import HostDashboard from './pages/Dashboards/HostDashboard';
import ViewAppointment from './pages/ViewAppointment';

const App = () => {
  return (
    <Router>
      <Routes>
        
        <Route path="/edit-Appointment/:id" element={<EditAppointment />}/>
        <Route path="" element={<VisitorDashboard />} />
        <Route path="/host-dashboard" element={<HostDashboard />} />
        <Route path="/appointment-form" element={<AppointmentForm />} />
        <Route path="/appointment-list" element={<AppointmentList />} />
        <Route path="/view-appointment" element={<ViewAppointment />} />
      </Routes>
    </Router>
  );
};




export default App
