import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

function VisitorList() {
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVisitors = async () => {
            try {
                const response = await axios.get('http://localhost:5555/visitors');
                setVisitors(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching visitors:', err);
                setError('Failed to load visitor data.');
                setLoading(false);
            }
        };

        fetchVisitors();
    }, []);


    //download image
    const downloadPhoto = (photoBase64, name) => {
        if (photoBase64) {
            const link = document.createElement('a');
            link.href = photoBase64;
            link.download = `${name}_photo.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('No photo available for download.');
        }
    };

    const generateVisitorReport = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('Visitor Report', 14, 20);

            const tableColumn = ["Full Name", "NIC", "Email", "Contact No", "Host Name"];
            const tableRows = visitors.map(visitor => [
                visitor.name,
                visitor.nic,
                visitor.email,
                visitor.contactNo,
                visitor.hostName || 'N/A',
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 30,
            });

            doc.save('Visitor_Report.pdf');
        } catch (error) {
            console.error("Failed to generate PDF:", error);
        }
    };

    if (loading) {
        return <p>Loading visitors...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div>
            <h2>Visitor List</h2>
            {/* <button onClick={generateVisitorReport} className="portal-button" >
                Download Visitors Report
            </button> */}
            {visitors.length > 0 ? (
                <div className="table-wrapper">
                    <table className="visitor-table">
                        <thead>
                            <tr className="table-header-row">
                                <th>Name</th>
                                <th>NIC</th>
                                <th>Email</th>
                                <th>Contact No</th>
                                <th>Host Name</th>
                                <th>Photo</th>
                                <th className="actions-column">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visitors.map(visitor => (
                                <tr key={visitor._id}>
                                    <td>{visitor.name}</td>
                                    <td>{visitor.nic}</td>
                                    <td>{visitor.email}</td>
                                    <td>{visitor.contactNo}</td>
                                    <td>{visitor.hostName}</td>
                                    <td className="photo-column">
                                        {visitor.photoBase64 ? (
                                            <button onClick={() => downloadPhoto(visitor.photoBase64, visitor.name)} className="download-button">Download</button>
                                        ) : (
                                            'No Photo'
                                        )}
                                    </td>
                                    <td className="actions-column">
                                        <Link to={`/visitors/edit/${visitor._id}`} className="action-button edit-button">Edit</Link>
                                        <Link to={`/visitors/delete/${visitor._id}`} className="action-button delete-button">Delete</Link>
                                        <Link to={`/visitors/profile/${visitor._id}`} className="action-button profile-button">Profile</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No visitors found.</p>
            )}
        </div>
    );
}

export default VisitorList;
