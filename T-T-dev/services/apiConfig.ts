import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { TaskQRequestParam } from "./taskQ/TaskQParams";
import { DashboardRequestParam } from "./dashboard/DashboardParams";
import { GlobalParams } from "./GlobalParams";

// --- CONFIGURATION ---
const API_BASE_URL = "https://imsdev.akrais.com:8444/AKRARealityAPI/api";
const DATA_ENDPOINT = "/data/";

// --- AXIOS INSTANCE ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- REQUEST INTERCEPTORS ---
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("taskQ_bearer_token");
      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return config;
  },
  (error: any) => Promise.reject(error),
);

// ---RESPONSE INTERCEPTOR ---
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn(
        "Unauthorized! Clearing storage and redirecting to login...",
      );
      localStorage.removeItem("taskQ_bearer_token");

      // Force redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
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
        ? customEndpoint
        : `/${customEndpoint}`
      : DATA_ENDPOINT;

    const response: AxiosResponse<T> = await apiClient.post(
      normalizedEndpoint,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error(`API Error [${paramType}]:`, error);
    throw error;
  }
};
