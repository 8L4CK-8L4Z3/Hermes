import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Don't redirect on /me endpoint 401s
    if (error.response?.status === 401 && !error.config.url.endsWith("/me")) {
      // Clear any cached auth state
      if (window.__queryClient) {
        window.__queryClient.setQueryData(["currentUser"], null);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
