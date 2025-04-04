import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AppointmentList.css";

function AppointmentList({ isHost }) {
    const [appointments, setAppointments] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/appointments")
            .then((res) => setAppointments(res.data))
            .catch((err) => console.error("Error fetching appointments:", err));
    }, []);

    const handleStatusChange = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/appointments/${id}`, { status });
            setAppointments(
                appointments.map((appt) =>
                    appt._id === id ? { ...appt, status } : appt
                )
            );
        } catch (error) {
            console.error("Error updating appointment status:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/appointments/${id}`);
            setAppointments(appointments.filter((appt) => appt._id !== id));
            setConfirmDelete(null);
        } catch (error) {
            console.error("Error deleting appointment:", error);
        }
    };

    const handleUpdate = (id) => {
        navigate(`/edit-Appointment/${id}`);
    };

    return (
        <div className="appointments">
            <h2>{isHost ? "Manage Appointments" : "Your Appointments"}</h2>
            <div className="appointments-grid">
                {appointments.map((appt) => (
                    <div key={appt._id} className="card">
                        <p>
                            <strong>Date:</strong> {appt.date || "N/A"}
                        </p>
                        <p>
                            <strong>Time:</strong> {appt.time || "N/A"}
                        </p>
                        <p>
                            <strong>Reason:</strong> {appt.reason || "Not Provided"}
                        </p>
                        <p>
                            <strong>Email:</strong> {appt.email || "Not Provided"}
                        </p>
                        <p className={`status ${appt.status.toLowerCase()}`}>
                            <strong>Status:</strong> {appt.status}
                        </p>

                        {isHost ? (
                            appt.status === "Pending" && (
                                <div className="buttons">
                                    <button
                                        className="approve"
                                        onClick={() => handleStatusChange(appt._id, "Approved")}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="reject"
                                        onClick={() => handleStatusChange(appt._id, "Rejected")}
                                    >
                                        Reject
                                    </button>
                                </div>
                            )
                        ) : (
                            <div className="buttons">
                                <button
                                    className="update"
                                    onClick={() => handleUpdate(appt._id)}
                                >
                                    Update
                                </button>
                                <button
                                    className="delete"
                                    onClick={() => setConfirmDelete(appt._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {confirmDelete && (
                <div className="confirmation-overlay">
                    <div className="confirmation-box">
                        <h3>Are you sure you want to delete this appointment?</h3>
                        <div className="confirm-buttons">
                            <button
                                className="confirm"
                                onClick={() => handleDelete(confirmDelete)}
                            >
                                Yes, Delete
                            </button>
                            <button className="cancel" onClick={() => setConfirmDelete(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AppointmentList;
