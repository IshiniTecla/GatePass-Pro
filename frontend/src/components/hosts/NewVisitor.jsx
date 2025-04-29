import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const NewVisitor = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('/api/appointments?status=Pending');
        setAppointments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch appointments');
        setLoading(false);
        console.error('Error fetching appointments:', err);
      }
    };

    fetchAppointments();
  }, []);

  const handleShowDetails = (appointmentId) => {
    if (expandedAppointment === appointmentId) {
      setExpandedAppointment(null);
    } else {
      setExpandedAppointment(appointmentId);
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    try {
      await axios.put(`/api/appointments/${appointmentId}`, {
        status: 'Cancelled'
      });
      
      // Remove the appointment from the list or update its status
      setAppointments(appointments.filter(app => app._id !== appointmentId));
      
    } catch (err) {
      setError('Failed to reject appointment');
      console.error('Error rejecting appointment:', err);
    }
  };

  const handleCreateMeeting = (appointment) => {
    // Navigate to create meeting page with appointment details
    navigate('/create-meeting', { 
      state: { 
        visitorId: appointment.visitor._id,
        visitorName: appointment.visitor.name,
        visitorEmail: appointment.visitor.email,
        appointmentId: appointment._id,
        scheduledTime: appointment.scheduledTime
      } 
    });
  };

  if (loading) return <div className="text-center mt-8">Loading appointments...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">New Appointment Requests</h2>
      
      {appointments.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          No new appointment requests.
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="bg-white p-4 rounded-md shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{appointment.visitor.name}</h3>
                  <p className="text-gray-600">{appointment.visitor.email}</p>
                </div>
                <button
                  onClick={() => handleShowDetails(appointment._id)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {expandedAppointment === appointment._id ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {expandedAppointment === appointment._id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Date</p>
                    <p>{format(new Date(appointment.scheduledTime), 'MMMM d, yyyy')}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Time</p>
                    <p>{format(new Date(appointment.scheduledTime), 'h:mm a')}</p>
                  </div>
                  {appointment.details && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">Details</p>
                      <p>{appointment.details}</p>
                    </div>
                  )}
                  
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => handleRejectAppointment(appointment._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleCreateMeeting(appointment)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Create Meeting
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewVisitor;