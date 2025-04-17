import React from "react";
import { useNavigate } from "react-router-dom";

const ThankYou = () => {
    const navigate = useNavigate();

    const styles = {
        container: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            background: "linear-gradient(to right, #fceabb, #f8b500)",
            flexDirection: "column",
            textAlign: "center",
            padding: "20px",
        },
        card: {
            backgroundColor: "#fff",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
            maxWidth: "600px",
        },
        emoji: {
            fontSize: "60px",
            marginBottom: "20px",
        },
        title: {
            fontSize: "28px",
            fontWeight: "600",
            color: "#333",
            marginBottom: "10px",
        },
        message: {
            fontSize: "18px",
            color: "#555",
            marginBottom: "30px",
        },
        button: {
            padding: "10px 25px",
            fontSize: "16px",
            fontWeight: "600",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "#007bff",
            color: "#fff",
            cursor: "pointer",
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.emoji}>🥳</div>
                <h2 style={styles.title}>Thank you for your feedback!</h2>
                <p style={styles.message}>
                    We really appreciate you taking the time to share your experience with us.
                </p>
                <button style={styles.button} onClick={() => navigate("/")}>
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default ThankYou;
