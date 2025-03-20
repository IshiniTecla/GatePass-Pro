import React from "react";
import { Container, Button, Nav, Navbar } from "react-bootstrap";
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
                    <h2 className="text-center mb-4">Admin Dashboard</h2>

                    {/* Check-In/Check-Out Tab */}
                    <div className="dashboard-tab">
                        <h4>View Check-In/Check-Out Logs</h4>
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
                        <h4>Manage Registered Visitors</h4>
                        <Button
                            variant="primary"
                            className="me-2"
                            onClick={() => navigate("/")}
                        >
                            Manage
                        </Button>

                    </div>

                    {/* Appointment Scheduling Tab */}
                    <div className="dashboard-tab">
                        <h4>Register visitors manually</h4>
                        <Button
                            variant="primary"
                            className="me-2"
                            onClick={() => navigate("/schedule-appointment")}
                        >

                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => navigate("/view-appointments")}
                        >

                        </Button>
                    </div>
                </Container>
            </div>
        </div>
    );
};


export default VisitorDashboard;
