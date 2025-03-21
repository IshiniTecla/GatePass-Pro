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

    // **Send OTP to the visitor's email**
    const sendOtp = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:5000/api/visitor/send-otp", {
                email,
            });

            console.log("OTP Sent:", response.data);
            setMessage("OTP sent to your email.");
            setOtpSent(true); // Enable OTP input field
        } catch (error) {
            console.error("Error sending OTP:", error);
            setMessage("Failed to send OTP. Please try again.");
        }
    };

    // **Verify OTP & Check-In**
    const verifyOtpAndCheckIn = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:5000/api/visitor/verify-otp", {
                visitorName,
                email,
                contactNumber,
                checkInTime: new Date(checkInTime).toISOString(),
                otp,
            });

            console.log("Check-In Successful:", response.data);
            setMessage("Check-in successful! Waiting for admin verification.");

            // Reset form after successful check-in
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

            <Form onSubmit={otpSent ? verifyOtpAndCheckIn : sendOtp}>
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

                {/* OTP Section */}
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

                {!otpSent && (
                    <Button variant="secondary" type="submit" style={{ marginTop: "20px" }}>
                        Send OTP
                    </Button>
                )}
            </Form>
        </Container>
    );
};

export default ManualCheckIn;
