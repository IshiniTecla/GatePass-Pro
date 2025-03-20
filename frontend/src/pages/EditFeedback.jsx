import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFeedbackById, updateFeedback } from "../services/feedbackService";
import { useSnackbar } from "notistack";
import "./FeedbackForm.css";

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

    return (
        <div className="feedback-form-container">
            <div className="feedback-card">
                <h2 className="text-center mb-4">Edit Feedback</h2>
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
                            rows="4"
                            value={formData.comments}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? "Updating..." : "Update Feedback"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditFeedback;
