import type { IHttpResponse, UserSessionDto } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import type { DesktopSignInExchangeDto } from "../dtos/desktop-sign-in-exchange.dto";
import type { DesktopSignInMintResultDto } from "../dtos/desktop-sign-in-mint-result.dto";
import type { DesktopSignInMintDto } from "../dtos/desktop-sign-in-mint.dto";

const baseAPIURL: string = `${import.meta.env.VITE_ACCOUNTS_API_PATH}/auth/desktop`;

/** Mints a single-use code that hands an authenticated browser sign-in back to the desktop app. */
const mintDesktopSignInCode = (postObj: DesktopSignInMintDto) => {
  return axiosInstance
    .post<IHttpResponse<DesktopSignInMintResultDto>>(`${baseAPIURL}/mint`, postObj)
    .then((res) => res.data);
};

/** Exchanges a single-use desktop sign-in code for a new browser session. */
const exchangeDesktopSignInCode = (postObj: DesktopSignInExchangeDto) => {
  return axiosInstance
    .post<IHttpResponse<UserSessionDto>>(`${baseAPIURL}/exchange`, postObj)
    .then((res) => res.data);
};

export { exchangeDesktopSignInCode, mintDesktopSignInCode };
