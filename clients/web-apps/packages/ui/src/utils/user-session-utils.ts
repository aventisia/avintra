import { SESSION_EXPIRED_LS_KEY } from "@avplatform/ui/constants";
import { jwtDecode } from "jwt-decode";

import type { UserSessionDto } from "@/ui/dtos/response/user-session-dto";
import type { IJwtPayload, IUserSessionStore } from "@/ui/types/user-session-types";

const setUserSessionLocally = (userSession: UserSessionDto): IUserSessionStore => {
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
    hasPaidPlan: userSession.hasPaidPlan,
    tenantType: userSession.tenantType,
    deploymentType: decodedJwt.type,

    // Access mode used for Super Admin tenant viewing ("read_only" / "read_write").
    access_mode: decodedJwt.access_mode,
  };
};

/** True while a free sign-up has not chosen its account type yet (organization setup is deferred to checkout). */
const isTenantSetupPending = (userSession: IUserSessionStore | null | undefined) =>
  userSession?.tenantType === "Unspecified";

/** True when checkout must still collect the name or account type that free sign-up skipped. */
const needsDeferredProfile = (userSession: IUserSessionStore | null | undefined) =>
  isTenantSetupPending(userSession) ||
  !userSession?.firstName?.trim() ||
  !userSession?.lastName?.trim();

/** The user's full name, or their email when free sign-up skipped the name. */
const getUserDisplayName = (userSession: IUserSessionStore | null | undefined) =>
  `${userSession?.firstName ?? ""} ${userSession?.lastName ?? ""}`.trim() ||
  (userSession?.email ?? "");

export { getUserDisplayName, isTenantSetupPending, needsDeferredProfile, setUserSessionLocally };
