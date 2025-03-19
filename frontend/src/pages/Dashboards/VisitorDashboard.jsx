import React from "react";
import { Container, Button, Nav, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/VisitorDashboard.css";

const VisitorDashboard = () => {
    const navigate = useNavigate();

    return (
        <div>
            {/* Notification Bar */}
            <Navbar bg="info" variant="dark">
                <Container>
                    <Navbar.Brand>Notifications</Navbar.Brand>
                    <span className="notification-text">No new notifications.</span>
                </Container>
            </Navbar>

            <Container className="dashboard-container mt-5">
                <h2 className="text-center mb-4">Visitor Dashboard</h2>

                {/* Check-In/Check-Out Tab */}
                <div className="dashboard-tab">
                    <h4>Check-In/Check-Out</h4>
                    <Button
                        variant="primary"
                        className="me-2"
                        onClick={() => navigate("/face-recognition")}
                    >
                        Face Recognition
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigate("/manual-checkin-checkout")}
                    >
                        Manual Check-In/Check-Out
                    </Button>
                </div>

                {/* Appointment Scheduling Tab */}
                <div className="dashboard-tab">
                    <h4>Appointment Scheduling</h4>
                    <Button
                        variant="primary"
                        className="me-2"
                        onClick={() => navigate("/schedule-appointment")}
                    >
                        Schedule Appointment
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigate("/view-appointments")}
                    >
                        View Appointments Scheduled
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default VisitorDashboard;
