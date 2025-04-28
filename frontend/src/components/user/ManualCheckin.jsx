import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Container, Spinner } from "react-bootstrap";
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import html2canvas from "html2canvas";
import ReactDOM from "react-dom";


const ManualCheckIn = () => {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [visitorName, setVisitorName] = useState("");
    const [email, setEmail] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [checkInTime, setCheckInTime] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    // Inline styles
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
        message: {
            textAlign: 'center',
            color: '#007bff',
            marginBottom: '15px',
            fontWeight: '500',
        },
        responsiveCard: {
            padding: '20px',
        },
    };

    const sendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:5000/api/checkin/send-otp", {
                email,
            });

            console.log("OTP Sent:", response.data);
            enqueueSnackbar("OTP sent to your email.", {
                variant: 'success',
                autoHideDuration: 2000,
            });
            setOtpSent(true);
        } catch (error) {
            console.error("Error sending OTP:", error);
            enqueueSnackbar("Failed to send OTP. Please try again.", {
                variant: 'error',
                autoHideDuration: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    const verifyOtpAndCheckIn = async () => {
        setLoading(true);

        try {
            const requestData = {
                visitorName,
                email,
                contactNumber,
                checkInTime,
                otp: otp.toString(),
            };

            const response = await axios.post("http://localhost:5000/api/checkin/verify-otp", requestData);
            const visitorData = response.data;

            enqueueSnackbar("Check-in successful!", { variant: 'success', autoHideDuration: 2000 });

            // Create a temporary div to render badge
            const tempDiv = document.createElement("div");
            document.body.appendChild(tempDiv);

            ReactDOM.render(<Badge visitor={visitorData} ref={tempDiv} />, tempDiv);

            await html2canvas(tempDiv).then(canvas => {
                const link = document.createElement("a");
                link.download = `${visitorData.visitorName}_badge.png`;
                link.href = canvas.toDataURL();
                link.click();
            });

            document.body.removeChild(tempDiv);

            navigate("/dashboard");
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
                const token = localStorage.getItem("token"); // Assuming you stored token after login

                const response = await axios.get("http://localhost:5000/api/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const user = response.data;

                setVisitorName(`${user.firstName} ${user.lastName}`); // Combine first and last name
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
                <h2 style={styles.heading}>Manual Check-In</h2>

                <Form onSubmit={otpSent ? verifyOtpAndCheckIn : sendOtp}>
                    <Form.Group controlId="visitorName" style={styles.formGroup}>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={visitorName}
                            onChange={(e) => setVisitorName(e.target.value)}
                            required
                            style={styles.formControl}
                        />
                    </Form.Group>

                    <Form.Group controlId="email" style={styles.formGroup}>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.formControl}
                        />
                    </Form.Group>

                    <Form.Group controlId="contactNumber" style={styles.formGroup}>
                        <Form.Label>Contact Number</Form.Label>
                        <Form.Control
                            type="tel"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
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

                    {otpSent && (
                        <>
                            <Form.Group controlId="otp" style={styles.formGroup}>
                                <Form.Label>Enter OTP</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    style={styles.formControl}
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" style={styles.button} disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : "Verify & Check In"}
                            </Button>
                        </>
                    )}

                    {!otpSent && (
                        <Button variant="secondary" type="submit" style={styles.button} disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : "Send OTP"}
                        </Button>
                    )}
                </Form>
            </div>
        </Container>
    );
};

export default ManualCheckIn;
