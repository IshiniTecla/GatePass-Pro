import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFeedbackById, updateFeedback } from "../services/feedbackService";
import { useSnackbar } from "notistack";
import { Spinner } from 'react-bootstrap'; // Import Spinner

const EditFeedback = () => {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        visitorName: "",
        email: "",
        rating: 1,
        comments: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const feedbackData = await getFeedbackById(id);
            setFormData(feedbackData);
        } catch (error) {
            console.error("Error fetching feedback:", error);
            enqueueSnackbar("Failed to load feedback.", { variant: "error" });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateFeedback(id, formData);
            enqueueSnackbar("Feedback updated successfully!", { variant: "success" });
            navigate("/feedback-list");
        } catch (error) {
            console.error("Error updating feedback:", error);
            enqueueSnackbar("Failed to update feedback.", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Inline styles
    const styles = {
        feedbackFormContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
        },
        feedbackCard: {
            width: '100%',
            maxWidth: '500px',
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
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
        formSelect: {
            borderRadius: '4px',
        },
        submitButton: {
            width: '100%',
            marginTop: '20px',
        },
    };

    return (
        <div style={styles.feedbackFormContainer}>
            <div style={styles.feedbackCard}>
                <h2 style={styles.heading}>Edit Feedback</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label className="form-label">Visitor Name:</label>
                        <input
                            type="text"
                            className="form-control"
                            name="visitorName"
                            value={formData.visitorName}
                            onChange={handleChange}
                            required
                            style={styles.formControl}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label className="form-label">Email:</label>
                        <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={styles.formControl}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label className="form-label">Rating:</label>
                        <select
                            className="form-select"
                            name="rating"
                            value={formData.rating}
                            onChange={handleChange}
                            style={styles.formSelect}
                        >
                            {[1, 2, 3, 4, 5].map((num) => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={styles.formGroup}>
                        <label className="form-label">Comments:</label>
                        <textarea
                            className="form-control"
                            name="comments"
                            rows="4"
                            value={formData.comments}
                            onChange={handleChange}
                            required
                            style={styles.formControl}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={styles.submitButton}>
                        {loading ? "Updating..." : "Update Feedback"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditFeedback;
