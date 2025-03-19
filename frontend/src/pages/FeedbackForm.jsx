import React, { useState } from "react";
import { submitFeedback } from "../services/feedbackService";
import { useNavigate } from "react-router-dom";
import "../styles/FeedbackForm.css";


const FeedbackForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        visitorName: "",
        email: "",
        rating: 1,
        comments: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await submitFeedback(formData);
        alert("Feedback submitted successfully!");
        navigate("/feedback-list");
    };

    return (
        <div className="container mt-5">
            <div className="card shadow p-4">
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
                    <button type="submit" className="btn btn-primary w-100">
                        Submit Feedback
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;
