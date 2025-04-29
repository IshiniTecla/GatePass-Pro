import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Form, Container, Spinner } from "react-bootstrap";
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

const CheckinDetails = () => {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [checkins, setCheckins] = useState([]);
    const [filteredCheckins, setFilteredCheckins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const [userId, setUserId] = useState("");

    // ✅ Fetch logged-in user details
    // Inside useEffect for fetching check-ins:
    useEffect(() => {
        const fetchCheckins = async () => {
            if (!userId) return;  // Ensure userId is available

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

        fetchCheckins();
    }, [userId]);


    // ✅ Fetch check-ins once userId is available
    useEffect(() => {
        const fetchCheckins = async () => {
            if (!userId) return;

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

        fetchCheckins();
    }, [userId]);

    // Search/filter
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        const filtered = checkins.filter((checkin) =>
            checkin.fullName.toLowerCase().includes(e.target.value.toLowerCase()) ||
            checkin.email.toLowerCase().includes(e.target.value.toLowerCase()) ||
            checkin.phone.includes(e.target.value)
        );
        setFilteredCheckins(filtered);
    };

    // Delete
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

    // Edit
    const handleEdit = (checkInId) => {
        navigate(`/edit-checkin/${checkInId}`);
    };

    const styles = {
        container: {
            marginTop: "30px",
        },
        title: {
            textAlign: "center",
            fontSize: "2rem",
            color: "#333",
            marginBottom: "20px",
        },
        searchForm: {
            marginBottom: "20px",
        },
        searchInput: {
            fontSize: "1rem",
            padding: "10px",
            width: "100%",
            borderRadius: "5px",
            border: "1px solid #ccc",
        },
        table: {
            marginTop: "20px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        },
        tableHeader: {
            backgroundColor: "#f8f9fa",
            textAlign: "center",
            fontSize: "1rem",
        },
        tableRow: {
            textAlign: "center",
        },
        actionButton: {
            marginRight: "10px",
            padding: "8px 15px",
            fontSize: "0.9rem",
        },
        editButton: {
            backgroundColor: "#ffc107",
            color: "#fff",
            border: "none",
            cursor: "pointer",
        },
        deleteButton: {
            backgroundColor: "#dc3545",
            color: "#fff",
            border: "none",
            cursor: "pointer",
        },
    };

    return (
        <Container style={styles.container}>
            <h2 style={styles.title}>Check-in Details</h2>
            <Form style={styles.searchForm}>
                <Form.Group controlId="search">
                    <Form.Label>Search Check-ins</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Search by name, email, or phone"
                        value={search}
                        onChange={handleSearchChange}
                        style={styles.searchInput}
                    />
                </Form.Group>
            </Form>

            {loading ? (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" />
                </div>
            ) : (
                <Table striped bordered hover responsive style={styles.table}>
                    <thead style={styles.tableHeader}>
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
                            <tr key={checkin._id} style={styles.tableRow}>
                                <td>{checkin.fullName}</td>
                                <td>{checkin.email}</td>
                                <td>{checkin.phone}</td>
                                <td>{new Date(checkin.checkInTime).toLocaleString()}</td>
                                <td>{checkin.responsiblePerson}</td>
                                <td>{checkin.visitPurpose}</td>
                                <td>
                                    <Button
                                        style={{ ...styles.actionButton, ...styles.editButton }}
                                        onClick={() => handleEdit(checkin._id)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        style={{ ...styles.actionButton, ...styles.deleteButton }}
                                        onClick={() => handleDelete(checkin._id)}
                                    >
                                        Delete
                                    </Button>
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
