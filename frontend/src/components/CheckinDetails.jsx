import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Form, Container, Spinner } from "react-bootstrap";
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import * as jwt_decode from 'jwt-decode';

// To decode JWT token

const CheckinDetails = () => {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [checkins, setCheckins] = useState([]);
    const [filteredCheckins, setFilteredCheckins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token"); // Fetch token from localStorage (or cookies/sessionStorage)

        if (token) {
            try {
                // Decode the token to get user info (including userId)
                const decodedToken = jwt_decode(token);
                const userId = decodedToken._id;  // Assuming _id is stored in the token

                // Now fetch check-ins using the decoded userId
                fetchCheckins(userId);
            } catch (error) {
                console.error("Error decoding token:", error);
                enqueueSnackbar("Failed to decode token", { variant: "error" });
            }
        } else {
            enqueueSnackbar("No authentication token found, please log in", { variant: "warning" });
            navigate("/login"); // Redirect to login if no token
        }
    }, [navigate, enqueueSnackbar]);

    // Function to fetch check-ins using the userId
    const fetchCheckins = async (userId) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/checkin/users/${userId}`);
            setCheckins(response.data);
            setFilteredCheckins(response.data);
        } catch (error) {
            console.error("Error fetching check-ins:", error);
            enqueueSnackbar("Failed to load check-ins", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Search filter function
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        const filtered = checkins.filter((checkin) =>
            checkin.fullName.toLowerCase().includes(e.target.value.toLowerCase()) ||
            checkin.email.toLowerCase().includes(e.target.value.toLowerCase()) ||
            checkin.phone.includes(e.target.value)
        );
        setFilteredCheckins(filtered);
    };

    const handleDelete = async (checkInId) => {
        try {
            await axios.delete(`http://localhost:5000/api/checkin/${checkInId}`);
            enqueueSnackbar("Check-in deleted successfully", { variant: "success" });
            setFilteredCheckins(filteredCheckins.filter((checkin) => checkin._id !== checkInId));
        } catch (error) {
            console.error("Error deleting check-in:", error);
            enqueueSnackbar("Failed to delete check-in", { variant: "error" });
        }
    };

    const handleEdit = (checkInId) => {
        navigate(`/edit-checkin/${checkInId}`);
    };

    return (
        <Container>
            <h2>Check-in Details</h2>
            <Form>
                <Form.Group controlId="search">
                    <Form.Label>Search Check-ins</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Search by name, email, or phone"
                        value={search}
                        onChange={handleSearchChange}
                    />
                </Form.Group>
            </Form>

            {loading ? (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" />
                </div>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Check-In Time</th>
                            <th>Responsible Person</th>
                            <th>Visit Purpose</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCheckins.map((checkin) => (
                            <tr key={checkin._id}>
                                <td>{checkin.fullName}</td>
                                <td>{checkin.email}</td>
                                <td>{checkin.phone}</td>
                                <td>{new Date(checkin.checkInTime).toLocaleString()}</td>
                                <td>{checkin.responsiblePerson}</td>
                                <td>{checkin.visitPurpose}</td>
                                <td>
                                    <Button onClick={() => handleEdit(checkin._id)}>Edit</Button>
                                    <Button onClick={() => handleDelete(checkin._id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default CheckinDetails;
