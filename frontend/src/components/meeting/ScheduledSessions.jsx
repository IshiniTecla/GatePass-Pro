import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { SessionManager } from '../../utils/SessionManager';

const ScheduledSessions = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('scheduled'); // 'scheduled', 'active', 'completed', 'cancelled'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        // Get host token for authentication
        const hostToken = SessionManager.getHostToken() || localStorage.getItem("hostToken");
        if (!hostToken) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        const response = await axios.get(`/api/meetings?status=${filter}`, {
          headers: {
            'Authorization': `Bearer ${hostToken}`
          }
        });
        
        setMeetings(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch meetings: ' + (err.response?.data?.message || err.message));
        setLoading(false);
        console.error('Error fetching meetings:', err);
      }
    };

    fetchMeetings();
  }, [filter]);

  const handleStartMeeting = async (meetingId) => {
    try {
      setLoading(true);
      const hostToken = SessionManager.getHostToken() || localStorage.getItem("hostToken");
      
      const response = await axios.post(`/api/meetings/${meetingId}/start`, {}, {
        headers: {
          'Authorization': `Bearer ${hostToken}`
        }
      });
      
      // Navigate to the meeting room
      navigate(response.data.roomUrl);
    } catch (err) {
      setError('Failed to start meeting: ' + (err.response?.data?.message || err.message));
      console.error('Error starting meeting:', err);
      setLoading(false);
    }
  };

  const handleCancelMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to cancel this meeting?')) {
      return;
    }
    
    try {
      const hostToken = SessionManager.getHostToken() || localStorage.getItem("hostToken");
      
      await axios.post(`/api/meetings/${meetingId}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${hostToken}`
        }
      });
      
      // Update the status in the UI
      setMeetings(meetings.map(meeting => 
        meeting._id === meetingId 
          ? { ...meeting, status: 'cancelled' }
          : meeting
      ));
    } catch (err) {
      setError('Failed to cancel meeting: ' + (err.response?.data?.message || err.message));
      console.error('Error cancelling meeting:', err);
    }
  };

  const getMeetingStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Scheduled</span>;
      case 'active':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>;
      case 'completed':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Completed</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Cancelled</span>;
      default:
        return null;
    }
  };

  if (loading && meetings.length === 0) return <div className="text-center mt-8">Loading meetings...</div>;
  
  return (
    <div className="scheduled-sessions-container">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Scheduled Sessions</h2>
        <div className="filter-buttons flex space-x-2">
          <button 
            onClick={() => setFilter('scheduled')}
            className={`px-3 py-1 rounded ${filter === 'scheduled' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Scheduled
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Completed
          </button>
          <button 
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1 rounded ${filter === 'cancelled' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Cancelled
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {meetings.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          No {filter} meetings found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((meeting) => (
            <div key={meeting._id} className="bg-white p-4 rounded-md shadow">
              <div className="flex justify-between mb-2">
                <h3 className="text-lg font-semibold">{meeting.title}</h3>
                {getMeetingStatusBadge(meeting.status)}
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                <p>
                  {format(new Date(meeting.startTime), 'MMM d, yyyy')} · {format(new Date(meeting.startTime), 'h:mm a')} - {format(new Date(meeting.endTime), 'h:mm a')}
                </p>
                <p>{meeting.duration} minutes</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Participants:</p>
                <ul className="text-sm text-gray-600">
                  {meeting.participants && meeting.participants.slice(0, 3).map((participant, index) => (
                    <li key={index}>{participant.name || participant.email}</li>
                  ))}
                  {meeting.participants && meeting.participants.length > 3 && (
                    <li className="text-blue-500">+{meeting.participants.length - 3} more</li>
                  )}
                </ul>
              </div>
              
              <div className="mt-4 pt-3 border-t flex justify-end space-x-2">
                {meeting.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => handleCancelMeeting(meeting._id)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleStartMeeting(meeting._id)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Start Meeting
                    </button>
                  </>
                )}
                
                {meeting.status === 'active' && (
                  <button
                    onClick={() => navigate(`/host-dashboard/meeting-room/${meeting._id}`)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Join Meeting
                  </button>
                )}
                
                {(meeting.status === 'completed' || meeting.status === 'cancelled') && (
                  <button
                    onClick={() => navigate(`/host-dashboard/meetings/${meeting._id}`)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduledSessions;