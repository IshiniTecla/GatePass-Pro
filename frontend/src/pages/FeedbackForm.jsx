import React, { useState } from "react";
import { submitFeedback } from "../services/feedbackService";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from 'notistack';
import "./FeedbackForm.css";

const FeedbackForm = () => {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        visitorName: "",
        email: "",
        rating: 1,
        comments: "",
    });
    const [loading, setLoading] = useState(false); // Loading state

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true when submitting
        try {
            await submitFeedback(formData);

            enqueueSnackbar("Feedback submitted successfully!", {
                variant: 'success',
                autoHideDuration: 2000, // Snackbar disappears after 2 seconds
            });

            setLoading(false);

            navigate("/feedback-list", { state: { submitted: true } }); // Redirect to FeedbackList
        } catch (error) {
            console.error("Error submitting feedback:", error);

            enqueueSnackbar("Failed to submit feedback. Please try again.", {
                variant: 'error',
                autoHideDuration: 2000,
            });

            setLoading(false); // Reset loading state on error
        }
    };

    return (
        <div className="feedback-form-container">
            <div className="feedback-card">
                <h2 className="text-center mb-4">Submit Your Feedback</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Visitor Name:</label>
                        <input
                            type="text"
                            className="form-control"
                            name="visitorName"
                            value={formData.visitorName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email:</label>
                        <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Rating:</label>
                        <select
                            className="form-select"
                            name="rating"
                            value={formData.rating}
                            onChange={handleChange}
                        >
                            {[1, 2, 3, 4, 5].map((num) => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Comments:</label>
                        <textarea
                            className="form-control"
                            name="comments"
                            rows="3"
                            value={formData.comments}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Feedback"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;
