/**
 * Enhanced SessionManager for secure token management
 * Uses sessionStorage for sensitive data to improve security with localStorage fallback
 * Handles both host and user tokens with proper security measures and cross-tab synchronization
 */
export class SessionManager {
  // Application prefix to avoid collisions with other applications
  static PREFIX = 'app_';
  
  // Session timeout - set to 24 hours in ms
  static SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
  
  // Key constants
  static TOKEN_KEY = `${SessionManager.PREFIX}token`;
  static USER_TOKEN_KEY = `${SessionManager.PREFIX}userToken`;
  static HOST_TOKEN_KEY = `${SessionManager.PREFIX}hostToken`;
  static USER_ROLE_KEY = `${SessionManager.PREFIX}userRole`;
  static REFRESH_TOKEN_KEY = `${SessionManager.PREFIX}refreshToken`;
  
  // Legacy keys (for backward compatibility)
  static LEGACY_TOKEN_KEY = 'token';
  static LEGACY_HOST_TOKEN_KEY = 'hostToken';
  static LEGACY_USER_TOKEN_KEY = 'userToken';
  static LEGACY_REFRESH_TOKEN_KEY = 'refreshToken';
  static LEGACY_USER_ROLE_KEY = 'userRole';
  
  /**
   * Get an item from session storage with proper prefix
   * @param {string} key - The key without prefix
   * @returns {string|null} The value or null if not found
   */
  static getItem(key) {
    if (typeof window === 'undefined') return null;
    
    const prefixedKey = `${SessionManager.PREFIX}${key}`;
    return sessionStorage.getItem(prefixedKey);
  }
  
