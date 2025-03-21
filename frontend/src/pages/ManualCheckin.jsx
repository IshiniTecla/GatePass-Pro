import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container } from "react-bootstrap";
import "./ManualCheckIn.css";

const ManualCheckIn = () => {
    const [visitorName, setVisitorName] = useState("");
    const [email, setEmail] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [checkInTime, setCheckInTime] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [message, setMessage] = useState("");

    const sendOtp = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/send-otp", { email });
            alert("OTP sent to your email!");
            return response.data.otp; // For testing, remove this in production.
        } catch (error) {
            console.error("Error sending OTP:", error);
            alert("Failed to send OTP. Please try again.");
        }
    };


    const handleCheckIn = async (e) => {
        e.preventDefault();

        const checkInData = {
            visitorName,
            email,
            contactNumber,
            checkInTime: new Date(checkInTime).toISOString(),
            otp,
            photo: null // No photo for manual check-in
        };

        try {
            await axios.post("http://localhost:5000/visitor/checkin", checkInData);
            setMessage("Check-in successful! Waiting for admin verification.");
            // Clear form
            setVisitorName("");
            setEmail("");
            setContactNumber("");
            setCheckInTime("");
            setOtp("");
            setOtpSent(false);
        } catch (error) {
            console.error("Check-in Error:", error);
            setMessage("Check-in failed. Please check OTP or details.");
        }
    };

    return (
        <Container style={{ maxWidth: "500px", marginTop: "50px" }}>
            <h2>Manual Check-In</h2>
            {message && <p className="message">{message}</p>}
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

                {!otpSent && (
                    <Button onClick={sendOtp} variant="secondary" style={{ marginBottom: "20px" }}>
                        Send OTP
                    </Button>
                )}

                {otpSent && (
                    <>
                        <Form.Group controlId="otp">
                            <Form.Label>Enter OTP</Form.Label>
                            <Form.Control
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Verify & Check In
                        </Button>
                    </>
                )}
            </Form>
        </Container>
    );
};

export default ManualCheckIn;
