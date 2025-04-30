import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Form, Container, Spinner, InputGroup, FormControl } from "react-bootstrap";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const CheckinDetails = () => {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [checkins, setCheckins] = useState([]);
    const [filteredCheckins, setFilteredCheckins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchCheckins = async () => {
            setLoading(true);
            try {
                const response = await axios.get("http://localhost:5000/api/checkin/all");
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
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);
        const filtered = checkins.filter((checkin) =>
            checkin.visitorName.toLowerCase().includes(value) ||
            checkin.email.toLowerCase().includes(value) ||
            checkin.contactNumber.includes(value)
        );
        setFilteredCheckins(filtered);
    };

    const handleDelete = async (checkInId) => {
        try {
            await axios.delete(`http://localhost:5000/api/checkin/${checkInId}`);
            enqueueSnackbar("Check-in deleted successfully", { variant: "success" });
            setFilteredCheckins(filteredCheckins.filter((c) => c._id !== checkInId));
        } catch (error) {
            console.error("Error deleting check-in:", error);
            enqueueSnackbar("Failed to delete check-in", { variant: "error" });
        }
    };

    const handleEdit = (checkInId) => {
        navigate(`/edit-checkin/${checkInId}`);
    };

    const handleGenerateBadge = (checkInId) => {
        navigate(`/generate-badge/${checkInId}`);
    };

    const styles = {
        container: { marginTop: "30px" },
        title: {
            textAlign: "center",
            fontSize: "2rem",
            color: "#333",
            marginBottom: "20px",
        },
        searchForm: { marginBottom: "20px" },
        searchInputGroup: {
            width: "100%",
            marginBottom: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            borderRadius: "6px",
            overflow: "hidden",
        },
        searchInput: {
            fontSize: "1rem",
            padding: "10px",
            border: "1px solid #ccc",
            borderLeft: "none",
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
        tableRow: { textAlign: "center" },
        actionButton: {
            marginRight: "8px",
            padding: "6px 12px",
            fontSize: "0.85rem",
            border: "none",
            borderRadius: "4px",
        },
        editButton: {
            backgroundColor: "#ffc107",
            color: "#fff",
        },
        deleteButton: {
            backgroundColor: "#dc3545",
            color: "#fff",
        },
        badgeButton: {
            backgroundColor: "#0d6efd",
            color: "#fff",
        },
    };

    return (
        <Container style={styles.container}>
            <h2 style={styles.title}>My Visit Logs</h2>
            <Form style={styles.searchForm}>
                <InputGroup style={styles.searchInputGroup}>
                    <InputGroup.Text><FaSearch /></InputGroup.Text>
                    <FormControl
                        type="text"
                        placeholder="Search by name, email, or phone"
                        value={search}
                        onChange={handleSearchChange}
                        style={styles.searchInput}
                    />
                </InputGroup>
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
                            <th>Visit Purpose</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCheckins.map((checkin) => (
                            <tr key={checkin._id} style={styles.tableRow}>
                                <td>{checkin.visitorName}</td>
                                <td>{checkin.email}</td>
                                <td>{checkin.contactNumber}</td>
                                <td>{new Date(checkin.checkInTime).toLocaleString()}</td>
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
                                    <Button
                                        style={{ ...styles.actionButton, ...styles.badgeButton }}
                                        onClick={() => handleGenerateBadge(checkin._id)}
                                    >
                                        Generate Badge
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
