import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaUser, FaClipboardList, FaSignOutAlt } from "react-icons/fa";
import "./SideNav.css";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
            {/* Toggle Button */}


            
            {/* Navigation Links */}
            <nav className="nav-links">
                <Link to="/visitor-dashboard" className="nav-item">
                    <FaUser className="icon" />
                    <span className="nav-text">Dashboard</span>
                </Link>

                <Link to="/feedback-form" className="nav-item">
                    <FaClipboardList className="icon" />
                    <span className="nav-text">Feedback</span>
                </Link>
            </nav>

            {/* Logout Button */}
            <div className="logout">
                <Link to="/" className="nav-item logout-btn">
                    <FaSignOutAlt className="icon" />
                    <span className="nav-text">Logout</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
