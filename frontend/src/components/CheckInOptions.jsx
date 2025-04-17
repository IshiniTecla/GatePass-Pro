// components/user/CheckInOptions.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Camera } from "lucide-react";

const CheckInOptions = () => {
    const navigate = useNavigate();

    const optionStyle = {
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "20px",
        margin: "10px",
        width: "250px",
        textAlign: "center",
        cursor: "pointer",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.2s",
    };

    const containerStyle = {
        display: "flex",
        justifyContent: "center",
        gap: "40px",
        marginTop: "60px",
    };

    const handleClick = (type) => {
        navigate(type === "manual" ? "/manual-checkin" : "/face-checkin");
    };

    return (
        <div style={containerStyle}>
            <div
                style={optionStyle}
                onClick={() => handleClick("manual")}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
                <Calendar size={40} />
                <h3 style={{ marginTop: "10px" }}>Manual Check-In</h3>
            </div>
            <div
                style={optionStyle}
                onClick={() => handleClick("face")}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
                <Camera size={40} />
                <h3 style={{ marginTop: "10px" }}>Face Scan Check-In</h3>
            </div>
        </div>
    );
};

export default CheckInOptions;
