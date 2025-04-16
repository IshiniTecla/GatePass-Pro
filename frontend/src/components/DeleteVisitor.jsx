import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function DeleteVisitor() {
    const [visitorName, setVisitorName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false); 
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchVisitorName = async () => {
            if (!id) {
                setError("Visitor ID is undefined.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5555/visitors/${id}?fields=name`);
                setVisitorName(response.data.name);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching visitor name:', err);
                setError('Failed to fetch visitor name.');
                setLoading(false);
               
            }
        };

        fetchVisitorName();
    }, [id]); 

    const handleDelete = async () => {
        if (!id) {
            setError("Visitor ID is undefined. Cannot delete.");
            navigate('/visitors');
            return;
        }
        try {
            await axios.delete(`http://localhost:5555/visitors/${id}`);
            setSuccess(true); 
            
        } catch (err) {
            console.error('Error deleting visitor:', err);
            setError('Failed to delete visitor.');
            
        }
    };

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate('/visitors');
            }, 1000); 
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    if (loading) {
        return <p>Loading visitor name...</p>;
    }

    if (error) {
        return (
            <div className="error-message">
                <p>{error}</p>
                <button onClick={() => navigate('/visitors')}>Close</button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="success-message">
                <p>
                    Visitor {visitorName} has been deleted successfully.
                </p>
            </div>
        );
    }

    return (
        <div className="delete-modal-content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete {visitorName}?</p>
            <div className="delete-actions">
                <button onClick={handleDelete} className="confirm-delete">Delete</button>
                <button onClick={() => navigate('/visitors')} className="cancel-delete">Cancel</button>
            </div>
        </div>
    );
}

export default DeleteVisitor;
