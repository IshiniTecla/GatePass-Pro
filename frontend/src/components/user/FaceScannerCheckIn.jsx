import React, { useRef, useEffect, useState } from "react";
import * as blazeface from "@tensorflow-models/blazeface";
import axios from "axios"; // Assuming axios is used for API requests

const FaceRecognition = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFaceDetected, setIsFaceDetected] = useState(false);

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

        const checkInTime = new Date().toISOString(); // ISO format for consistency
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
        </div>
    );
};

export default FaceRecognition;
