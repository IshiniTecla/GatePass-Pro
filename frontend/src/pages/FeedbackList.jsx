import React, { useEffect, useState } from "react";
import { getFeedbackList, deleteFeedback } from "../services/feedbackService";
import { Link, useLocation } from "react-router-dom";
import { Button, Container, Card } from "react-bootstrap";
import { useSnackbar } from "notistack";

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

    // Inline styles
    const styles = {
        feedbackListContainer: {
            maxWidth: '900px',
            margin: '50px auto',
            padding: '20px',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
        },
        heading: {
            textAlign: 'center',
            color: '#333',
            fontWeight: '600',
            marginBottom: '20px',
        },
        thankYouMessage: {
            textAlign: 'center',
            color: '#007bff',
            fontSize: '24px',
            fontWeight: '600',
            marginTop: '30px',
        },
        thankYouSpan: {
            fontSize: '36px',
            marginLeft: '10px',
        },
        feedbackCard: {
            backgroundColor: '#f9f9f9',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '15px',
        },
        cardTitle: {
            fontSize: '18px',
            fontWeight: '600',
        },
        cardSubtitle: {
            marginBottom: '10px',
            color: '#888',
        },
        cardText: {
            fontSize: '16px',
            color: '#333',
        },
        button: {
            marginRight: '10px',
        },
        btnWarning: {
            backgroundColor: '#ffc107',
            borderColor: '#ffc107',
        },
        btnWarningHover: {
            backgroundColor: '#e0a800',
        },
        btnDanger: {
            backgroundColor: '#dc3545',
            borderColor: '#dc3545',
        },
        btnDangerHover: {
            backgroundColor: '#c82333',
        },
    };

    return (
        <Container style={styles.feedbackListContainer}>
            <h2 style={styles.heading}>Your Feedbacks</h2>

            {showThankYou && (
                <div style={styles.thankYouMessage}>
                    <h3>Thank you for your feedback!<span style={styles.thankYouSpan}>😊</span></h3>
                </div>
            )}

            {feedbacks.length > 0 ? (
                feedbacks.map((feedback) => (
                    <Card key={feedback._id} style={styles.feedbackCard}>
                        <Card.Body>
                            <Card.Title style={styles.cardTitle}>{feedback.visitorName}</Card.Title>
                            <Card.Subtitle style={styles.cardSubtitle}>{feedback.email}</Card.Subtitle>
                            <Card.Text style={styles.cardText}>
                                <strong>Rating:</strong> {feedback.rating} <br />
                                <strong>Comments:</strong> {feedback.comments}
                            </Card.Text>
                            <Link to={`/edit-feedback/${feedback._id}`}>
                                <Button
                                    variant="warning"
                                    onClick={() => handleEdit(feedback._id)}
                                    style={styles.btnWarning}
                                    className="me-2"
                                >
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                variant="danger"
                                onClick={() => handleDelete(feedback._id)}
                                style={styles.btnDanger}
                            >
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
