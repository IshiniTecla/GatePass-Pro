import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../Style.css';

function EditVisitor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [visitor, setVisitor] = useState({ name: '', nic: '', email: '', contactNo: '', hostName: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchVisitor = async () => {
            try {
                const response = await axios.get(`http://localhost:5555/visitors/${id}`);
                setVisitor(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching visitor:', err);
                setError('Failed to load visitor data for editing.');            //show error message
                setLoading(false);
            }
        };

        fetchVisitor();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVisitor(prevVisitor => ({
            ...prevVisitor,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            
            const { _id, __v, photo, ...visitorData } = visitor;

            await axios.put(`http://localhost:5555/visitors/${id}`, visitorData);     //successful message
            setSuccessMessage('Visitor details updated successfully!');
            setLoading(false);
            setTimeout(() => {
                navigate('/visitors');
            }, 1500);
        } catch (err) {
            console.error('Error updating visitor:', err);
            setError('Failed to update visitor details.');
            setLoading(false);
        }
    };

    if (loading) {
        return <p>Loading visitor data for editing...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div className="portal-container">
            <div className="portal-header">
                <h1>Edit Visitor</h1>
            </div>
            {successMessage && <div className="success-message">{successMessage}</div>}
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="portal-form">
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" name="name" value={visitor.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="nic">NIC</label>
                    <input type="text" id="nic" name="nic" value={visitor.nic} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" value={visitor.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="contactNo">Contact Number</label>
                    <input type="tel" id="contactNo" name="contactNo" value={visitor.contactNo} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="hostName">Host Name</label>
                    <input type="text" id="hostName" name="hostName" value={visitor.hostName} onChange={handleChange} />
                </div>
                <button type="submit" className="portal-button" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Visitor'}
                </button>
                <button type="button" onClick={() => navigate('/visitors')} className="portal-button">
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default EditVisitor;
