import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { Camera } from "lucide-react";
import { useSnackbar } from 'notistack';

const FaceScannerCheckIn = () => {
    const { enqueueSnackbar } = useSnackbar();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [photoTaken, setPhotoTaken] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [capturing, setCapturing] = useState(false);
    const [showOtpFallback, setShowOtpFallback] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        startCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } });
            videoRef.current.srcObject = stream;
        } catch (err) {
            console.error("Error accessing webcam:", err);
            alert("Cannot access camera. Please allow permissions.");
        }
    };

    const capturePhoto = () => {
        if (!canvasRef.current || !videoRef.current) return;
        setCapturing(true);
        const context = canvasRef.current.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, 480, 360);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        setTimeout(() => {
            setPhotoTaken(true);
            setCapturing(false);
        }, 1500);
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
                setEmail(user.email);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };
        fetchUserData();
    }, []);

    const savePhoto = async () => {
        const checkInTime = new Date().toISOString();
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post("http://localhost:5000/api/attendance/check-in", {
                method: "face",
                photo: capturedImage,
                checkInTime,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                alert("Face check-in successful!");
                resetCamera();
            } else {
                throw new Error("Failed to check in with face");
            }
        } catch (error) {
            console.error("Error during face check-in:", error);
            alert(error.response?.data?.message || "Error during face check-in");
        }
    };

    const resetCamera = () => {
        setPhotoTaken(false);
        setCapturedImage(null);
        setCapturing(false);
        startCamera();
    };

    const sendOtp = async () => {
        if (!email) {
            alert("Please enter your email address.");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/api/send-otp", { email });
            if (response.status === 200) {
                setOtpSent(true);
                alert("OTP sent to your email. Please check your inbox.");
            } else {
                alert("Failed to send OTP. Please try again.");
            }
        } catch (error) {
            console.error("Send OTP Error:", error);
            alert(error.response?.data?.message || "Error sending OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async () => {
        if (!otp) {
            alert("Please enter the OTP.");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post("http://localhost:5000/api/attendance/check-in", {
                method: "otp",
                email,
                otp,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                alert("OTP Verified! Check-In completed.");
                setOtp("");
                setEmail("");
                setOtpSent(false);
                setShowOtpFallback(false);
            } else {
                alert("Invalid OTP. Please try again.");
            }
        } catch (error) {
            console.error("OTP Verification Error:", error);
            alert(error.response?.data?.message || "Error verifying OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.iconBox}>
                        <Camera size={36} style={styles.icon} />
                    </div>
                    <div>
                        <h2 style={styles.title}>Face Scanner Check-In</h2>
                        <p style={styles.subtitle}>Secure your Check-In by scanning your face or fallback to OTP.</p>
                    </div>
                </div>

                <div style={styles.body}>
                    {!showOtpFallback ? (
                        !photoTaken ? (
                            <div style={styles.cameraSection}>
                                <div style={styles.cameraPlaceholder}>
                                    {capturing ? (
                                        <div style={styles.scanningBox}>
                                            <div style={styles.scanningAnimation}></div>
                                            <p style={styles.scanningText}>Scanning face...</p>
                                        </div>
                                    ) : (
                                        <video ref={videoRef} autoPlay muted style={styles.video} />
                                    )}
                                </div>
                                <p style={styles.instructions}>Align your face inside the frame and click Capture.</p>
                                <div style={styles.buttonGroup}>
                                    <button style={styles.captureButton} onClick={capturePhoto} disabled={capturing}>
                                        {capturing ? "Capturing..." : "Capture Face"}
                                    </button>
                                    <button style={styles.fallbackButton} onClick={() => setShowOtpFallback(true)}>
                                        Face Not Working? Use OTP
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={styles.cameraSection}>
                                <img src={capturedImage} alt="Captured Face" style={styles.video} />
                                <p style={styles.instructions}>Face captured successfully. Save or retake photo.</p>
                                <div style={styles.buttonGroup}>
                                    <button style={styles.saveButton} onClick={savePhoto}>Save & Check-In</button>
                                    <button style={styles.cancelButton} onClick={resetCamera}>Retake Photo</button>
                                </div>
                                <button style={styles.fallbackButton} onClick={() => setShowOtpFallback(true)}>
                                    Face Not Working? Use OTP
                                </button>
                            </div>
                        )
                    ) : (
                        <div style={styles.cameraSection}>
                            {!otpSent ? (
                                <>
                                    <h3 style={{ marginBottom: "20px", color: "#333" }}>Request OTP</h3>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        style={styles.otpInput}
                                    />
                                    <div style={styles.buttonGroup}>
                                        <button style={styles.saveButton} onClick={sendOtp} disabled={loading}>
                                            {loading ? "Sending..." : "Send OTP"}
                                        </button>
                                        <button style={styles.cancelButton} onClick={() => { setShowOtpFallback(false); setEmail(""); }} >
                                            Back to Face Scan
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 style={{ marginBottom: "20px", color: "#333" }}>Verify OTP</h3>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter OTP"
                                        style={styles.otpInput}
                                    />
                                    <div style={styles.buttonGroup}>
                                        <button style={styles.saveButton} onClick={handleOtpSubmit} disabled={loading}>
                                            {loading ? "Verifying..." : "Verify OTP"}
                                        </button>
                                        <button style={styles.cancelButton} onClick={() => { setOtpSent(false); setOtp(""); }} >
                                            Re-enter Email
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    <canvas ref={canvasRef} width="480" height="360" style={{ display: "none" }} />
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f6fa",
        padding: "50px 20px",
        minHeight: "100vh",
    },
    card: {
        width: "550px",
        backgroundColor: "#fff",
        borderRadius: "16px",
        boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
    },
    header: {
        display: "flex",
        alignItems: "center",
        padding: "20px",
    },
    iconBox: {
        marginRight: "15px",
    },
    icon: {
        color: "#007bff",
    },
    title: {
        fontSize: "24px",
        margin: 0,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: "14px",
        color: "#888",
    },
    body: {
        padding: "20px",
    },
    cameraSection: {
        textAlign: "center",
    },
    cameraPlaceholder: {
        position: "relative",
        display: "inline-block",
    },
    scanningBox: {
        display: "inline-block",
        width: "480px",
        height: "360px",
        backgroundColor: "#f0f0f0",
        position: "relative",
        textAlign: "center",
    },
    scanningAnimation: {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "50px",
        height: "50px",
        backgroundColor: "transparent",
        borderRadius: "50%",
        border: "4px solid #007bff",
        animation: "scanning 1s linear infinite",
    },
    scanningText: {
        position: "absolute",
        top: "70%",
        width: "100%",
        textAlign: "center",
        color: "#007bff",
        fontSize: "18px",
    },
    video: {
        width: "100%",
        height: "auto",
        borderRadius: "8px",
    },
    instructions: {
        fontSize: "16px",
        marginTop: "10px",
        color: "#555",
    },
    buttonGroup: {
        marginTop: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        alignItems: "center",
    },
    captureButton: {
        backgroundColor: "#007bff",
        color: "#fff",
        padding: "10px 20px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        width: "200px",
    },
    fallbackButton: {
        backgroundColor: "#f0f0f0",
        color: "#007bff",
        padding: "10px 20px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
    },
    saveButton: {
        backgroundColor: "#28a745",
        color: "#fff",
        padding: "10px 20px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        width: "200px",
    },
    cancelButton: {
        backgroundColor: "#dc3545",
        color: "#fff",
        padding: "10px 20px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        width: "200px",
    },
    otpInput: {
        padding: "10px",
        fontSize: "16px",
        width: "80%",
        marginBottom: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
    },
};

export default FaceScannerCheckIn;
