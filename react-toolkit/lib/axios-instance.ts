import { refreshSession } from "@/react-toolkit/apis/accounts-me-apis";
import { ARTIFICIAL_DELAY, DEV_JWT_LS_KEY, REQUEST_TIMEOUT } from "@/react-toolkit/constants";
import {
  removeUserSessionLocally,
  setUserSessionLocally,
} from "@/react-toolkit/utils/user-session-utils";
import axios from "axios";
import { toast } from "sonner";

const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept request
axiosInstance.interceptors.request.use(
  (request) => {
    // Attach jwt from LS if app is running in localhost
    if (!import.meta.env.SSR) {
      request.headers["Authorization"] =
        `Bearer ${localStorage.getItem(DEV_JWT_LS_KEY)}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Intercept response
axiosInstance.interceptors.response.use(
  async (response) => {
    // Add artificial delay for DEV env
    if (!import.meta.env.SSR) await sleep(ARTIFICIAL_DELAY);
    // If success just return the response
    return response;
  },
  async (error) => {
    // Keep original request
    const originalRequest = error.config;

    // If response null
    if (!error.response) return Promise.reject(error);

    // If Access Token was expired
    if (
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/verify-2fa-code") &&
      !originalRequest.url.includes("/me/refresh-session") &&
      !originalRequest.url.includes("/me/my-session") &&
      !originalRequest.url.includes("/me/logoff") &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const newSession = await refreshSession();
      if (newSession) {
        setUserSessionLocally(newSession.data);
      }
      return axiosInstance(originalRequest);
    }

    // Define errorMessage variable
    let errorMessage = "";

    // Error is a string
    if (typeof error.response.data == "string") {
      errorMessage = error.response.data;
    }

    // Error is an object
    if (typeof error.response.data == "object") {
      // Log the validations errors. NOTE: Errors array is going to have lot of different types of error with differnt object and names so we are just logging the errors array.
      console.log(error.response.data.errors);

      // Get the only title of the error object if available.
      errorMessage = error.response.data.title
        ? error.response.data.title
        : "Something went wrong. Please try again later";
    }

    // Return toast notification basis Http Status code
    switch (error.response.status) {
      case 400:
      case 409:
      case 429:
        return Promise.reject(errorMessage); // Return just the error message so that it can be used in the component to show toast notification and take action accordingly
      case 401:
        toast.error(errorMessage);

        // Remove user session from local storage and redirect to login page
        removeUserSessionLocally(true);
        break;
      case 403:
        toast.error(errorMessage);
        break;
      case 404:
        toast.error(errorMessage);
        // TODO: Route to 404 page
        break;
      case 500:
        toast.error(errorMessage);
        // TODO: Route to 500 page
        break;
      default:
        toast.error(error.response.status + " Error", {
          description: errorMessage,
        });
    }
    return Promise.reject(error);
  },
);

function sleep(ms = 2000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { axiosInstance };

