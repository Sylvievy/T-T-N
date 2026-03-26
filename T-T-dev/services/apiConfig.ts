import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { TaskQRequestParam } from "./taskQ/TaskQParams";
import { DashboardRequestParam } from "./dashboard/DashboardParams";
import { GlobalParams } from "./GlobalParams";

// --- CONFIGURATION ---
const API_BASE_URL = "https://taskq-api.onrender.com/api/";
const DATA_ENDPOINT = "/tasks/";

// --- AXIOS INSTANCE ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- REQUEST INTERCEPTORS ---
// services/apiConfig.ts

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Only attempt refresh if it's a 401 and not already a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("taskQ_refresh_token");

      // If no refresh token exists, don't even try; just redirect to login
      if (!refreshToken) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const resp = await axios.post(
          "https://taskq-api.onrender.com/api/refresh-token",
          {
            refreshToken: refreshToken,
          },
        );

        const { token } = resp.data;
        localStorage.setItem("taskQ_bearer_token", token);

        isRefreshing = false;
        processQueue(null, token);

        originalRequest.headers["Authorization"] = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        logoutUser();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ---RESPONSE INTERCEPTOR ---
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a refresh is already in progress, wait in the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem("taskQ_refresh_token");

      // Inside the interceptor refresh logic
      const firstName = localStorage.getItem("taskQ_firstName") || "";
      const lastName = localStorage.getItem("taskQ_lastName") || "";

      // Combine them
      const fullName = `${firstName} ${lastName}`.trim();

      console.log("Refreshing for user:", fullName);

      if (refreshToken) {
        try {
          // Call your refresh-token endpoint
          const resp = await axios.post(
            "https://taskq-api.onrender.com/api/refresh-token",
            {
              refreshToken: refreshToken,
            },
          );

          const { token } = resp.data;
          isRefreshing = false;
          processQueue(null, token);
          // Update storage with the new access token
          localStorage.setItem("taskQ_bearer_token", token);

          // Update the failed request header and retry it
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token expired. Logging out...");
          logoutUser();
          isRefreshing = false;
          processQueue(refreshError, null);
          if (typeof window !== "undefined") window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export type AppRequestParam =
  | TaskQRequestParam
  | DashboardRequestParam
  | GlobalParams;

interface ApiPayload {
  RequestParamType: AppRequestParam;
  [key: string]: any;
}

export const postRequest = async <T>(
  paramType: AppRequestParam,
  extraData: object = {},
  customEndpoint?: string,
): Promise<T> => {
  try {
    const payload: ApiPayload = {
      RequestParamType: paramType,
      ...extraData,
    };
    const normalizedEndpoint = customEndpoint
      ? customEndpoint.startsWith("/")
        ? customEndpoint.substring(1)
        : customEndpoint
      : "tasks";

    const isUpdate = normalizedEndpoint.includes("update-data");

    const response: AxiosResponse<any> = isUpdate
      ? await apiClient.put(normalizedEndpoint, payload)
      : await apiClient.post(normalizedEndpoint, payload);

    const result = Array.isArray(response.data?.data)
      ? response.data.data
      : response.data?.data || response.data;

    return result as T;
  } catch (error) {
    console.error(`API Error [${paramType}]:`, error);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("taskQ_bearer_token");
  localStorage.removeItem("taskQ_refresh_token");
  localStorage.removeItem("taskQ_firstName"); // Clear this
  localStorage.removeItem("taskQ_lastName"); // Clear this
  localStorage.removeItem("taskQ_user_id");
};
