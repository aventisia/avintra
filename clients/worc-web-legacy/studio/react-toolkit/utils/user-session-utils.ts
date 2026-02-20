import { jwtDecode } from "jwt-decode";

import { SESSION_EXPIRED_LS_KEY } from "@/react-toolkit/constants";
import { UserSessionDto } from "@/react-toolkit/dtos/response/user-session-dto";
import {
  IJwtPayload,
  IUserSessionStore,
} from "@/react-toolkit/types/user-session-types";

const setUserSessionLocally = (
  userSession: UserSessionDto,
): IUserSessionStore => {
  // Decode jwt basis env. DO NOT REMOVE DEV CONDITION
  const decodedJwt = jwtDecode<IJwtPayload>(userSession.accessToken);

  // Set user session status in local storage
  localStorage.setItem(SESSION_EXPIRED_LS_KEY, "false");

  // create roles array
  const roles: string[] =
    decodedJwt["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  // Return user session store object
  return {
    tenantId: decodedJwt.tntid,
    tenantName: userSession.tenantName,
    email: decodedJwt.uname,
    firstName: userSession.firstName,
    lastName: userSession.lastName,
    userInitials: userSession.userInitials,
    isAE: roles.includes("AE"),
    userRoles: roles,
    expiresOn: new Date(decodedJwt.exp * 1000),
    platformVersion: userSession.platformVersion,
    planType: decodedJwt?.plan,
    deploymentType: decodedJwt.type,
  };
};

export { setUserSessionLocally };
