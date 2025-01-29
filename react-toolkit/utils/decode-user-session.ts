import { DEV_JWT_LS_KEY } from "@/react-toolkit/constants";
import { UserSessionDto } from "@/react-toolkit/dtos/response/user-session-dto";
import {
  IJwtPayload,
  IUserSessionStore,
} from "@/react-toolkit/types/user-session-types";
import { jwtDecode } from "jwt-decode";

const getDecodedUserSession = (
  userSession: UserSessionDto,
): IUserSessionStore => {
  // Decode jwt basis env. DO NOT REMOVE DEV CONDITION
  const decodedJwt = jwtDecode<IJwtPayload>(
    import.meta.env.DEV
      ? localStorage.getItem(DEV_JWT_LS_KEY) || ""
      : userSession.accessToken,
  );

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
  };
};

export { getDecodedUserSession };
