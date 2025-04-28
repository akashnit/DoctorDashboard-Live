# API Utilities

This directory contains utilities for handling API requests and error handling.

## Overview

- `apiRequest.js`: Contains functions for making HTTP requests to the backend
- `apiError.js`: Contains functions for handling and formatting API errors
- `apiTest.js`: Contains diagnostic utilities for testing API connectivity

## Usage

### Making API Requests

```js
import { apiRequest, ENDPOINTS } from '../utils/apiRequest';

// Simple GET request
const fetchData = async () => {
  try {
    const result = await apiRequest(ENDPOINTS.PROGRAMS);
    return result.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// POST request with body
const createData = async (data) => {
  try {
    const result = await apiRequest(
      ENDPOINTS.ADD_DOCTOR,
      'POST',
      data
    );
    return result.data;
  } catch (error) {
    console.error("Error creating data:", error);
  }
};
```

### Handling Errors

```js
import { getErrorFeedback, formatErrorMessage } from '../utils/apiError';

try {
  // API request that could fail
  const result = await apiRequest(ENDPOINTS.DOCTORS);
} catch (err) {
  // Get user-friendly error feedback
  const errorFeedback = getErrorFeedback(err);
  
  // Handle different error types
  if (errorFeedback.type === "connection") {
    // Handle connection errors
  } else if (errorFeedback.type === "auth") {
    // Handle authentication errors
  } else if (errorFeedback.type === "rateLimit") {
    // Handle rate limiting errors
  } else {
    // Handle generic errors
  }
  
  // Display error message to user
  setError(errorFeedback.message);
}
```

### Checking Backend Status

```js
import { checkBackendStatus } from '../utils/apiRequest';

const checkConnection = async () => {
  try {
    const status = await checkBackendStatus();
    if (status.online) {
      console.log("Backend server is online!");
    } else {
      console.error("Backend server appears to be offline:", status.message);
    }
  } catch (err) {
    console.error("Error checking server status:", err);
  }
};
```

### Running Diagnostics

```js
import { runApiDiagnostics } from '../utils/apiError';

const diagnoseConnection = async () => {
  try {
    const result = await runApiDiagnostics();
    console.log("Diagnostics complete:", result);
  } catch (err) {
    console.error("Error running diagnostics:", err);
  }
};
```

## Key Features

- Automatic token refresh
- Request throttling to prevent rate limiting
- Centralized error handling and formatting
- Backend connectivity checks
- Batch request processing with throttling 