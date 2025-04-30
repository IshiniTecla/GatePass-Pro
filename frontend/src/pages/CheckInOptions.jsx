// components/user/CheckInOptions.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, LogOut } from "lucide-react";

const CheckInOptions = () => {
    const navigate = useNavigate();

    const containerStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        padding: "40px 20px",
    };

    const titleStyle = {
        fontSize: "36px",
        fontWeight: "600",
        color: "#1f2937", // dark gray
        marginBottom: "40px",
        textAlign: "center",
    };

    const buttonContainerStyle = {
        display: "flex",
        flexWrap: "wrap",
        gap: "40px",
        justifyContent: "center",
        width: "100%",
        maxWidth: "900px",
    };

    const optionStyle = {
        flex: "1 1 250px",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        padding: "40px 20px",
        textAlign: "center",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        cursor: "pointer",
    };

    const iconStyle = {
        color: "#4f46e5", // indigo-600
    };

    const textStyle = {
        fontSize: "22px",
        fontWeight: "500",
        marginTop: "20px",
        color: "#374151", // gray-700
    };

    const handleClick = (type) => {
        if (type === "checkin") {
            navigate("/manual-checkin"); // You can adjust this if needed
        } else {
            navigate("/face-checkin");
        }
    };

    return (
        <div style={containerStyle}>
            <div style={titleStyle}>Welcome to GatePass Pro</div>
            <div style={buttonContainerStyle}>
                <div
                    style={optionStyle}
                    onClick={() => handleClick("checkin")}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
                    }}
                >
                    <LogIn size={60} style={iconStyle} />
                    <div style={textStyle}>Check-In</div>
                </div>

                <div
                    style={optionStyle}
                    onClick={() => handleClick("checkout")}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
                    }}
                >
                    <LogOut size={60} style={iconStyle} />
                    <div style={textStyle}>Check-Out</div>
                </div>
            </div>
        </div>
    );
};

export default CheckInOptions;
