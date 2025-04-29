import QRCode from 'qrcode';

/**
 * Generate a QR code for meeting access
 * @param {string} meetingId - Meeting ID
 * @param {string} accessCode - Access code for the meeting
 * @param {string} email - Optional email to embed in QR code
 * @returns {Promise<string>} - QR code data URL
 */
export const generateMeetingQR = async (meetingId, accessCode, email = null) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    let meetingUrl = `${baseUrl}/meeting/join/${meetingId}?code=${accessCode}`;
    
    // Add email to QR code if provided
    if (email) {
      meetingUrl += `&email=${encodeURIComponent(email)}`;
    }
    
    // Generate QR code with high error correction for better scanning
    const qrCodeDataUrl = await QRCode.toDataURL(meetingUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',  // QR code color
        light: '#ffffff'  // Background color
      }
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate meeting QR code');
  }
};

/**
 * Generate a printable meeting pass with QR code
 * @param {Object} meetingDetails - Meeting details
 * @param {string} attendeeName - Name of attendee
 * @param {string} hostName - Name of host
 * @param {string} accessCode - Access code for the meeting
 * @returns {Promise<string>} - HTML for printable pass
 */
export const generatePrintableMeetingPass = async (meetingDetails, attendeeName, hostName, accessCode) => {
  try {
    // Generate QR code
    const qrCodeUrl = await generateMeetingQR(meetingDetails.meetingId, accessCode);
    
    // Format date and time
    const startDate = new Date(meetingDetails.startTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const startTime = new Date(meetingDetails.startTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Create HTML for printable pass
    const printablePassHtml = `
      <div style="border: 2px solid #333; padding: 20px; max-width: 500px; margin: 0 auto; text-align: center; font-family: Arial, sans-serif;">
        <h2 style="margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 10px;">Meeting Pass</h2>
        
        <div style="margin: 15px 0;">
          <p style="font-size: 16px; margin: 5px 0;"><strong>Attendee:</strong> ${attendeeName}</p>
          <p style="font-size: 16px; margin: 5px 0;"><strong>Meeting:</strong> ${meetingDetails.title}</p>
          <p style="font-size: 16px; margin: 5px 0;"><strong>Host:</strong> ${hostName}</p>
          <p style="font-size: 16px; margin: 5px 0;"><strong>Date:</strong> ${startDate}</p>
          <p style="font-size: 16px; margin: 5px 0;"><strong>Time:</strong> ${startTime}</p>
          <p style="font-size: 16px; margin: 5px 0;"><strong>Meeting ID:</strong> ${meetingDetails.meetingId}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <p style="font-weight: bold; margin-bottom: 10px;">Access Code: <span style="color: #0066cc; font-size: 18px;">${accessCode}</span></p>
          <img src="${qrCodeUrl}" alt="Meeting QR Code" style="width: 200px; height: 200px; margin: 0 auto; display: block;">
          <p style="font-size: 12px; margin-top: 5px;">Scan to join the meeting</p>
        </div>
        
        <p style="font-size: 12px; color: #666; margin-top: 20px;">Please bring this pass to the meeting or have it ready on your device.</p>
      </div>
    `;
    
    return printablePassHtml;
  } catch (error) {
    console.error('Error generating printable meeting pass:', error);
    throw new Error('Failed to generate printable meeting pass');
  }
};