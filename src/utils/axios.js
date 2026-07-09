import axios from "axios";
import { BASE_URL } from '../utils/constants'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(

  response => response,

  async error => {

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      originalRequest._retry = true;
      await api.post("/refresh-token");
      return api(originalRequest);
    }

    return Promise.reject(error);

  }
);

export default api;