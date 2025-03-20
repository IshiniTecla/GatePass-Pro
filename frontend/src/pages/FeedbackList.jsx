import React, { useEffect, useState } from "react";
import { getFeedbackList, deleteFeedback } from "../services/feedbackService";
import { Link, useLocation } from "react-router-dom";
import { Card, Button, Container } from "react-bootstrap";
import { useSnackbar } from "notistack";
import "./FeedbackList.css";

const FeedbackList = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [showThankYou, setShowThankYou] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const location = useLocation();

    useEffect(() => {
        fetchFeedbacks();

        if (location.state?.submitted) {
            setShowThankYou(true);
            setTimeout(() => setShowThankYou(false), 5000);
        }
    }, [location]);

    const fetchFeedbacks = async () => {
        try {
            const data = await getFeedbackList();
            setFeedbacks(data || []);
        } catch (error) {
            enqueueSnackbar("Error fetching feedbacks.", { variant: "error" });
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteFeedback(id);
            enqueueSnackbar("Feedback deleted successfully.", { variant: "success" });
            fetchFeedbacks();
        } catch (error) {
            enqueueSnackbar("Error deleting feedback.", { variant: "error" });
        }
    };

    const handleEdit = (id) => {
        enqueueSnackbar("Redirecting to edit feedback...", { variant: "info" });
    };

    return (
        <Container className="feedback-list-container">
            <h2 className="text-center mt-4 mb-3">Visitor Feedback</h2>

            {showThankYou && (
                <div className="thank-you-message">
                    <h3>Thank you for your feedback!<span>😊</span></h3>
                </div>
            )}

            {feedbacks.length > 0 ? (
                feedbacks.map((feedback) => (
                    <Card key={feedback._id} className="mb-3 feedback-card">
                        <Card.Body>
                            <Card.Title>{feedback.visitorName}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">{feedback.email}</Card.Subtitle>
                            <Card.Text>
                                <strong>Rating:</strong> {feedback.rating} <br />
                                <strong>Comments:</strong> {feedback.comments}
                            </Card.Text>
                            <Link to={`/edit-feedback/${feedback._id}`}>
                                <Button variant="warning" onClick={() => handleEdit(feedback._id)} className="me-2">
                                    Edit
                                </Button>
                            </Link>
                            <Button variant="danger" onClick={() => handleDelete(feedback._id)}>
                                Delete
                            </Button>
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <p className="text-center">No feedback found.</p>
            )}
        </Container>
    );
};

export default FeedbackList;
