import React from "react";
import { Container, Button, Nav, Navbar } from "react-bootstrap";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./VisitorDashboard.css";
import Sidebar from "../../components/SideNav";

const VisitorDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="dashboard-content">

                {/* Notifications Section */}
                <div className="notification-bar">
                    <h2>Notifications</h2>
                    <ul>
                        <li>No new notifications.</li>

                    </ul>
                </div>
                {/* Dashboard Content */}
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
                            Check-In/Out Using Biometrics
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => navigate("/manual-checkin")}
                        >
                            Check-In/Out Manually
                        </Button>
                    </div>

                    {/* Meeting room Tab */}
                    <div className="dashboard-tab">
                        <h4>Meet Your Host</h4>
                        <Button
                            variant="primary"
                            className="me-2"
                            onClick={() => navigate("/")}
                        >
                            Scan QR Code
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => navigate("/")}
                        >
                            Access Meeting Room
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
        </div>
    );
};


export default VisitorDashboard;
