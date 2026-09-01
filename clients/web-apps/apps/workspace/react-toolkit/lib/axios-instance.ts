import { INVALID_CREDS, REQUEST_TIMEOUT } from "@avplatform/ui/constants";
import { toast } from "@avplatform/ui/sonner";
import { redirectToLoginOn401Util, sleep } from "@avplatform/ui/utils";
import axios from "axios";

import { refreshSession } from "@/react-toolkit/apis/accounts-me-apis";

// Identifies this app to the AccountsAPI on every request so role lists are scoped
// to this app. Mirrors PlatformAppsEnum in the backend `AccountsAPIs/Enums/PlatformAppsEnum.cs`.
const APP_CONTEXT_HEADER = "X-App-Context";
const APP_CODE = "workspace";

const getErrorMessageFromResponseData = (responseData: unknown): string => {
  // Standard: errors are plain text strings
  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  return "Something went wrong. Please try again later";
};

/**
 * Creates an Axios instance with predefined configuration.
 *
 * The instance is configured with:
 * - A timeout specified by the `REQUEST_TIMEOUT` constant.
 *
 * @constant {AxiosInstance} axiosInstance - The configured Axios instance.
 */

const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
});

// List of URLs to skip the refresh logic
const SKIP_REFRESH_URLS = [
  "/auth/login",
  "/auth/verify-2fa-code",
  "/me/refresh-session",
  "/me/my-session",
  "/me/logoff",
];

const shouldSkipRefresh = (url: string) => SKIP_REFRESH_URLS.some((path) => url.endsWith(path));

// Shared state for managing token refresh
let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Intercept request and add JWT token to the header if its DEV env
axiosInstance.interceptors.request.use(
  (request) => {
    // Include cookies with the request
    request.withCredentials = true;

    // Identify this app to the AccountsAPI so role lists are scoped to this app
    request.headers.set(APP_CONTEXT_HEADER, APP_CODE);

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
    if (import.meta.env.DEV) await sleep(0);

    return response;
  },

  async (error) => {
    // Set original request
    const originalRequest = error.config;

    // If response null
    if (!error.response) return Promise.reject(error);

    // If response status is 401 and request is not login, verify-2fa-code, refresh-session, my-session, logoff
    if (
      originalRequest?.url &&
      !shouldSkipRefresh(originalRequest.url) &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Set original request retry to true
      originalRequest._retry = true;

      // Set refreshing flag
      isRefreshing = true;

      try {
        // Refresh the session (only once!)
        await refreshSession();

        // Process all queued requests
        failedRequestsQueue.forEach((prom) => prom.resolve());
        failedRequestsQueue = [];

        // Return the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Reject all queued requests
        failedRequestsQueue.forEach((prom) => prom.reject(refreshError));
        failedRequestsQueue = [];

        // Redirect to login since refresh failed
        redirectToLoginOn401Util();

        return Promise.reject(refreshError);
      } finally {
        // Reset refreshing flag
        isRefreshing = false;
      }
    }

    console.error("Error:", error.response.status, error.response.data);

    const errorMessage = getErrorMessageFromResponseData(error.response.data);

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
