import { INVALID_CREDS, IS_TAURI, REQUEST_TIMEOUT } from "@avplatform/ui/constants";
import { toast } from "@avplatform/ui/sonner";
import { sleep } from "@avplatform/ui/utils";
import axios from "axios";

import { refreshSession } from "@/ui/apis/accounts-me-apis";
import { redirectToLoginOn401Util } from "@/ui/utils/redirect-util";

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
  headers: {
    "Content-Type": "application/json",
  },
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

// Boot-time requests that handle their own failures and must not raise global notifications
// (e.g. the optional branding endpoint falls back to defaults silently).
const SKIP_ERROR_NOTIFICATION_URLS = ["/branding"];

const shouldSkipErrorNotification = (url: string) =>
  SKIP_ERROR_NOTIFICATION_URLS.some((path) => url.endsWith(path));

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

    // When running inside the Tauri desktop app, tell the backend which client
    // and version is making the request so job execution location can be
    // attributed correctly.
    if (IS_TAURI) {
      request.headers["X-Client-Type"] = "AvintraDesktopApp";
      const match = navigator.userAgent.match(/AvintraDesktopApp\/([0-9]+(?:\.[0-9]+)*)/);
      request.headers["X-Client-Version"] = match?.[1] ?? "";
    }

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

    // Requests that resolve their own failures (branding) must not toast or redirect.
    if (originalRequest?.url && shouldSkipErrorNotification(originalRequest.url)) {
      return Promise.reject(error);
    }

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

    // IMPORTANT NOTE: an empty body (or a non-JSON one) would otherwise show a red toast with no text.
    if (!errorMessage) {
      errorMessage = "Something went wrong. Please try again later";
    }

    // Return toast notification basis Http Status code
    switch (error.response.status) {
      case 400:
      case 409:
      case 429:
        return Promise.reject(errorMessage); // Return just the error message so that it can be used in the component to show toast notification and take action accordingly
      case 401:
        if (error.config?.url.endsWith("/auth/login")) {
          return Promise.reject(errorMessage);
        }
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
