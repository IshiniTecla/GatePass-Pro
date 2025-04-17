import React, { forwardRef } from "react";
import QRCode from "qrcode.react";

const Badge = forwardRef(({ visitor }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: "300px",
        padding: "20px",
        border: "2px solid #333",
        borderRadius: "8px",
        backgroundColor: "#fff",
        textAlign: "center",
        fontFamily: "Arial",
      }}
    >
      <h3>Visitor Badge</h3>
      <p>
        <strong>Name:</strong> {visitor.visitorName}
      </p>
      <p>
        <strong>Email:</strong> {visitor.email}
      </p>
      <p>
        <strong>Contact:</strong> {visitor.contactNumber}
      </p>
      <p>
        <strong>Check-In Time:</strong> {visitor.checkInTime}
      </p>
      <QRCode value={visitor.email} size={128} />
    </div>
  );
});

export default Badge;
