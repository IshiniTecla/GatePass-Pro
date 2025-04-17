import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Spinner } from "react-bootstrap";
import { submitFeedback } from "../services/feedbackService";

const emojiRatings = [
    { value: 1, emoji: "😡", label: "Very Bad" },
    { value: 2, emoji: "😕", label: "Bad" },
    { value: 3, emoji: "😐", label: "Okay" },
    { value: 4, emoji: "😊", label: "Good" },
    { value: 5, emoji: "🤩", label: "Excellent" },
];

const FeedbackForm = () => {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        visitorName: "",
        email: "",
        rating: 3,
        comments: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRatingChange = (value) => {
        setFormData({ ...formData, rating: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await submitFeedback(formData);
            enqueueSnackbar("Feedback submitted successfully!", {
                variant: "success",
                autoHideDuration: 2000,
            });
            navigate("/thankyou", { state: { submitted: true } });
        } catch (error) {
            console.error("Error submitting feedback:", error);
            enqueueSnackbar("Failed to submit feedback. Please try again.", {
                variant: "error",
                autoHideDuration: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        wrapper: {
            padding: "30px",
            maxWidth: "700px",
            margin: "0 auto",
        },
        card: {
            background: "#ffffff",
            borderRadius: "8px",
            padding: "30px",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
        },
        title: {
            marginBottom: "25px",
            textAlign: "center",
            color: "#2d3748",
            fontWeight: "600",
        },
        formGroup: {
            marginBottom: "20px",
        },
        label: {
            fontWeight: "500",
            marginBottom: "8px",
            display: "block",
            color: "#333",
        },
        input: {
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "16px",
        },
        textarea: {
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "16px",
            resize: "vertical",
        },
        emojiRow: {
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
        },
        emojiBox: (isActive) => ({
            cursor: "pointer",
            fontSize: "28px",
            padding: "10px",
            borderRadius: "8px",
            border: isActive ? "2px solid #007bff" : "2px solid transparent",
            backgroundColor: isActive ? "#e9f5ff" : "transparent",
            transition: "0.3s",
        }),
        submitBtn: {
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            fontWeight: "600",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            marginTop: "10px",
        },
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.card}>
                <h3 style={styles.title}>We value your feedback</h3>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Your Name</label>
                        <input
                            type="text"
                            name="visitorName"
                            value={formData.visitorName}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>How was your experience?</label>
                        <div style={styles.emojiRow}>
                            {emojiRatings.map((item) => (
                                <div
                                    key={item.value}
                                    title={item.label}
                                    style={styles.emojiBox(formData.rating === item.value)}
                                    onClick={() => handleRatingChange(item.value)}
                                >
                                    {item.emoji}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Comments</label>
                        <textarea
                            name="comments"
                            rows="4"
                            value={formData.comments}
                            onChange={handleChange}
                            required
                            style={styles.textarea}
                        ></textarea>
                    </div>

                    <button type="submit" style={styles.submitBtn} disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Feedback"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;
