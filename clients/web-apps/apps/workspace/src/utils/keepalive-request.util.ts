import { type AxiosRequestConfig } from "axios";

/** Request config that lets a call finish after the page closes, keeping the instance's URL, headers and cookies. */
export const KEEPALIVE_REQUEST: AxiosRequestConfig = {
  adapter: "fetch",
  fetchOptions: { keepalive: true },
};
