import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { Camera } from "lucide-react"; // Using Camera icon like your other part

const FaceScannerCheckIn = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [photoTaken, setPhotoTaken] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [capturing, setCapturing] = useState(false);

    useEffect(() => {
        startCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
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
        context.drawImage(videoRef.current, 0, 0, 320, 240);

        const dataUrl = canvasRef.current.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        setTimeout(() => {
            setPhotoTaken(true);
            setCapturing(false);
        }, 1500); // simulate small delay for scanning animation
    };

    const savePhoto = async () => {
        const checkInTime = new Date().toISOString();
        try {
            const response = await axios.post("http://localhost:5000/api/save-face-photo", {
                photo: capturedImage,
                checkInTime,
            });
            if (response.status === 201) {
                alert("Face photo saved successfully! Check-In completed.");
                setPhotoTaken(false);
                setCapturedImage(null);
            } else {
                throw new Error("Failed to save face photo");
            }
        } catch (error) {
            console.error("Error saving face photo:", error);
            alert(error.response?.data?.message || "Error during face check-in");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.iconBox}>
                        <Camera size={32} style={styles.icon} />
                    </div>
                    <div>
                        <h2 style={styles.title}>Face Scanner Check-In</h2>
                        <p style={styles.subtitle}>Scan your face to securely complete your Check-In process.</p>
                    </div>
                </div>

                <div style={styles.body}>
                    {/* Camera or captured image */}
                    {!photoTaken ? (
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
                            <p style={styles.instructions}>Position your face in the frame and click "Capture" to scan.</p>
                            <button style={styles.captureButton} onClick={capturePhoto} disabled={capturing}>
                                {capturing ? "Capturing..." : "Capture Face"}
                            </button>
                        </div>
                    ) : (
                        <div style={styles.cameraSection}>
                            <img src={capturedImage} alt="Captured Face" style={styles.video} />
                            <p style={styles.instructions}>Face captured successfully. Save your Check-In or retake the photo.</p>
                            <div style={styles.buttonGroup}>
                                <button style={styles.saveButton} onClick={savePhoto}>
                                    Save & Check-In
                                </button>
                                <button
                                    style={styles.cancelButton}
                                    onClick={() => {
                                        setPhotoTaken(false);
                                        setCapturedImage(null);
                                    }}
                                >
                                    Retake Photo
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Hidden canvas */}
                    <canvas ref={canvasRef} width="320" height="240" style={{ display: "none" }} />
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        padding: "40px 20px",
        backgroundColor: "#f5f6fa",
        minHeight: "100vh",
    },
    card: {
        width: "400px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
    },
    header: {
        display: "flex",
        alignItems: "center",
        marginBottom: "20px",
    },
    iconBox: {
        width: "50px",
        height: "50px",
        backgroundColor: "#e0f7fa",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginRight: "12px",
    },
    icon: {
        color: "#00796b",
    },
    title: {
        fontSize: "24px",
        margin: "0",
        color: "#333",
    },
    subtitle: {
        fontSize: "14px",
        color: "#666",
        marginTop: "4px",
    },
    body: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    cameraSection: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    cameraPlaceholder: {
        width: "320px",
        height: "240px",
        backgroundColor: "#000",
        borderRadius: "8px",
        border: "2px solid #ccc",
        marginBottom: "15px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
    },
    video: {
        width: "320px",
        height: "240px",
        objectFit: "cover",
        borderRadius: "8px",
    },
    scanningBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    scanningAnimation: {
        width: "50px",
        height: "50px",
        border: "4px solid #00bcd4",
        borderTop: "4px solid transparent",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "10px",
    },
    scanningText: {
        color: "#00bcd4",
        fontSize: "16px",
    },
    instructions: {
        fontSize: "14px",
        color: "#555",
        margin: "10px 0",
        textAlign: "center",
    },
    captureButton: {
        backgroundColor: "#4caf50",
        color: "#fff",
        border: "none",
        padding: "10px 20px",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer",
        marginTop: "10px",
    },
    saveButton: {
        backgroundColor: "#4caf50",
        color: "#fff",
        border: "none",
        padding: "10px 20px",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer",
        marginTop: "10px",
        marginRight: "10px",
    },
    cancelButton: {
        backgroundColor: "#f44336",
        color: "#fff",
        border: "none",
        padding: "10px 20px",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer",
        marginTop: "10px",
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "center",
    },
};

export default FaceScannerCheckIn;
