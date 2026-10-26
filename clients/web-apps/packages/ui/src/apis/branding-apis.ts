import type { IHttpResponse } from "@/ui/dtos";
import type { BrandingDto } from "@/ui/dtos/response/branding-dto";
import { axiosInstance } from "@/ui/lib/axios-instance";

const accountsApiPath = import.meta.env.VITE_ACCOUNTS_API_PATH as string | undefined;
const baseAPIURL: string = `${accountsApiPath}/branding`;

/**
 * Gets the deployment branding configuration. Unset fields are null so the client
 * can fall back to its built-in defaults. Returns null when the request fails or when
 * the app has no accounts API path configured (e.g. the Tauri desktop shell).
 */
const getBranding = () => {
  if (!accountsApiPath) {
    return Promise.resolve(null);
  }

  return axiosInstance
    .get<IHttpResponse<BrandingDto>>(baseAPIURL)
    .then((res) => res.data)
    .catch(() => null);
};

export { getBranding };
