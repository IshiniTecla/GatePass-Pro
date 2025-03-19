import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container } from "react-bootstrap";

const ManualCheckIn = () => {
    const [visitorName, setVisitorName] = useState("");
    const [email, setEmail] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [checkInTime, setCheckInTime] = useState("");
    const [message, setMessage] = useState("");

    const handleCheckIn = async (e) => {
        e.preventDefault();

        const checkInData = {
            visitorName,
            email,
            contactNumber,
            checkInTime: new Date(checkInTime).toISOString(),
            photo: null // No photo for manual check-in
        };

        try {
            await axios.post("http://localhost:5000/visitor/checkin", checkInData);
            setMessage("Check-in successful!");
            // Clear form
            setVisitorName("");
            setEmail("");
            setContactNumber("");
            setCheckInTime("");
        } catch (error) {
            console.error("Error during manual check-in:", error);
            setMessage("Failed to check in. Please try again.");
        }
    };

    return (
        <Container style={{ maxWidth: "500px", marginTop: "50px" }}>
            <h2>Manual Visitor Check-In</h2>
            {message && <p>{message}</p>}
            <Form onSubmit={handleCheckIn}>
                <Form.Group controlId="visitorName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="contactNumber">
                    <Form.Label>Contact Number</Form.Label>
                    <Form.Control
                        type="tel"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="checkInTime">
                    <Form.Label>Check-In Time</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        value={checkInTime}
                        onChange={(e) => setCheckInTime(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit" style={{ marginTop: "20px" }}>
                    Check In
                </Button>
            </Form>
        </Container>
    );
};

export default ManualCheckIn;
