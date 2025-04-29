import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Container, Spinner } from "react-bootstrap";
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

const ManualCheckIn = () => {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [checkInTime, setCheckInTime] = useState("");
    const [responsiblePerson, setResponsiblePerson] = useState("");
    const [visitPurpose, setVisitPurpose] = useState("");
    const [loading, setLoading] = useState(false);

    const styles = {
        manualCheckInContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
        },
        manualCheckInCard: {
            width: '100%',
            maxWidth: '500px',
            background: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        heading: {
            textAlign: 'center',
            marginBottom: '20px',
            color: '#333',
        },
        formGroup: {
            marginBottom: '15px',
        },
        formControl: {
            borderRadius: '4px',
        },
        button: {
            width: '100%',
            marginTop: '15px',
        },
    };

    const handleCheckIn = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const requestData = {
                fullName,            // ✅ now matches backend
                email,
                phone,               // ✅ now matches backend
                visitPurpose,        // ✅ now matches backend
                responsiblePerson,   // ✅ now matches backend
                checkInTime,
            };
            const response = await axios.post("http://localhost:5000/api/checkin/manual", requestData);
            const visitorData = response.data;

            const checkInId = visitorData.visitorId; // ✅ updated to match backend response key

            // Badge logic removed as requested

            enqueueSnackbar("Check-in successful!", { variant: 'success', autoHideDuration: 2000 });
            navigate("/checkin-details");  // Navigate to the dashboard

        } catch (error) {
            console.error("Check-in Error:", error.response?.data || error.message);
            enqueueSnackbar("Check-in failed. Please try again.", {
                variant: 'error',
                autoHideDuration: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5000/api/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const user = response.data;
                setFullName(`${user.firstName} ${user.lastName}`);
                setEmail(user.email);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <Container style={styles.manualCheckInContainer}>
            <div style={styles.manualCheckInCard}>
                <h2 style={styles.heading}>Check-In</h2>

                <Form onSubmit={handleCheckIn}>
                    <Form.Group controlId="fullName" style={styles.formGroup}>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={fullName}
                            readOnly // ✅ makes the field uneditable
                            style={styles.formControl}
                        />
                    </Form.Group>

                    <Form.Group controlId="email" style={styles.formGroup}>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            readOnly // ✅ makes the field uneditable
                            style={styles.formControl}
                        />
                    </Form.Group>

                    <Form.Group controlId="phone" style={styles.formGroup}>
                        <Form.Label>Contact Number</Form.Label>
                        <Form.Control
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            style={styles.formControl}
                        />
                    </Form.Group>

                    <Form.Group controlId="checkInTime" style={styles.formGroup}>
                        <Form.Label>Check-In Time</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={checkInTime}
                            onChange={(e) => setCheckInTime(e.target.value)}
                            required
                            style={styles.formControl}
                        />
                    </Form.Group>

                    <Form.Group controlId="responsiblePerson" style={styles.formGroup}>
                        <Form.Label>Person You Visit</Form.Label>
                        <Form.Control
                            type="text"
                            value={responsiblePerson}
                            onChange={(e) => setResponsiblePerson(e.target.value)}
                            required
                            style={styles.formControl}
                        />
                    </Form.Group>

                    <Form.Group controlId="visitPurpose" style={styles.formGroup}>
                        <Form.Label>Purpose of Visit</Form.Label>
                        <Form.Control
                            type="text"
                            value={visitPurpose}
                            onChange={(e) => setVisitPurpose(e.target.value)}
                            required
                            style={styles.formControl}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" style={styles.button} disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : "Check In"}
                    </Button>
                </Form>
            </div>
        </Container>
    );
};

export default ManualCheckIn;
