import axios from 'axios';
import { io } from 'socket.io-client';

// Base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Initialize axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Socket.io connection
const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
  autoConnect: false,
  withCredentials: true,
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers['x-user-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access - logout user
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper functions for API requests
export const apiHelper = {
  // General request helper
  request: async (method, endpoint, data = null, config = {}) => {
    try {
      const response = await api[method](endpoint, data, config);
      return response.data;
    } catch (error) {
      console.error(`API ${method.toUpperCase()} request failed:`, error);
      throw error;
    }
  },
  
  // Shorthand methods for common HTTP verbs
  get: async (endpoint, config = {}) => {
    return apiHelper.request('get', endpoint, null, config);
  },
  
  post: async (endpoint, data, config = {}) => {
    return apiHelper.request('post', endpoint, data, config);
  },
  
  put: async (endpoint, data, config = {}) => {
    return apiHelper.request('put', endpoint, data, config);
  },
  
  delete: async (endpoint, config = {}) => {
    return apiHelper.request('delete', endpoint, null, config);
  },
  
  // File upload helper
  uploadFile: async (endpoint, file, fieldName = 'file', extraData = {}) => {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Add any extra form data
    Object.entries(extraData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    return apiHelper.request('post', endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

// Socket.io event handlers
const socketService = {
  connect: () => {
    if (!socket.connected) {
      socket.connect();
    }
  },
  
  disconnect: () => {
    if (socket.connected) {
      socket.disconnect();
    }
  },
  
  registerUser: (userId) => {
    socket.emit('registerUser', userId);
  },
  
  joinMeeting: (meetingId) => {
    socket.emit('joinMeeting', meetingId);
  },
  
  leaveMeeting: (meetingId) => {
    socket.emit('leaveMeeting', meetingId);
  },
  
  sendMessage: (messageData) => {
    socket.emit('sendMessage', messageData);
  },
  
  onNewMessage: (callback) => {
    socket.on('newMessage', callback);
  },
  
  onPrivateMessage: (callback) => {
    socket.on('newPrivateMessage', callback);
  },
  
  offNewMessage: () => {
    socket.off('newMessage');
  },
  
  offPrivateMessage: () => {
    socket.off('newPrivateMessage');
  }
};

// User API service
const userService = {
  login: async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  register: async (userData) => {
    return api.post('/users/register', userData);
  },
  
  logout: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    socketService.disconnect();
  },
  
  getCurrentUser: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },
  
  updateProfile: async (userId, profileData) => {
    return api.put(`/users/${userId}`, profileData);
  },
  
  uploadProfileImage: async (userId, imageFile) => {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    return api.post(`/users/${userId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

// Visitor API service
const visitorService = {
  createVisitor: async (visitorData) => {
    return api.post('/visitors', visitorData);
  },
  
  getVisitorById: async (visitorId) => {
    return api.get(`/visitors/${visitorId}`);
  },
  
  updateVisitor: async (visitorId, visitorData) => {
    return api.put(`/visitors/${visitorId}`, visitorData);
  },
  
  deleteVisitor: async (visitorId) => {
    return api.delete(`/visitors/${visitorId}`);
  },
  
  getVisitorsByUserId: async (userId) => {
    return api.get(`/visitors/user/${userId}`);
  }
};

// Host API service
const hostService = {
  getHostProfile: async (hostId) => {
    return api.get(`/hosts/${hostId}`);
  },
  
  updateHostProfile: async (hostId, profileData) => {
    return api.put(`/hosts/${hostId}`, profileData);
  },
  
  updateAvailability: async (hostId, availabilityData) => {
    return api.put(`/hosts/${hostId}/availability`, availabilityData);
  },
  
  getAvailableHosts: async () => {
    return api.get('/hosts/available');
  }
};

// Notification API service
const notificationService = {
  getUserNotifications: async (userId) => {
    return api.get(`/notifications/user/${userId}`);
  },
  
  markAsRead: async (notificationId) => {
    return api.put(`/notifications/${notificationId}/read`);
  },
  
  markAllAsRead: async (userId) => {
    return api.put(`/notifications/user/${userId}/read-all`);
  },
  
  deleteNotification: async (notificationId) => {
    return api.delete(`/notifications/${notificationId}`);
  }
};

// Statistics API service
const statisticsService = {
  getUserStatistics: async (userId) => {
    return api.get(`/statistics/user/${userId}`);
  },
  
  getHostStatistics: async (hostId) => {
    return api.get(`/statistics/host/${hostId}`);
  }
};

// Create the default export object with all services
const apiClient = {
  api,
  socket,
  socketService,
  userService,
  visitorService,
  hostService,
  notificationService,
  statisticsService,
  // Add methods that might be accessed directly from apiClient
  login: userService.login,
  logout: userService.logout,
  getCurrentUser: userService.getCurrentUser,
  // Socket methods
  connectSocket: socketService.connect,
  disconnectSocket: socketService.disconnect
};

// Export services as named exports
export {
  api,
  socket,
  socketService,
  userService,
  visitorService,
  hostService,
  notificationService,
  statisticsService,
  apiHelper
};

// Export apiClient as default export
export default apiClient;