import { refreshSession } from "@/react-toolkit/apis/accounts-me-apis";
import {
  DEV_JWT_LS_KEY,
  INVALID_CREDS,
  REQUEST_TIMEOUT,
} from "@/react-toolkit/constants";
import { redirectToLoginOn401Util } from "@/react-toolkit/utils/redirect-util";
import { sleep } from "@/react-toolkit/utils/sleep-util";
import axios from "axios";
import { toast } from "sonner";

/**
 * Creates an Axios instance with predefined configuration.
 *
 * The instance is configured with:
 * - A timeout specified by the `REQUEST_TIMEOUT` constant.
 * - Default headers including `Content-Type` set to `application/json`.
 *
 * @constant {AxiosInstance} axiosInstance - The configured Axios instance.
 */
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Intercept request and add JWT token to the header if its DEV env
axiosInstance.interceptors.request.use(
  (request) => {
    // Attach jwt from LS if its DEV env
    if (import.meta.env.DEV) {
      request.headers["Authorization"] =
        `Bearer ${localStorage.getItem(DEV_JWT_LS_KEY)}`;
    }

    // Include cookies with the request
    request.withCredentials = true;

    return request;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Intercept response and handle errors
axiosInstance.interceptors.response.use(
  async (response) => {
    // Artificial delay for development
    if (import.meta.env.DEV) await sleep(import.meta.env.VITE_ARTIFICIAL_DELAY);

    return response;
  },
  async (error) => {
    // Set original request
    const originalRequest = error.config;

    // If response null
    if (!error.response) return Promise.reject(error);

    // If response status is 401 and request is not login, verify-2fa-code, refresh-session, my-session, logoff
    if (
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/verify-2fa-code") &&
      !originalRequest.url.includes("/me/refresh-session") &&
      !originalRequest.url.includes("/me/my-session") &&
      !originalRequest.url.includes("/me/logoff") &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      // Set original request retry to true
      originalRequest._retry = true;

      // Refresh the session
      await refreshSession();

      // Return the original request
      return axiosInstance(originalRequest);
    }

    // Set empty error message
    let errorMessage = "";

    // If error response data is string
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

        // Redirect to login page if error is not "Invalid credentials"
        if (errorMessage !== INVALID_CREDS) redirectToLoginOn401Util();
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

export { axiosInstance };
