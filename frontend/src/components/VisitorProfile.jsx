import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../Style.css';

function VisitorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [visitor, setVisitor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVisitor = async () => {
            try {
                const response = await axios.get(`http://localhost:5555/visitors/${id}`);
                setVisitor(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching visitor profile:', err);  //error message
                setError('Failed to load visitor profile.');
                setLoading(false);
            }
        };

        fetchVisitor();
    }, [id]);

    if (loading) {
        return <div className="profile-container"><p>Loading visitor profile...</p></div>;
    }

    if (error) {
        return <div className="profile-container"><p style={{ color: 'red' }}>{error}</p></div>;
    }

    if (!visitor) {
        return <div className="profile-container"><p>Visitor not found.</p></div>;
    }



    return (
        <div className="profile-container">
            <h2>Visitor Profile</h2>
            <div className="profile-details-wrapper">
                <div className="profile-info">
                    <p><strong>Name:</strong> {visitor.name}</p>
                    <p><strong>NIC:</strong> {visitor.nic}</p>
                    <p><strong>Email:</strong> {visitor.email}</p>
                    <p><strong>Contact No:</strong> {visitor.contactNo}</p>
                    <p><strong>Host Name:</strong> {visitor.hostName}</p>
                </div>
                {visitor.photoBase64 && (
                    <div className="photo-section">
                        <h3>Photo</h3>
                        <img src={visitor.photoBase64} alt={visitor.name} className="profile-photo" />
                    </div>
                )}
            </div>
            <button onClick={() => navigate('/visitors')} className="back-button">Back to List</button>
        </div>
    );
}


export default VisitorProfile;