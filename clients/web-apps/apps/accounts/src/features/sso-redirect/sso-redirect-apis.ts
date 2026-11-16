import type { IHttpResponse, SocialCallbackDto, UserSessionDto } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/auth`;

/** Authenticates user via Azure Entra Id token */
const validateEntraToken = (code: string, state: string | null) => {
  const stateQuery = state ? `&state=${encodeURIComponent(state)}` : "";

  return axiosInstance
    .get<IHttpResponse<UserSessionDto>>(
      `${baseAPIURL}/entra/token?code=${encodeURIComponent(code)}${stateQuery}`,
    )
    .then((res) => res.data);
};

/** Completes a Google or GitHub sign-in and reports the next step */
const validateSocialCallback = (code: string, state: string | null) => {
  const stateQuery = state ? `&state=${encodeURIComponent(state)}` : "";

  return axiosInstance
    .get<IHttpResponse<SocialCallbackDto>>(
      `${baseAPIURL}/social/callback?code=${encodeURIComponent(code)}${stateQuery}`,
    )
    .then((res) => res.data);
};

/** Binds the tenant granted during administrator consent to the tenant's single sign-on configuration */
const completeSsoAdminConsent = (grantedTenantId: string, state: string) => {
  return axiosInstance
    .get<IHttpResponse<unknown>>(
      `${import.meta.env.VITE_ACCOUNTS_API_PATH}/tenant-account/sso/admin-consent-callback?tenant=${encodeURIComponent(
        grantedTenantId,
      )}&state=${encodeURIComponent(state)}`,
    )
    .then((res) => res.data);
};

export { completeSsoAdminConsent, validateEntraToken, validateSocialCallback };
