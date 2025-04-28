// API Error handling utilities

/**
 * Makes a proper error message from various error types
 * @param {Error|string|object} error - The error to format
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return "An unknown error occurred";
  if (typeof error === 'string') return error;
  if (error.response && error.response.data && error.response.data.message) return error.response.data.message;
  if (error.message) return error.message;
  return "An unknown error occurred";
};

/**
 * Creates a custom error object for API errors
 */
export class ApiError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
  }
}

/**
 * Create a connection error
 */
export const createConnectionError = (message = "Cannot connect to the server") => {
  return new ApiError(message, 0, { type: 'connection' });
};

/**
 * Create an authentication error
 */
export const createAuthError = (message = "Authentication required") => {
  return new ApiError(message, 401, { type: 'auth' });
};

/**
 * Create a rate limit error
 */
export const createRateLimitError = (waitTime = 30) => {
  return new ApiError(
    `Rate limit exceeded. Please try again after ${waitTime} seconds.`, 
    429, 
    { type: 'rateLimit', waitTime }
  );
};

/**
 * Check if error is a specific type
 */
export const isApiError = (error, type = null) => {
  if (!(error instanceof ApiError)) return false;
  if (type && error.details?.type !== type) return false;
  return true;
};

/**
 * Parse error and return appropriate user-friendly message
 */
export const getErrorFeedback = (error) => {
  // Connection errors
  if (error.message.includes("Failed to fetch") || 
      error.message.includes("NetworkError") ||
      error.message.includes("Cannot connect")) {
    return {
      title: "Connection Error",
      message: "Cannot connect to the server. Please check your internet connection.",
      type: "connection"
    };
  }
  
  // Authentication errors
  if (error.message.includes("401") || 
      error.message.includes("403") ||
      error.message.includes("Authentication required") ||
      error.message.includes("login")) {
    return {
      title: "Authentication Error",
      message: "You need to login again to continue.",
      type: "auth"
    };
  }
  
  // Rate limiting errors
  if (error.message.includes("429") || 
      error.message.includes("Too Many Requests") ||
      error.message.includes("Rate limit")) {
    return {
      title: "Rate Limit Reached",
      message: "Too many requests. Please wait a moment before trying again.",
      type: "rateLimit"
    };
  }
  
  // Generic error
  return {
    title: "Error",
    message: formatErrorMessage(error),
    type: "unknown"
  };
};

/**
 * Helper function to run diagnostics on API connections
 */
export const runApiDiagnostics = async (apiBaseUrl) => {
  console.log("Running API connection diagnostics...");
  
  try {
    // Test basic connectivity with HEAD request
    console.log("Testing basic connectivity...");
    const headResponse = await fetch(apiBaseUrl, { 
      method: 'HEAD',
      mode: 'cors',
      signal: AbortSignal.timeout(3000)
    });
    
    console.log(`HEAD request status: ${headResponse.status}`);
    
    // Test CORS setup with OPTIONS request
    console.log("Testing CORS preflight...");
    try {
      const optionsResponse = await fetch(apiBaseUrl, { 
        method: 'OPTIONS',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000)
      });
      
      console.log(`OPTIONS request status: ${optionsResponse.status}`);
      
      if (optionsResponse.status >= 200 && optionsResponse.status < 300) {
        console.log("CORS preflight successful");
      } else {
        console.warn("CORS preflight returned non-success status code");
      }
    } catch (corsError) {
      console.error("CORS preflight failed:", corsError);
    }
    
    // Check internet connectivity as a comparison
    try {
      const internetResponse = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: AbortSignal.timeout(3000)
      });
      
      console.log("Internet connectivity test: successful");
    } catch (internetError) {
      console.error("Internet connectivity test failed:", internetError);
    }
    
    console.log("Diagnostics completed");
    return {
      success: true,
      message: "Diagnostics completed. Check console for results."
    };
  } catch (error) {
    console.error("Diagnostics failed:", error);
    return {
      success: false,
      message: `Diagnostics failed: ${error.message}`
    };
  }
}; 