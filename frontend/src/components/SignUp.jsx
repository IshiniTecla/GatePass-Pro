import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../Style.css';

function SignUp() {
    const [name, setName] = useState('');
    const [nic, setNIC] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contactNumber, setContactNo] = useState('');
    const [hostName, setHostName] = useState('');
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'photo') {
            const file = files[0];
            if (file) {
                // Resize the image here
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 800;  
                        const MAX_HEIGHT = 600; 
                        let width = img.width;
                        let height = img.height;

                        if (width > MAX_WIDTH) {
                            height = height * (MAX_WIDTH / width);
                            width = MAX_WIDTH;
                        }
                        if (height > MAX_HEIGHT) {
                            width = width * (MAX_HEIGHT / height);
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7); // Reduce quality

                       
                        const byteString = atob(resizedBase64.split(',')[1]);
                        const mimeString = resizedBase64.split(',')[0].split(':')[1].split(';')[0];
                        const ab = new ArrayBuffer(byteString.length);
                        const ia = new Uint8Array(ab);
                        for (let i = 0; i < byteString.length; i++) {
                            ia[i] = byteString.charCodeAt(i);
                        }
                        const blob = new Blob([ab], { type: mimeString });
                        setPhoto(blob); 



                    };
                    img.src = event.target.result;
                }
                reader.readAsDataURL(file);
            }
        } else {
            setName(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('nic', nic);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('contactNumber', contactNumber);
        formData.append('hostName', hostName);
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            const result = await axios.post('http://localhost:5555/visitors/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(result);
            setSuccessMessage('Registration successful!');       
            setName('');
            setNIC('');
            setEmail('');
            setPassword('');
            setContactNo('');
            setHostName('');
            setPhoto(null);



            setTimeout(() => {
                navigate('/visitors');
            }, 1500);
        } catch (err) {
            console.error(err);
            setError('Registration failed. Please try again.');                              //show error message
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            }
            setLoading(false);
        } finally {
           
        }
    };

    return (
        <div className="portal-container">
            <div className="portal-header">
                <h1>WELCOME</h1>
                <p>Please provide your details.</p>
            </div>
            {successMessage && <div className="success-message">{successMessage}</div>}
            {error && <div className="error-message">{error}</div>}
            <form id="visitorForm" className="portal-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="nic">NIC</label>
                    <input
                        type="text"
                        id="nic"
                        value={nic}
                        onChange={(e) => setNIC(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="contactNumber">Contact Number</label>
                    <input
                        type="tel"
                        id="contactNumber"
                        value={contactNumber}
                        onChange={(e) => setContactNo(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="hostName">Host Name</label>
                    <input
                        type="text"
                        id="hostName"
                        value={hostName}
                        onChange={(e) => setHostName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="visitorImage">Add Your Photo Here</label>
                    <input
                        type="file"
                        name="photo"
                        id="visitorImage"
                        accept="image/*"
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <button type="submit" className="portal-button" disabled={loading}>
                    {loading ? 'Registering...' : 'Enter'}
                </button>
            </form>
        </div>
    );
}

export default SignUp;
