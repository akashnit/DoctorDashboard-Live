import React, { useState, useEffect } from 'react';
import { checkBackendStatus } from '../utils/apiRequest';
import { runApiDiagnostics } from '../utils/apiError';

const ServerStatusBanner = ({ status, error, onRetry }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [detailedStatus, setDetailedStatus] = useState(null);
  
  useEffect(() => {
    // Run a more detailed status check when the banner is shown
    if (status === "offline") {
      (async () => {
        try {
          const statusDetails = await checkBackendStatus();
          console.log("Detailed status check:", statusDetails);
          setDetailedStatus(statusDetails);
        } catch (err) {
          console.error("Error getting detailed status:", err);
        }
      })();
    }
  }, [status]);
  
  const runDiagnostic = async () => {
    setRunningDiagnostic(true);
    try {
      const result = await runApiDiagnostics();
      setDiagnosticResult("Diagnostics complete. Check your browser console for results.");
    } catch (err) {
      setDiagnosticResult(`Error running diagnostics: ${err.message}`);
    } finally {
      setRunningDiagnostic(false);
    }
  };
  
  const getErrorIcon = () => {
    if (detailedStatus?.networkIssue) {
      // Network/internet issue icon
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
      );
    } else if (detailedStatus?.likelyCorsIssue) {
      // CORS issue icon
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    }
    // Default error icon
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  };
  
  const getErrorTitle = () => {
    if (detailedStatus?.networkIssue) return "Internet Connection Issue";
    if (detailedStatus?.likelyCorsIssue) return "CORS Configuration Issue";
    return "Server Connection Issue";
  };
  
  const getTroubleshootingSteps = () => {
    if (detailedStatus?.networkIssue) {
      return (
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Check your device's internet connection</li>
          <li>Ensure your network allows connections to the backend server</li>
          <li>Try disabling any VPN or proxy services</li>
          <li>Restart your browser or try a different browser</li>
        </ol>
      );
    }
    
    if (detailedStatus?.likelyCorsIssue) {
      return (
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li><strong>This is likely a CORS configuration issue</strong></li>
          <li>Verify that the backend server is running at http://localhost:8080</li>
          <li>Check that CORS is properly configured on the server to allow requests from http://localhost:5173</li>
          <li>Restart the backend server after making CORS configuration changes</li>
          <li>Check the browser console (F12) for specific CORS error messages</li>
        </ol>
      );
    }
    
    return (
      <ol className="list-decimal list-inside space-y-1 text-sm">
        <li>Ensure the backend server is running at http://localhost:8080</li>
        <li>Check that the server has CORS properly configured to accept requests from http://localhost:5173</li>
        <li>Verify your internet connection</li>
        <li>Check the browser console for additional error details</li>
      </ol>
    );
  };
  
  if (status !== "offline") return null;
  
  return (
    <div className="my-4 p-4 bg-red-100 text-red-700 rounded-md shadow">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {getErrorIcon()}
          <h3 className="font-bold">{getErrorTitle()}</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-red-700 hover:text-red-800 font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      <p className="mt-2">{detailedStatus?.message || error || "Cannot connect to the backend server."}</p>
      
      {showDetails && (
        <div className="mt-4 p-3 bg-white rounded border border-red-200">
          <h4 className="font-semibold mb-2">Troubleshooting Steps:</h4>
          {getTroubleshootingSteps()}
          
          <div className="mt-4 flex space-x-3">
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry Connection
            </button>
            
            <button
              onClick={runDiagnostic}
              disabled={runningDiagnostic}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
            >
              {runningDiagnostic ? "Running..." : "Run Diagnostics"}
            </button>
          </div>
          
          {diagnosticResult && (
            <div className="mt-3 p-2 bg-gray-100 text-sm rounded">
              {diagnosticResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ServerStatusBanner; 