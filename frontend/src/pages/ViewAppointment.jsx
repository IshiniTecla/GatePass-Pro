// ViewAppointment.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./AppointmentList.css"

function ViewAppointment() {
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        
        axios.get('http://localhost:5000/api/appointments')
            .then((res) => setAppointments(res.data))
            .catch((err) => console.error('Error fetching appointments:', err));
    }, []);

    const handleStatusChange = async (id, status) => {
        try {
            // Use the correct route for updating the status
            await axios.put(`http://localhost:5000/api/appointments/status/${id}`, { status });
            
            // Update the state to reflect the status change
            setAppointments(appointments.map(appt => appt._id === id ? { ...appt, status } : appt));
        } catch (error) {
            console.error('Error updating appointment status:', error);
        }
    };
    

    return (
        <div className="container">
            <div className="appointments">
                <div className="appointments-grid">
                    {appointments.map((appt) => (
                        <div key={appt._id} className="card">
                            <h3>{appt.name}</h3>
                            <p><strong>Email:</strong> {appt.email || "No email provided"}</p>
                            <p><strong>Date:</strong> {appt.date}</p>
                            <p><strong>Time:</strong> {appt.time}</p>
                            <p><strong>Reason:</strong> {appt.reason}</p>
                            <p className={`status ${appt.status.toLowerCase()}`}>
                                <strong>Status:</strong> {appt.status}
                            </p>
                            {appt.status === 'Pending' && (
                                <div className="buttons">
                                    <button className="approve" onClick={() => handleStatusChange(appt._id, 'Approved')}>Approve</button>
                                    <button className="reject" onClick={() => handleStatusChange(appt._id, 'Rejected')}>Reject</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ViewAppointment;
