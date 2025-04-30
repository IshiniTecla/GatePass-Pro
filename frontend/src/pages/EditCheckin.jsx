import React, { useState, useEffect } from "react";
import { Form, Button, Container, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";

const EditCheckin = () => {
    const { checkInId } = useParams();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        visitorName: "",
        email: "",
        contactNumber: "",
        visitPurpose: "",
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCheckin = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/checkin/${checkInId}`);
                const {
                    visitorName,
                    email,
                    contactNumber,
                    visitPurpose
                } = res.data;

                setFormData({
                    visitorName,
                    email,
                    contactNumber,
                    visitPurpose
                });

            } catch (error) {
                enqueueSnackbar("Failed to load check-in data", { variant: "error" });
            } finally {
                setLoading(false);
            }
        };

        fetchCheckin();
    }, [checkInId]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.put(`http://localhost:5000/api/checkin/${checkInId}`, formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            enqueueSnackbar("Check-in updated successfully!", { variant: "success" });
            navigate("/checkin-details");
        } catch (error) {
            console.error("Error updating check-in:", error.response?.data || error.message);
            enqueueSnackbar("Failed to update check-in", { variant: "error" });
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <Container className="mt-4">
            <h3>Edit Check-in</h3>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="visitorName" className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="visitorName"
                        value={formData.visitorName}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="email" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="contactNumber" className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                        type="text"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="visitPurpose" className="mb-3">
                    <Form.Label>Visit Purpose</Form.Label>
                    <Form.Control
                        type="text"
                        name="visitPurpose"
                        value={formData.visitPurpose}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Button type="submit" variant="primary">Update</Button>
            </Form>
        </Container>
    );
};

export default EditCheckin;
