import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  saveRefreshToken,
  removeAccessToken,
  removeRefreshToken,
} from "./authStorage";
import { notifyAuthExpired } from "./authEvents";

// main api
export const api = axios.create({
  baseURL: "http://192.168.29.61:5000/api",
  timeout: 10000,
});

// refresh api
export const refreshApi = axios.create({
  baseURL: "http://192.168.29.61:5000/api",
  timeout: 10000,
});

// refresh state
let isRefreshing = false;
type FailedRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let failedQueue: FailedRequest[] = [];

// process queue
const processQueue = ( error: unknown, token: string | null = null ) => {
  failedQueue.forEach((request) => {
    if(error) {
      request.reject(error);
    } else if(token) {
      request.resolve(token);
    }
  });

  failedQueue = [];
}

// request interceptor
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
},
(error)=>{
  return Promise.reject(error);
}
);

// request interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // ignore Non-401 errors
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry the same request twice
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Another request is already refreshing
    if (isRefreshing) {
      console.log("Refresh already in progress. Queueing request.");
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token}`;

            resolve(api(originalRequest));
          },

          reject,
        });
      });
    }

    // Start refresh process
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await getRefreshToken();
      
      // Refresh token doesn't exist
      if (!refreshToken) {
        console.log("No refresh token available");

        const sessionError = new Error("Session expired. Please login again.");

        processQueue(sessionError);

        await removeAccessToken();
        await removeRefreshToken();

        notifyAuthExpired();

        return Promise.reject(sessionError);
      }

      console.log("Access token expired. Refreshing...");

      // Request new token
      const response = await refreshApi.post(
        "/refresh-token",
        {},
        {
          headers: {
            "x-refresh-token": refreshToken,
          },
        }
      );

      const newAccessToken = response.data.data.accessToken;
      const newRefreshToken = response.data.data.refreshToken;

      console.log("New access token received");

      // Save tokens
      await saveAccessToken(newAccessToken);
      await saveRefreshToken(newRefreshToken);

      // Resolve queue requests
      processQueue(null, newAccessToken);

      // Retry original request
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      console.log("Refresh token failed");

      // Reject queue requests
      processQueue(refreshError, null);

      // Clear Authentication
      await removeAccessToken();
      await removeRefreshToken();

      // Tell AuthContext that session has expired
      notifyAuthExpired();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);