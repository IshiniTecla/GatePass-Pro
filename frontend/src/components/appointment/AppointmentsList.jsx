import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'cancelled'

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // In a real application, you would get the current host ID from authentication
        // const hostId = getCurrentHostId();
        // const response = await axios.get(`/api/appointments/host/${hostId}`);
        
        // For demo purposes, fetching all appointments
        const response = await axios.get('/api/appointments');
        setAppointments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch appointments');
        setLoading(false);
        console.error(err);
      }
    };

    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status.toLowerCase() === filter;
  });

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) return <div className="p-4 text-center">Loading appointments...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Appointments</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('pending')} 
            className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('confirmed')} 
            className={`px-3 py-1 rounded ${filter === 'confirmed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Confirmed
          </button>
          <button 
            onClick={() => setFilter('cancelled')} 
            className={`px-3 py-1 rounded ${filter === 'cancelled' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Cancelled
          </button>
        </div>
      </div>
      
      {filteredAppointments.length === 0 ? (
        <p className="text-center text-gray-500">No appointments found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Visitor</th>
                <th className="py-2 px-4 text-left">Scheduled Time</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Confirmation Code</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{appointment.visitor?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{appointment.visitor?.email || 'No email'}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {appointment.scheduledTime ? formatDateTime(appointment.scheduledTime) : 'Not scheduled'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {appointment.confirmationCode || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    {appointment.status === 'Pending' && (
                      <div className="flex space-x-2">
                        <Link
                          to={`/create-meeting/${appointment._id}`}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Schedule
                        </Link>
                      </div>
                    )}
                    {appointment.status === 'Confirmed' && (
                      <div className="flex space-x-2">
                        <Link
                          to={`/create-meeting/${appointment._id}`}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          Edit
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;