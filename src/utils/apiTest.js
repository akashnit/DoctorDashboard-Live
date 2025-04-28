/**
 * API Test Utility
 * Use this script to test connectivity to the backend and diagnose CORS issues
 * 
 * To use:
 * 1. Open browser console
 * 2. Run: import('/src/utils/apiTest.js').then(m => m.runDiagnostics())
 */

import { API_BASE_URL } from './apiRequest';
import { runApiDiagnostics } from './apiError';

// Endpoints to test
const TEST_ENDPOINTS = [
  { name: "Health Check", url: `${API_BASE_URL}/health`, requiresAuth: false },
  { name: "Programs List", url: `${API_BASE_URL}/api/v1/programs`, requiresAuth: true },
  { name: "Root", url: API_BASE_URL, requiresAuth: false }
];

// Styles for console logs
const styles = {
  heading: "font-size: 16px; font-weight: bold; color: #3b82f6;",
  subheading: "font-size: 14px; font-weight: bold; color: #1e40af;",
  success: "color: #16a34a; font-weight: bold;",
  error: "color: #dc2626; font-weight: bold;",
  info: "color: #4b5563;",
  warning: "color: #f59e0b; font-weight: bold;"
};

export const runDiagnostics = async () => {
  console.log("%c🔍 API Connectivity Diagnostics", styles.heading);
  console.log("%cFrontend URL:", styles.info, window.location.origin);
  console.log("%cBackend URL:", styles.info, API_BASE_URL);
  
  // Use the centralized diagnostic function
  const result = await runApiDiagnostics(API_BASE_URL);
  
  // Summarize results
  console.log("\n%c📊 Diagnostics Summary", styles.subheading);
  
  if (result.success) {
    console.log("%c✅ Diagnostics completed successfully", styles.success);
  } else {
    console.log(`%c❌ Diagnostics failed: ${result.message}`, styles.error);
  }
  
  // Provide recommendations
  console.log("\n%c🔧 Recommended Actions", styles.subheading);
  console.log("1. Verify that the backend server is running at " + API_BASE_URL);
  console.log("2. Check server/app.js to ensure CORS is configured correctly:");
  console.log(`   - origin should include "${window.location.origin}"`);
  console.log("   - credentials should be true if using cookies");
  console.log("3. Check specific endpoint configurations and permissions");
  console.log("4. Verify authentication tokens if accessing protected routes");
  
  console.log("%c\n✨ Diagnostics complete. Use this information to troubleshoot your connection issues.", styles.subheading);
  return "Diagnostics complete. See console for detailed results.";
};

// Helper function to test CORS proxy
export const testCorsProxy = async () => {
  console.log("%c🔄 Testing CORS Proxy", styles.heading);
  
  const corsProxy = "https://corsproxy.io/?";
  const endpoints = TEST_ENDPOINTS.slice(0, 2); // Just test first two endpoints
  
  for (const endpoint of endpoints) {
    const url = endpoint.url;
    const proxiedUrl = `${corsProxy}${encodeURIComponent(url)}`;
    
    console.log(`\n%cTesting endpoint via CORS proxy: ${endpoint.name}`, styles.subheading);
    console.log("Original URL:", url);
    console.log("Proxied URL:", proxiedUrl);
    
    try {
      const response = await fetch(proxiedUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log("Response status:", response.status);
      if (response.ok || response.status === 401) {
        console.log(`%c✅ Success through CORS proxy: ${response.status}`, styles.success);
        
        if (response.status === 200) {
          try {
            const data = await response.json();
            console.log("Response data:", data);
          } catch (err) {
            console.log("Could not parse response as JSON");
          }
        }
        
        console.log("%c✅ CORS proxy works for this endpoint!", styles.success);
        console.log("%cYou can enable the CORS proxy in apiRequest.js by setting USE_CORS_PROXY to true", styles.info);
      } else {
        console.log(`%c❌ CORS proxy request failed with status: ${response.status}`, styles.error);
      }
    } catch (error) {
      console.log(`%c❌ CORS proxy request error: ${error.message}`, styles.error);
    }
  }
  
  return "CORS proxy test complete. See console for results.";
};

// Run diagnostics automatically if script is loaded directly
if (typeof window !== 'undefined' && window.runAPIDiagnostics === true) {
  runDiagnostics();
}

export default { runDiagnostics, testCorsProxy }; 