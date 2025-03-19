import React, { useEffect, useState } from "react";
import { getFeedbackList, deleteFeedback } from "../services/feedbackService";
import { Link } from "react-router-dom";
import { Table, Button, Container } from "react-bootstrap";
import "../styles.css";


const FeedbackList = () => {
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    // Fetch all feedbacks
    const fetchFeedbacks = async () => {
        try {
            const data = await getFeedbackList();
            setFeedbacks(data);
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
        }
    };

    // Delete feedback
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this feedback?")) {
            try {
                await deleteFeedback(id);
                fetchFeedbacks(); // Refresh the list
            } catch (error) {
                console.error("Error deleting feedback:", error);
            }
        }
    };

    return (
        <Container>
            <h2 className="mt-4 mb-3">Visitor Feedback</h2>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Visitor Name</th>
                        <th>Email</th>
                        <th>Rating</th>
                        <th>Comments</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {feedbacks.length > 0 ? (
                        feedbacks.map((feedback, index) => (
                            <tr key={feedback._id}>
                                <td>{index + 1}</td>
                                <td>{feedback.visitorName}</td>
                                <td>{feedback.email}</td>
                                <td>{feedback.rating}</td>
                                <td>{feedback.comments}</td>
                                <td>
                                    <Link to={`/edit-feedback/${feedback._id}`}>
                                        <Button variant="warning" size="sm" className="me-2">
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(feedback._id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">
                                No feedback found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default FeedbackList;
