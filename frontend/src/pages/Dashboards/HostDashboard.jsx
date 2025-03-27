import React from "react";
import { Container, Button, Nav, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/SideNav";

const HostDashboard = () => {
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
                    <h2 className="text-center mb-4">Host Dashboard</h2>

                    {/* Check-In/Check-Out Tab */}
                    <div className="dashboard-tab">
                        <h4>Appoinments</h4>
                        <Button
                            variant="primary"
                            className="me-2"
                            onClick={() => navigate("/view-appointment")}
                        >
                            View Appoinments
                        </Button>

                    </div>



                </Container>
            </div>
        </div>
    );
};


export default HostDashboard;
