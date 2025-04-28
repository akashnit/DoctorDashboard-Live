// API Request utility for making HTTP requests to the backend
import { formatErrorMessage } from './apiError';

// Use a CORS proxy for development - set to false for production
const USE_CORS_PROXY = false;
const CORS_PROXY = "https://corsproxy.io/?";

// Request throttling to prevent rate limiting
const MIN_REQUEST_INTERVAL = 800; // milliseconds between requests
let lastRequestTime = 0;

// Get base API URL from environment or use default
export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || "http://localhost:8080";

// Common API endpoints
export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/v1/auth/refresh-token`,
  DOCTORS: `${API_BASE_URL}/api/v1/admin/doctors`,
  DOCTOR_DELETE: (doctorId) => `${API_BASE_URL}/api/v1/admin/doctor/${doctorId}`,
  ADD_DOCTOR: `${API_BASE_URL}/api/v1/admin/doctor`,
  PATIENTS: `${API_BASE_URL}/api/v1/admin/patients`,
  PATIENT_DELETE: (patientId) => `${API_BASE_URL}/api/v1/admin/patient/${patientId}`,
  ADD_PATIENT: `${API_BASE_URL}/api/v1/admin/patient`,
  PATIENT_DETAILS: (patientId) => `${API_BASE_URL}/api/v1/admin/patients/${patientId}`,
  ASSIGN_PATIENT_TO_DOCTOR: `${API_BASE_URL}/api/v1/admin/assign-patient`,
  DOCTORS_BY_PROGRAM: (programId) => `${API_BASE_URL}/api/v1/programs/${programId}/doctors`,
  PROGRAMS: `${API_BASE_URL}/api/v1/programs`,
  PROGRAM_STATS: (programId) => `${API_BASE_URL}/api/v1/programs/${programId}/stats`,
  BACKEND_STATUS: `${API_BASE_URL}/api/v1/health`,
  ADMIN_DASHBOARD_STATS: `${API_BASE_URL}/api/v1/admin/dashboard`,
  ADMIN_DOCTOR_PATIENT: (doctorId) => `${API_BASE_URL}/api/v1/admin/doctor/${doctorId}/patients`,

  
  // Patient dashboard endpoints
  PATIENT_PROFILE: `${API_BASE_URL}/api/v1/patient/profile`,
  LEADERBOARD: `${API_BASE_URL}/api/v1/patient/leaderboard`,
  REWARDS: `${API_BASE_URL}/api/v1/patient/rewards`,
  REFERRAL_CODE: `${API_BASE_URL}/api/v1/patient/referral`,
  //HEALTH_PROGRESS: `${API_BASE_URL}/api/v1/patient/health-progress`,
  UPDATE_PATIENT_PROFILE: `${API_BASE_URL}/api/v1/patient/profile`,
  PATIENT_PROGRAMS: `${API_BASE_URL}/api/v1/patient/programs`,

  // Doctor dashboard endpoints
  DOCTOR_PROFILE: `${API_BASE_URL}/api/v1/doctor/profile`,
  DOCTOR_PROGRAMS: `${API_BASE_URL}/api/v1/doctor/programs`,
  DOCTOR_PATIENTS: (doctorId) => `${API_BASE_URL}/api/v1/doctor/patients`,
  DOCTOR_EARNINGS: `${API_BASE_URL}/api/v1/doctor/earnings`,
  UPDATE_DOCTOR_PROFILE: `${API_BASE_URL}/api/v1/doctor/profile`,
  UPDATE_PATIENT_STATUS: (patientId) => `${API_BASE_URL}/api/v1/doctor/patients/${patientId}`,
  PATIENT: (patientId) => `${API_BASE_URL}/api/v1/patients/${patientId}`,
  ADD_PROGRAM: `${API_BASE_URL}/api/v1/programs`, // Ensure this is correct
};

// Helper function to get the auth token
export const getAuthToken = () => {
  // Try to get token from both possible storage keys
  const accessToken = localStorage.getItem("accessToken");
  const token = localStorage.getItem("token");
  
  // Return the first valid token found
  return accessToken || token;
};

// Function to refresh token if needed
export const refreshTokenIfNeeded = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      console.log("No refresh token found in localStorage");
      return null;
    }
    
    console.log("Attempting to refresh token using refresh token");
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error("Token refresh failed with status:", response.status);
      // If refresh token is invalid or expired, clear storage
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }
      return null;
    }
    
    const data = await response.json();
    if (data.data && data.data.accessToken) {
      console.log("New access token received successfully");
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("token", data.data.accessToken);
      if (data.data.refreshToken) {
        localStorage.setItem("refreshToken", data.data.refreshToken);
      }
      return data.data.accessToken;
    }
    
    console.warn("Refresh response did not contain a new access token");
    return null;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
};

// Function to introduce throttling delay between requests
const throttleRequests = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  const delayNeeded = Math.max(MIN_REQUEST_INTERVAL - timeSinceLastRequest, 300);
  
  if (delayNeeded > 0) {
    console.log(`Throttling request by ${delayNeeded}ms to prevent rate limiting`);
    await new Promise(resolve => setTimeout(resolve, delayNeeded));
  }
  
  lastRequestTime = Date.now();
};

// Main API request function
export const apiRequest = async (url, method = 'GET', body = null, includeCredentials = true) => {
  // Apply request throttling to prevent rate limiting
  await throttleRequests();
  
  // Get token
  const token = getAuthToken();
  
  // If no token is found and we're not making a refresh or login request, 
  // attempt to refresh the token first
  if (!token && !url.includes('refresh-token') && !url.includes('login')) {
    try {
      console.log("No token found, attempting to refresh...");
      const newToken = await refreshTokenIfNeeded();
      if (newToken) {
        console.log("Token successfully refreshed");
      } else {
        console.log("Could not refresh token, user may need to login again");
        throw new Error("Authentication required. Please login again.");
      }
    } catch (refreshError) {
      console.error("Error during token refresh:", refreshError);
      throw new Error("Authentication required. Please login again.");
    }
  }
  
  // Apply CORS proxy if enabled for development
  const requestUrl = USE_CORS_PROXY ? `${CORS_PROXY}${encodeURIComponent(url)}` : url;
  
  // Set up default options with auth token
  const defaultOptions = {
    method,
    headers: {
      "Content-Type": "application/json"
    }
  };
  
  // Add credentials if needed
  if (includeCredentials) {
    defaultOptions.credentials = "include";
  }
  
  // Add authorization header if we have a token
  if (token) {
    defaultOptions.headers["Authorization"] = `Bearer ${token}`;
  }
  
  // Add body if provided
  if (body) {
    defaultOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  
  try {
    console.log(`Sending ${method} request to ${requestUrl}`, { 
      withCredentials: includeCredentials,
      hasAuthHeader: !!token
    });
    
    const response = await fetch(requestUrl, defaultOptions);
    
    // Handle 429 Too Many Requests (rate limiting)
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const suggestedWaitTime = retryAfter ? parseInt(retryAfter) : 30;
      
      const errorData = await response.json()
        .catch(() => ({ message: `Rate limit exceeded. Please try again after ${suggestedWaitTime} seconds.` }));
      
      throw new Error(errorData.message || `Rate limit exceeded. Please try again after ${suggestedWaitTime} seconds.`);
    }
    
    // Handle 401 Unauthorized (token expired)
    if (response.status === 401) {
      console.log("Received 401 response, attempting to refresh token");
      // Try to refresh token
      const newToken = await refreshTokenIfNeeded();
      if (!newToken) {
        throw new Error("Session expired. Please login again.");
      }
      
      // Update authorization header with new token
      defaultOptions.headers.Authorization = `Bearer ${newToken}`;
      
      console.log("Token refreshed, retrying request with new token");
      // Retry the request with new token
      const retryResponse = await fetch(requestUrl, defaultOptions);
      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({ message: `Request failed with status: ${retryResponse.status}` }));
        throw new Error(errorData.message || `Request failed with status: ${retryResponse.status}`);
      }
      
      const data = await retryResponse.json();
      return data;
    }
    
    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Request failed with status: ${response.status}` }));
      throw new Error(errorData.message || `Request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // Check for specific error types
    if (error.message === "Failed to fetch") {
      console.error("Network error:", error);
      throw new Error("Cannot connect to the server. Please check your connection and try again.");
    }
    
    console.error(`API Request Error for ${requestUrl}:`, error);
    throw error;
  }
};

// Check if the backend server is running
export const checkBackendStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    
    if (response.ok || response.status === 401) {
      return { online: true, message: "Backend server is running" };
    }
    
    return { online: false, message: "Backend server appears to be offline" };
  } catch (error) {
    return { 
      online: false, 
      message: "Cannot connect to the backend server. It may be offline."
    };
  }
};

// Batch request utility - for making multiple requests with throttling
export const batchRequest = async (items, requestFn, options = {}) => {
  const batchSize = options.batchSize || 2;
  const delayBetweenBatches = options.delayBetweenBatches || 2000;
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    const batchPromises = batch.map(item => {
      return requestFn(item).catch(error => {
        console.error(`Error processing item: `, error);
        return null;
      });
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  return results;
}; 