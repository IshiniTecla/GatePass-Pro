import axios from 'axios';
import { SessionManager } from './SessionManager';

// Define URLs with fallbacks for different environment configurations
const API_URL =
  (window.env && window.env.REACT_APP_API_URL) ||
  (process.env.REACT_APP_API_URL) ||
  (import.meta.env && import.meta.env.VITE_API_URL) ||
  'http://localhost:5000/api';

const FRONTEND_URL =
  (window.env && window.env.REACT_APP_FRONTEND_URL) ||
  (process.env.REACT_APP_FRONTEND_URL) ||
  (import.meta.env && import.meta.env.VITE_FRONTEND_URL) ||
  'http://localhost:5173';

// Flag for development mode - adjust as needed
const DEV_MODE = process.env.NODE_ENV === 'development';

// Set timeouts based on environment
const API_TIMEOUT = DEV_MODE ? 60000 : 15000; // 60 seconds in dev, 15 seconds in production

/**
 * Axios instance with configured defaults
 */
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for CORS requests
});

// Prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshSubscribers = [];

// List of common endpoint variations to try when the original fails
const endpointMappings = {
  '/api/users/refresh': [
    '/api/users/token/refresh',
    '/api/user/refresh',
    '/users/refresh',
    '/api/users/refresh-token',
    '/api/auth/refresh',
  ],
  '/api/user/login': [
    '/api/users/login',
    '/api/user/login',
    '/user/login',
    '/login',
    '/api/auth/login',
  ],
  // Add other endpoint mappings as needed
};

/**
 * Find alternative endpoints for fallback
 */
const findAlternativeEndpoint = (originalEndpoint) => {
  for (const [key, alternatives] of Object.entries(endpointMappings)) {
    if (originalEndpoint.includes(key)) {
      return alternatives;
    }
  }
  return [];
};

/**
 * Subscribe to token refresh event
 */
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Notify subscribers that token has been refreshed
 */
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Try to refresh the access token using refresh token
 */
const refreshAccessToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    const refreshToken = SessionManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Get the stored successful refresh endpoint if available
    const storedRefreshEndpoint = SessionManager.getSuccessfulRefreshEndpoint();
    
    // Try the stored endpoint first, then fallbacks
    const refreshEndpoints = storedRefreshEndpoint
      ? [storedRefreshEndpoint, ...findAlternativeEndpoint('/api/users/refresh')]
      : findAlternativeEndpoint('/api/users/refresh');

    // Try each refresh endpoint until one works
    for (const endpoint of refreshEndpoints) {
      try {
        console.log(`Trying refresh endpoint: ${endpoint}`);

        const response = await axios.post(
          `${API_URL}${endpoint}`,
          { refreshToken },
          {
            headers: {
              Authorization: `Bearer ${SessionManager.getToken()}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );

        if (response.data && response.data.token) {
          // Store both tokens
          SessionManager.storeTokens(
            response.data.token,
            response.data.refreshToken || refreshToken
          );

          // Save successful endpoint for future use
          SessionManager.setSuccessfulRefreshEndpoint(endpoint);
          
          console.log(`Token refreshed successfully using endpoint: ${endpoint}`);
          
          isRefreshing = false;
          onTokenRefreshed(response.data.token);
          return response.data.token;
        }
      } catch (endpointError) {
        console.log(`Refresh attempt failed with endpoint ${endpoint}:`, endpointError.message);
      }
    }

    // If all refresh attempts failed
    throw new Error('All token refresh attempts failed');
  } catch (error) {
    console.error('Error refreshing token:', error);
    isRefreshing = false;
    return null;
  }
};

/**
 * Try different endpoint patterns if initial request fails
 */
const tryAlternativeEndpoints = async (originalUrl, data = null, options = {}, method = 'get') => {
  // Parse the URL to get just the endpoint path
  let endpointPath;
  try {
    const urlObj = new URL(originalUrl, API_URL);
    endpointPath = urlObj.pathname;
  } catch (e) {
    endpointPath = originalUrl.startsWith('/') ? originalUrl : `/${originalUrl}`;
  }

  // Get specific alternatives for this endpoint
  const specificAlternatives = findAlternativeEndpoint(endpointPath);

  // List of endpoint variations to try
  const endpointVariations = [
    endpointPath, // Original
    ...specificAlternatives,
    endpointPath.replace('/api/', '/'), // Without api prefix
    endpointPath.replace('/api/users/', '/api/auth/'),
    endpointPath.replace('/api/users/', '/user/'),
  ];

  let lastError = null;

  // Try each endpoint variation
  for (const endpoint of endpointVariations) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      
      // Configure request with credentials
      const config = {
        ...options,
        withCredentials: true,
      };

      // Make request based on method type
      let response;
      switch (method.toLowerCase()) {
        case 'get':
          response = await apiClient.get(endpoint, config);
          break;
        case 'post':
          response = await apiClient.post(endpoint, data, config);
          break;
        case 'put':
          response = await apiClient.put(endpoint, data, config);
          break;
        case 'delete':
          response = await apiClient.delete(endpoint, config);
          break;
        default:
          response = await apiClient[method.toLowerCase()](endpoint, data, config);
      }

      console.log(`Success with endpoint: ${endpoint}`);

      // Store successful endpoint mapping for future use
      SessionManager.storeEndpointMapping(endpointPath, endpoint);
      
      return response;
    } catch (error) {
      lastError = error;
      console.log(`Failed with endpoint ${endpoint}:`, error.message);

      // If not 404, don't try other endpoints (might be auth or validation error)
      if (error.response && error.response.status !== 404) {
        throw error;
      }
    }
  }

  // If all variations failed, throw the last error
  throw lastError;
};

/**
 * Request interceptor to add auth token to requests
 */
apiClient.interceptors.request.use(
  async (config) => {
    const token = SessionManager.getToken();

    // For public endpoints, no token needed
    if (!token) {
      return config;
    }

    // Check if token is expired and we need to refresh
    if (SessionManager.isTokenExpired() && !config.url.includes('refresh')) {
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
        } else {
          // Token refresh failed, but continue with request
          // (response interceptor will handle 401)
        }
      } catch (refreshError) {
        console.error('Error during token refresh:', refreshError);
      }
    } else {
      // Add token to request
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor to handle errors and authentication issues
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // For 404 errors, try alternative endpoints
    if (error.response && error.response.status === 404 && !originalRequest._retried) {
      try {
        originalRequest._retried = true;
        
        // Get the endpoint path from the URL
        const path = originalRequest.url;
        
        // Check if we have a known mapping for this endpoint
        const storedMapping = SessionManager.getEndpointMapping(path);
        
        if (storedMapping) {
          // Try the known working endpoint
          const newConfig = { ...originalRequest, url: storedMapping };
          return apiClient(newConfig);
        }
        
        // Try alternatives using our helper function
        return await tryAlternativeEndpoints(
          path,
          originalRequest.data,
          {
            headers: originalRequest.headers,
            params: originalRequest.params,
          },
          originalRequest.method
        );
      } catch (retryError) {
        console.log('Error trying alternative endpoints:', retryError);
        return Promise.reject(retryError);
      }
    }

    // Handle authentication errors (401)
    if (error.response && error.response.status === 401) {
      // Skip refresh if already tried or if it's a refresh request
      if (originalRequest._retry || originalRequest.url.includes('refresh')) {
        // Clean up and trigger logout
        SessionManager.logout();
        window.dispatchEvent(new Event('user:unauthorized'));
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
        
        return Promise.reject(error);
      }

      // Try token refresh
      try {
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          // Mark as retried to prevent infinite loop
          originalRequest._retry = true;
          
          // Update headers with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry original request
          return apiClient(originalRequest);
        } else {
          // Token refresh failed, redirect to login
          SessionManager.logout();
          window.dispatchEvent(new Event('user:unauthorized'));
          
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login?expired=true';
          }
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Redirect to login
        SessionManager.logout();
        window.dispatchEvent(new Event('user:unauthorized'));
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
        
        return Promise.reject(error);
      }
    }

    // Handle forbidden errors (403)
    if (error.response && error.response.status === 403) {
      console.error('Access forbidden');
      window.dispatchEvent(new Event('user:forbidden'));
      
      // Optionally redirect to a forbidden page
      // window.location.href = '/forbidden';
    }

    // Log API errors with context
    if (error.response) {
      console.error(
        `API Error: ${error.config.url} - Status: ${error.response.status}`,
        error.response.data
      );
    } else if (error.request) {
      console.error('Network Error: No response received', error.request);
    } else {
      console.error(`Error: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

/**
 * API Helper methods for common operations
 */
export const apiHelper = {
  /**
   * Login with credentials
   */
  login: async (credentials) => {
    try {
      // Try to use previously successful endpoint if available
      const previousEndpoint = SessionManager.getSuccessfulLoginEndpoint();
      
      if (previousEndpoint) {
        try {
          const response = await apiClient.post(previousEndpoint, credentials);
          
          if (response.data && response.data.token) {
            SessionManager.storeTokens(response.data.token, response.data.refreshToken);
            return response;
          }
        } catch (error) {
          console.log('Previous login endpoint failed, trying alternatives');
        }
      }
      
      // Try alternative endpoints
      const response = await tryAlternativeEndpoints(
        '/api/user/login',
        credentials,
        {},
        'post'
      );
      
      if (response.data && response.data.token) {
        SessionManager.storeTokens(response.data.token, response.data.refreshToken);
        
        // Store successful endpoint
        const endpoint = response.config.url;
        SessionManager.setSuccessfulLoginEndpoint(endpoint);
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  /**
   * Register a new user
   */
  register: async (userData) => {
    try {
      const response = await tryAlternativeEndpoints(
        '/api/users/register',
        userData,
        {},
        'post'
      );
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },
  
  /**
   * Logout the current user
   */
  logout: () => {
    SessionManager.logout();
    window.dispatchEvent(new Event('user:logout'));
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return SessionManager.isAuthenticated();
  },
  
  /**
   * Fetch data with error handling
   */
  fetchData: async (endpoint, fallbackData = null) => {
    try {
      // Check for known mapping
      const storedMapping = SessionManager.getEndpointMapping(endpoint);
      
      if (storedMapping) {
        try {
          const response = await apiClient.get(storedMapping);
          return response.data;
        } catch (mappedError) {
          // Fall through to try original endpoint
        }
      }
      
      // Try original endpoint
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      // Try alternatives if 404
      if (error.response && error.response.status === 404) {
        try {
          const response = await tryAlternativeEndpoints(endpoint, null, {}, 'get');
          return response.data;
        } catch (altError) {
          console.log(`Error fetching from ${endpoint} and alternatives:`, altError.message);
        }
      } else {
        console.log(`Error fetching from ${endpoint}:`, error.message);
      }
      
      return fallbackData;
    }
  },
  
  /**
   * Submit data (POST)
   */
  submitData: async (endpoint, data) => {
    try {
      const response = await apiClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Try alternatives if endpoint not found
        const response = await tryAlternativeEndpoints(endpoint, data, {}, 'post');
        return response.data;
      }
      throw error;
    }
  },
  
  /**
   * Update data (PUT)
   */
  updateData: async (endpoint, data) => {
    try {
      const response = await apiClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Try alternatives if endpoint not found
        const response = await tryAlternativeEndpoints(endpoint, data, {}, 'put');
        return response.data;
      }
      throw error;
    }
  },
  
  /**
   * Delete data (DELETE)
   */
  deleteData: async (endpoint) => {
    try {
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Try alternatives if endpoint not found
        const response = await tryAlternativeEndpoints(endpoint, null, {}, 'delete');
        return response.data;
      }
      throw error;
    }
  },
  
  /**
   * Force refresh the auth token
   */
  refreshToken: async () => {
    return await refreshAccessToken();
  }
};

export { API_URL, FRONTEND_URL };
export default apiClient;