import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Appointment.css"

function EditAppointment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        time: '',
        reason: ''
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/appointments/${id}`)
            .then((res) => setFormData(res.data))
            .catch((err) => {
                console.error(err);
                setError('Failed to fetch appointment data.');
            });
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Reset any previous error messages
        try {
            await axios.put(`http://localhost:5000/api/appointments/${id}`, formData);
            navigate('/'); // Redirect to dashboard after update
        } catch (error) {
            console.error('Error updating appointment:', error);
            setError('Failed to update the appointment. Please try again.');
        }
    };

    return (
        <div className="container">
            <h2>Update Appointment</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                />
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    placeholder="Select appointment date"
                    required
                />
                <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    placeholder="Select appointment time"
                    required
                />
                <input
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Describe the reason for your appointment"
                    required
                />
                <button type="submit" className="update">Update Appointment</button>
            </form>
        </div>
    );
}

export default EditAppointment;
