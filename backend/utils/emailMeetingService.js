import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { format } from 'date-fns';

// Configure mail transporter - adjust according to your email service
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send meeting invitation email with QR code
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} hostName - Meeting host name
 * @param {Object} meeting - Meeting details (title, meetingId, startTime, endTime, duration, description, etc.)
 * @param {string} accessCode - Unique access code for the meeting
 * @returns {Promise<boolean>} - Success status
 */
export const sendMeetingInvitation = async (email, name, hostName, meeting, accessCode) => {
  try {
    // Create the meeting URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const meetingUrl = `${baseUrl}/meeting/join/${meeting.meetingId}`;
    
    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(
      `${meetingUrl}?email=${encodeURIComponent(email)}&code=${accessCode}`
    );
    
    // Format dates
    const startDate = format(new Date(meeting.startTime), 'MMMM d, yyyy');
    const startTime = format(new Date(meeting.startTime), 'h:mm a');
    const endTime = format(new Date(meeting.endTime), 'h:mm a');
    
    // Create printable meeting pass HTML
    const printablePass = `
      <div style="border: 2px solid #333; padding: 20px; max-width: 500px; margin: 0 auto; text-align: center;">
        <h2 style="margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 10px;">Meeting Pass</h2>
        
        <div style="margin: 15px 0;">
          <p style="font-size: 16px; margin: 5px 0;"><strong>Attendee:</strong> ${name}</p>
          <p style="font-size: 16px; margin: 5px 0;"><strong>Meeting:</strong> ${meeting.title}</p>
          <p style="font-size: 16px; margin: 5px 0;"><strong>Host:</strong> ${hostName}</p>
          <p style="font-size: 16px; margin: 5px 0;"><strong>Date:</strong> ${startDate}</p>
          <p style="font-size: 16px; margin: 5px 0;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
          <p style="font-size: 16px; margin: 5px 0;"><strong>Meeting ID:</strong> ${meeting.meetingId}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <p style="font-weight: bold; margin-bottom: 10px;">Access Code: <span style="color: #0066cc; font-size: 18px;">${accessCode}</span></p>
          <img src="${qrCodeUrl}" alt="Meeting QR Code" style="width: 200px; height: 200px; margin: 0 auto; display: block;">
          <p style="font-size: 12px; margin-top: 5px;">Scan to join the meeting</p>
        </div>
        
        <p style="font-size: 12px; color: #666; margin-top: 20px;">Please bring this pass to the meeting or have it ready on your device.</p>
      </div>
    `;
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Meeting Invitation: ${meeting.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0066cc; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Meeting Invitation</h1>
          </div>
          
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <p>Hello ${name},</p>
            
            <p>You've been invited to a meeting by <strong>${hostName}</strong>.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h2 style="margin-top: 0; color: #0066cc;">${meeting.title}</h2>
              <p><strong>Date:</strong> ${startDate}</p>
              <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
              <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
              <p><strong>Host:</strong> ${hostName}</p>
              <p><strong>Meeting ID:</strong> ${meeting.meetingId}</p>
              ${meeting.description ? `<p><strong>Description:</strong> ${meeting.description}</p>` : ''}
            </div>
            
            <div style="margin: 30px 0; text-align: center;">
              <p style="font-weight: bold; margin-bottom: 10px;">Your Access Code: <span style="color: #0066cc; font-size: 18px;">${accessCode}</span></p>
              <p style="margin-bottom: 15px;">Scan this QR code to join the meeting:</p>
              <img src="${qrCodeUrl}" alt="Meeting QR Code" style="width: 200px; height: auto;">
            </div>
            
            <p style="text-align: center;">
              <a href="${meetingUrl}" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Join Meeting</a>
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <h3>Printable Meeting Pass</h3>
              <p>Please print this meeting pass or have it ready on your device:</p>
              ${printablePass}
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">If you have any questions, please contact the meeting host directly.</p>
          </div>
        </div>
      `
    };
    
    // Send email
    const result = await transporter.sendMail(mailOptions);
    console.log(`Meeting invitation sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending meeting invitation:', error);
    throw new Error('Failed to send meeting invitation email');
  }
};

/**
 * Generate a QR code for meeting access
 * @param {string} meetingId - Meeting ID
 * @param {string} accessCode - Access code for the meeting
 * @returns {Promise<string>} - QR code data URL
 */
export const generateMeetingQR = async (meetingId, accessCode) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const meetingUrl = `${baseUrl}/meeting/join/${meetingId}?code=${accessCode}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(meetingUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate meeting QR code');
  }
};