  /**
   * Set an item in sessionStorage with expiration and prefix
   * @param {string} key - The key without prefix
   * @param {string} value - The value to store
   * @returns {boolean} Success status
   */
  static setItem(key, value) {
    if (typeof window === 'undefined') return false;
    
    try {
      const prefixedKey = `${SessionManager.PREFIX}${key}`;
      
      // Don't update if the value hasn't changed
      if (sessionStorage.getItem(prefixedKey) !== value) {
        sessionStorage.setItem(prefixedKey, value);
      }
      
      // Set expiration timestamp
      const expires = new Date().getTime() + SessionManager.SESSION_TIMEOUT;
      sessionStorage.setItem(`${prefixedKey}_expires`, expires.toString());
      
      return true;
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Remove an item from session storage
   * @param {string} key - The key without prefix
   */
  static removeItem(key) {
    if (typeof window === 'undefined') return;
    
    const prefixedKey = `${SessionManager.PREFIX}${key}`;
    sessionStorage.removeItem(prefixedKey);
    sessionStorage.removeItem(`${prefixedKey}_expires`);
  }
  
  /**
   * Clear all sessionStorage data for this application
   */
  static clear() {
    if (typeof window === 'undefined') return;
    
    // Clear all items with our prefix
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(SessionManager.PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  }
  
  /**
   * Check if a key exists and is not expired
   * @param {string} key - The key without prefix
   * @returns {boolean} True if valid and not expired
   */
  static hasValidItem(key) {
    if (typeof window === 'undefined') return false;
    
    const prefixedKey = `${SessionManager.PREFIX}${key}`;
    const value = sessionStorage.getItem(prefixedKey);
    if (!value) return false;
    
    const expiresStr = sessionStorage.getItem(`${prefixedKey}_expires`);
    if (!expiresStr) return false;
    
    const expires = parseInt(expiresStr, 10);
    return expires > new Date().getTime();
  }
  
  /**
   * Check if user is authenticated with valid token
   * @returns {boolean} True if user authenticated
   */
  static isUserAuthenticated() {
    return SessionManager.hasValidItem('userToken');
  }
  
  /**
   * Check if host is authenticated with valid token
   * @returns {boolean} True if host authenticated
   */
  static isHostAuthenticated() {
    return SessionManager.hasValidItem('hostToken');
  }
  
  /**
   * General authentication check
   * @returns {boolean} True if any valid token exists
   */
  static isAuthenticated() {
    return (
      SessionManager.isUserAuthenticated() || 
      SessionManager.isHostAuthenticated() || 
      SessionManager.hasValidItem('token')
    );
  }
  
  /**
   * Set user token with proper security
   * @param {string} token - User authentication token
   * @returns {boolean} Success status
   */
  static setUserToken(token) {
    if (!token) return false;
    
    SessionManager.setItem('userToken', token);
    SessionManager.setItem('userRole', 'user');
    
    // For backward compatibility, also set the general token
    SessionManager.setItem('token', token);
      
    return true;
  }
  
  /**
   * Set host token with proper security
   * @param {string} token - Host authentication token
   * @returns {boolean} Success status
   */
  static setHostToken(token) {
    if (!token) return false;
    
    SessionManager.setItem('hostToken', token);
    SessionManager.setItem('userRole', 'host');
    
    // For backward compatibility, also set the general token
    SessionManager.setItem('token', token);
    
    // Also store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem(SessionManager.LEGACY_HOST_TOKEN_KEY, token);
    }
    
    return true;
  }
  
  /**
   * Set general token (for backward compatibility)
   * @param {string} token - Authentication token
   * @returns {boolean} Success status
   */
  static setToken(token) {
    if (!token) return false;
    
    SessionManager.setItem('token', token);
    return true;
  }
  
  /**
   * Set refresh token
   * @param {string} token - Refresh token
   * @returns {boolean} Success status
   */
  static setRefreshToken(token) {
    if (!token) return false;
    
    SessionManager.setItem('refreshToken', token);
    return true;
  }
  
  /**
   * Refresh token expiration to extend session
   * @returns {boolean} True if any token was refreshed
   */
  static refreshTokenExpiration() {
    let refreshed = false;
    
    // Check and refresh user token
    if (SessionManager.hasValidItem('userToken')) {
      const token = SessionManager.getItem('userToken');
      SessionManager.setItem('userToken', token); // This updates the expiration
      refreshed = true;
    }
    
    // Check and refresh host token
    if (SessionManager.hasValidItem('hostToken')) {
      const token = SessionManager.getItem('hostToken');
      SessionManager.setItem('hostToken', token); // This updates the expiration
      refreshed = true;
    }
    
    // Also refresh token if using legacy token
    if (SessionManager.hasValidItem('token')) {
      const token = SessionManager.getItem('token');
      SessionManager.setItem('token', token);
      refreshed = true;
    }
    
    // Also refresh other related items if needed
    if (refreshed && SessionManager.hasValidItem('refreshToken')) {
      const refreshToken = SessionManager.getItem('refreshToken');
      SessionManager.setItem('refreshToken', refreshToken);
    }
    
    return refreshed;
  }
  
  /**
   * Transfer auth data from localStorage to sessionStorage if needed
   * @returns {boolean} True if any data was transferred
   */
  static transferFromLocalStorage() {
    if (typeof window === 'undefined') return false;
    
    let transferred = false;
    
    // Check for token in localStorage first
    const token = localStorage.getItem(SessionManager.LEGACY_TOKEN_KEY);
    if (token && !SessionManager.hasValidItem('token')) {
      SessionManager.setItem('token', token);
      transferred = true;
      
      // Also set as user token for new system
      if (!SessionManager.hasValidItem('userToken')) {
        SessionManager.setItem('userToken', token);
        SessionManager.setItem('userRole', 'user');
      }
    }
    
    // Transfer user token if exists
    const userToken = localStorage.getItem(SessionManager.LEGACY_USER_TOKEN_KEY);
    if (userToken && !SessionManager.hasValidItem('userToken')) {
      SessionManager.setItem('userToken', userToken);
      SessionManager.setItem('userRole', 'user');
      transferred = true;
      
      // Also set general token if it doesn't exist
      if (!SessionManager.hasValidItem('token')) {
        SessionManager.setItem('token', userToken);
      }
    }
    
    // Transfer host token if exists
    const hostToken = localStorage.getItem(SessionManager.LEGACY_HOST_TOKEN_KEY);
    if (hostToken && !SessionManager.hasValidItem('hostToken')) {
      SessionManager.setItem('hostToken', hostToken);
      SessionManager.setItem('userRole', 'host');
      transferred = true;
      
      // Also set general token if it doesn't exist
      if (!SessionManager.hasValidItem('token')) {
        SessionManager.setItem('token', hostToken);
      }
    }
    
    // Transfer refresh token if exists
    const refreshToken = localStorage.getItem(SessionManager.LEGACY_REFRESH_TOKEN_KEY);
    if (refreshToken && !SessionManager.hasValidItem('refreshToken')) {
      SessionManager.setItem('refreshToken', refreshToken);
      transferred = true;
    }
    
    // Transfer user role if exists
    const userRole = localStorage.getItem(SessionManager.LEGACY_USER_ROLE_KEY);
    if (userRole && !SessionManager.getItem('userRole')) {
      SessionManager.setItem('userRole', userRole);
      transferred = true;
    }
    
    return transferred;
  }
  
  /**
   * Get user role if available
   * @returns {string} User role or 'guest' if not authenticated
   */
  static getUserRole() {
    return SessionManager.getItem('userRole') || 'guest';
  }
  
  /**
   * Get appropriate token based on current role
   * @returns {string|null} Authentication token or null
   */
  static getToken() {
    // First check for general token (highest priority for backward compatibility)
    if (SessionManager.hasValidItem('token')) {
      return SessionManager.getItem('token');
    }
    
    const role = SessionManager.getUserRole();
    
    if (role === 'host' && SessionManager.hasValidItem('hostToken')) {
      return SessionManager.getItem('hostToken');
    } else if (role === 'user' && SessionManager.hasValidItem('userToken')) {
      return SessionManager.getItem('userToken');
    }
    
    // As a last resort, check localStorage and migrate if found
    if (typeof window !== 'undefined') {
      // Try to transfer from localStorage first
      SessionManager.transferFromLocalStorage();
      
      // Check again after transfer
      if (SessionManager.hasValidItem('token')) {
        return SessionManager.getItem('token');
      }
    }
    
    return null;
  }
  
  /**
   * Get host token specifically (for host-only operations)
   * @returns {string|null} Host token or null
   */
  static getHostToken() {
    if (SessionManager.hasValidItem('hostToken')) {
      return SessionManager.getItem('hostToken');
    }
    
    // Also check localStorage as fallback
    if (typeof window !== 'undefined') {
      const hostToken = localStorage.getItem(SessionManager.LEGACY_HOST_TOKEN_KEY);
      if (hostToken) {
        // Migrate to sessionStorage for future use
        SessionManager.setHostToken(hostToken);
        return hostToken;
      }
    }
    
    return null;
  }
  
  /**
   * Get user token specifically (for user-only operations)
   * @returns {string|null} User token or null
   */
  static getUserToken() {
    if (SessionManager.hasValidItem('userToken')) {
      return SessionManager.getItem('userToken');
    }
    
    // Check localStorage as fallback
    if (typeof window !== 'undefined') {
      const userToken = localStorage.getItem(SessionManager.LEGACY_USER_TOKEN_KEY);
      if (userToken) {
        // Migrate to sessionStorage for future use
        SessionManager.setUserToken(userToken);
        return userToken;
      }
    }
    
    return null;
  }
  
  /**
   * Get refresh token if available
   * @returns {string|null} Refresh token or null
   */
  static getRefreshToken() {
    if (SessionManager.hasValidItem('refreshToken')) {
      return SessionManager.getItem('refreshToken');
    }
    
    // Check localStorage as fallback
    if (typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem(SessionManager.LEGACY_REFRESH_TOKEN_KEY);
      if (refreshToken) {
        // Migrate to sessionStorage for future use
        SessionManager.setRefreshToken(refreshToken);
        return refreshToken;
      }
    }
    
    return null;
  }
  
  /**
   * Log out user - clear user-specific tokens
   */
  static logoutUser() {
    SessionManager.removeItem('userToken');
    
    if (SessionManager.getUserRole() === 'user') {
      SessionManager.removeItem('userRole');
    }
    
    // Also remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SessionManager.LEGACY_USER_TOKEN_KEY);
    }
  }
  
  /**
   * Log out host - clear host-specific tokens
   */
  static logoutHost() {
    SessionManager.removeItem('hostToken');
    
    if (SessionManager.getUserRole() === 'host') {
      SessionManager.removeItem('userRole');
    }
    
    // Also remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SessionManager.LEGACY_HOST_TOKEN_KEY);
    }
  }
  
  /**
   * Complete logout - clear all auth tokens and related data
   */
  static logout() {
    // Clear session items
    const itemsToRemove = [
      'userToken', 'hostToken', 'token', 'refreshToken', 'userRole',
      'hostId', 'hostName', 'hostEmail', 'hostProfileImage'
    ];
    
    itemsToRemove.forEach(key => SessionManager.removeItem(key));
    
    // Also clear localStorage tokens for complete cleanup
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SessionManager.LEGACY_TOKEN_KEY);
      localStorage.removeItem(SessionManager.LEGACY_USER_TOKEN_KEY);
      localStorage.removeItem(SessionManager.LEGACY_HOST_TOKEN_KEY);
      localStorage.removeItem(SessionManager.LEGACY_REFRESH_TOKEN_KEY);
      localStorage.removeItem(SessionManager.LEGACY_USER_ROLE_KEY);
    }
  }
  
  /**
   * Check if a token has expired
   * @param {string} key - Token key
   * @returns {boolean} True if expired or missing
   */
  static isTokenExpired(key) {
    return !SessionManager.hasValidItem(key);
  }
}