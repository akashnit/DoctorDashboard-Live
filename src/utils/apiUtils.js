/**
 * apiUtils.js - Compatibility file
 * 
 * This file exists for backward compatibility with code that still imports from apiUtils.js
 * It re-exports all exports from the new apiRequest.js and apiError.js files.
 */

// Re-export everything from the new files
export * from './apiRequest';
export * from './apiError';

// Log a warning about the deprecated import
console.warn('Importing from apiUtils.js is deprecated. Please update your imports to use apiRequest.js or apiError.js directly.'); 