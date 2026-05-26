import { AxiosRequestConfig } from "axios";

import { useGAAuthStore } from "../stores/useGAAuthStore";

export const appendAuthHeader = (
  config: AxiosRequestConfig = {},
): AxiosRequestConfig => {
  const token = useGAAuthStore.getState().token;

  if (!token) return config;

  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  };
};
