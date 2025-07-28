// frontend/src/lib/api.ts

import axios, { AxiosInstance } from 'axios';

// Create a basic Axios instance without any interceptors initially
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// A function to set up interceptors dynamically
// This will be called by AuthContext to inject token and logout logic
let requestInterceptorId: number | null = null; // To keep track of request interceptor
let responseInterceptorId: number | null = null; // To keep track of response interceptor

export const setupInterceptors = (token: string | null, logoutFn: (isSessionExpired?: boolean) => void) => {
  console.log('SETUP_INTERCEPTORS: Setting up with token:', token ? 'present' : 'null');
  
  // Eject any existing interceptors to prevent duplicates on re-render/re-init
  if (requestInterceptorId !== null) {
    apiClient.interceptors.request.eject(requestInterceptorId);
    requestInterceptorId = null;
  }
  if (responseInterceptorId !== null) {
    apiClient.interceptors.response.eject(responseInterceptorId);
    responseInterceptorId = null;
  }

  // Request interceptor: Add JWT token to headers if available
  requestInterceptorId = apiClient.interceptors.request.use(
    (config) => {
      if (token) { // Use the token passed from AuthContext state
        config.headers.Authorization = `Bearer ${token}`;
        console.log('REQUEST_INTERCEPTOR: Added token to request');
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: Handle 401 Unauthorized errors globally
  responseInterceptorId = apiClient.interceptors.response.use(
    (response) => response, // Just return response on success
    async (error) => {
      // If error is an Axios error and status is 401
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        console.error('API CLIENT INTERCEPTOR: Caught 401 Unauthorized. Triggering logout.');
        // Call the logout function provided by AuthContext, signaling session expiry
        logoutFn(true); // This will clear token, set authError, and call router.push('/login')

        // --- CRITICAL CHANGE: DO NOT RE-THROW THE ERROR IF WE ARE REDIRECTING ---
        // Returning a new Promise.reject() or throwing here would cause the individual
        // fetch calls (e.g., fetchJournalEntries) to catch the error and log it again.
        // We want the interceptor to *handle* it and prevent further processing.
        return new Promise(() => {}); // Return a never-resolving/never-rejecting promise to effectively stop propagation
        // Alternatively, a less aggressive approach might be:
        // throw new axios.Cancel('Operation canceled by interceptor due to 401.');
        // But a silent "hang" is often effective for preventing downstream errors.
      }
      // Re-throw the error for other types of errors (e.g., 404, 500, network errors)
      // These should still propagate and be handled by individual page's error logic
      return Promise.reject(error);
    }
  );
};

export default apiClient;