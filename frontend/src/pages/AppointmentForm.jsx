// AppointmentForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import axios from "axios";
import "./Appointment.css";

const AppointmentForm = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/appointments", formData);

      enqueueSnackbar("Appointment submitted successfully!", {
        variant: "success",
        autoHideDuration: 2000,
      });

      setLoading(false);
      navigate("/appointment-list", { state: { submitted: true } });
    } catch (error) {
      console.error("Error submitting appointment:", error);

      enqueueSnackbar("Failed to submit appointment. Please try again.", {
        variant: "error",
        autoHideDuration: 2000,
      });

      setLoading(false);
    }
  };

  return (
    <div className="appointment-form-container">
      <div className="appointment-card">
        <h2 className="text-center mb-4">Schedule Appointment</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Your Name:</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>Email:</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>Date:</label>
            <input
              type="date"
              className="form-control"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>Time:</label>
            <input
              type="time"
              className="form-control"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>Reason:</label>
            <textarea
              className="form-control"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
