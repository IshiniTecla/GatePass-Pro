import React, { useRef, useEffect, useState } from "react";
import * as blazeface from "@tensorflow-models/blazeface";
import axios from "axios";

const FaceRecognition = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [faceUnlockEnabled, setFaceUnlockEnabled] = useState(false);
    const [showFaceSetup, setShowFaceSetup] = useState(false);
    const [faceCapturing, setFaceCapturing] = useState(false);
    const [faceSetupStep, setFaceSetupStep] = useState(1);

    useEffect(() => {
        const loadModelAndDetectFaces = async () => {
            const model = await blazeface.load();
            setIsLoading(false);
            detectFaces(model);
        };

        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        };

        const detectFaces = async (model) => {
            const ctx = canvasRef.current.getContext("2d");
            setInterval(async () => {
                if (!videoRef.current) return;

                const predictions = await model.estimateFaces(videoRef.current, false);
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                ctx.drawImage(
                    videoRef.current,
                    0,
                    0,
                    canvasRef.current.width,
                    canvasRef.current.height
                );

                if (predictions.length > 0) {
                    setIsFaceDetected(true);
                    predictions.forEach((pred) => {
                        const [x, y] = pred.topLeft;
                        const [x2, y2] = pred.bottomRight;
                        const width = x2 - x;
                        const height = y2 - y;

                        ctx.beginPath();
                        ctx.rect(x, y, width, height);
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = "red";
                        ctx.stroke();
                    });
                } else {
                    setIsFaceDetected(false);
                }
            }, 100);
        };

        startVideo();
        loadModelAndDetectFaces();
    }, []);

    const handleCheckInOut = async () => {
        if (!videoRef.current) return;

        const checkInTime = new Date().toISOString();
        const canvas = canvasRef.current;
        const photo = canvas.toDataURL("image/jpeg");

        const checkInData = { checkInTime, photo };

        try {
            const response = await axios.post("http://localhost:5000/visitor-checkin", checkInData);

            if (response.status === 201) {
                alert("Check-In successful!");
            } else {
                throw new Error("Unexpected response status: " + response.status);
            }
        } catch (error) {
            console.error("Check-In Error:", error);
            alert("Check-In failed. " + (error.response?.data?.message || error.message));
        }
    };

    const toggleFaceUnlock = () => {
        setFaceUnlockEnabled((prev) => !prev);
        if (!faceUnlockEnabled) {
            setShowFaceSetup(true);
        }
    };

    const startFaceCapture = () => {
        setFaceCapturing(true);
        setTimeout(() => {
            setFaceCapturing(false);
            setFaceSetupStep(2); // Move to setup completion step
        }, 3000); // Simulate the face capture for 3 seconds
    };

    const cancelFaceSetup = () => {
        setShowFaceSetup(false);
        setFaceSetupStep(1);
    };

    const completeFaceSetup = () => {
        setShowFaceSetup(false);
        alert("Face ID Setup Complete");
    };

    // Inline styles
    const styles = {
        container: {
            textAlign: "center",
            padding: "20px",
        },
        videoContainer: {
            position: "relative",
            width: "100%",
            maxWidth: "500px",
            margin: "auto",
        },
        video: {
            position: "absolute",
            width: "100%",
            height: "auto",
        },
        canvas: {
            position: "absolute",
            width: "100%",
            height: "auto",
        },
        button: {
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "16px",
            display: "block",
            margin: "auto",
        },
        settingsCard: {
            marginTop: "30px",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "10px",
        },
        faceSetupPanel: {
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
        },
        faceCameraPlaceholder: {
            margin: "20px 0",
        },
        cancelButton: {
            marginRight: "10px",
            padding: "10px 20px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
        },
        captureButton: {
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
        },
    };

    return (
        <div style={styles.container}>
            <h2>Visitor Face Recognition</h2>
            {isLoading && <p>Loading model...</p>}

            <div style={styles.videoContainer}>
                <video ref={videoRef} style={styles.video} />
                <canvas ref={canvasRef} style={styles.canvas} />
            </div>

            <button
                onClick={handleCheckInOut}
                disabled={!isFaceDetected}
                style={styles.button}
            >
                Check In / Check Out
            </button>

            {/* New Face Unlock Section */}
            <div style={styles.settingsCard}>
                <div>
                    <h2>Face Unlock</h2>
                    <p>Enable Face ID to securely sign in to your account without a password.</p>
                    <button
                        onClick={toggleFaceUnlock}
                        style={{
                            backgroundColor: faceUnlockEnabled ? "#ff5722" : "#4CAF50",
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: "5px",
                        }}
                    >
                        {faceUnlockEnabled ? "Disable Face Unlock" : "Enable Face Unlock"}
                    </button>
                </div>

                {showFaceSetup && (
                    <div style={styles.faceSetupPanel}>
                        {faceSetupStep === 1 && (
                            <div>
                                <h3>Face ID Setup</h3>
                                <div style={styles.faceCameraPlaceholder}>
                                    {faceCapturing ? (
                                        <div>Scanning face...</div>
                                    ) : (
                                        <div style={{ fontSize: "64px" }}>📸</div> // Replacing Camera icon with text
                                    )}
                                </div>
                                <p>Position your face in the frame and click "Capture" to scan your face.</p>
                                <div>
                                    <button
                                        onClick={cancelFaceSetup}
                                        style={styles.cancelButton}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={startFaceCapture}
                                        style={styles.captureButton}
                                        disabled={faceCapturing}
                                    >
                                        {faceCapturing ? "Capturing..." : "Capture"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {faceSetupStep === 2 && (
                            <div>
                                <h3>Face ID Captured</h3>
                                <p>Your face has been successfully captured</p>
                                <button
                                    onClick={completeFaceSetup}
                                    style={styles.captureButton}
                                >
                                    Complete Setup
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaceRecognition;
