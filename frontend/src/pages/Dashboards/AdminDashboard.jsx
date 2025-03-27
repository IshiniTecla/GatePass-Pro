import React, { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./VisitorDashboard.css";
import Sidebar from "../../components/SideNav";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [visitors, setVisitors] = useState([]);

    useEffect(() => {
        fetchVisitors();
    }, []);

    const fetchVisitors = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/visitor/all");
            console.log("Visitors Data:", response.data); // Debug: Inspect API response
            setVisitors(response.data);
        } catch (error) {
            console.error("Error fetching visitors:", error);
        }
    };


    const verifyVisitor = async (visitorId) => {
        try {
            await axios.patch(`http://localhost:5000/api/visitor/admin-verify/${visitorId}`);
            alert("Visitor approved successfully!");
            fetchVisitors(); // Refresh the list
        } catch (error) {
            console.error("Error verifying visitor:", error);
        }
    };

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
                            onClick={() => navigate("/")}
                        >
                            Check-In/Out Using Biometrics
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => navigate("/")}
                        >
                            Check-In/Out Manually
                        </Button>
                    </div>

                    {/* Manage Registered Visitors */}
                    <div className="dashboard-tab">
                        <h4>Manage Registered Visitors</h4>
                        <Button
                            variant="primary"
                            className="me-2"
                            onClick={() => navigate("/manage-visitors")}
                        >
                            Manage
                        </Button>
                    </div>

                    {/* Visitor Verification Tab */}
                    <div className="dashboard-tab">
                        <h4>Visitor Verification</h4>
                        {visitors.length === 0 ? (
                            <p>No visitors found.</p>
                        ) : (
                            <table border="1" className="visitor-table">
                                <thead>
                                    <tr>
                                        <th>Visitor Name</th>
                                        <th>Email</th>
                                        <th>Contact</th>
                                        <th>Check-In Time</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visitors.map((visitor) => (
                                        <tr key={visitor._id}>
                                            <td>{visitor.visitorName ? visitor.visitorName : "N/A"}</td>
                                            <td>{visitor.email ? visitor.email : "N/A"}</td>
                                            <td>{visitor.contactNumber ? visitor.contactNumber : "N/A"}</td>
                                            <td>{visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleString() : "N/A"}</td>
                                            <td>{visitor.isVerified ? "Approved" : "Pending"}</td>
                                            <td>
                                                {!visitor.isVerified && (
                                                    <Button
                                                        variant="success"
                                                        onClick={() => verifyVisitor(visitor._id)}
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        )}
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default AdminDashboard;
