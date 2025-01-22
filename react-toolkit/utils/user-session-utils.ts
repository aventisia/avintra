import {
  DEV_JWT_LS_KEY,
  USER_PREFERENCES_LS_KEY,
  USER_SESSION_LS_KEY,
} from "@/react-toolkit/constants";
import { UserSessionDto } from "@/react-toolkit/dtos/response/user-session-dto";
import { UserPreferencesType } from "@/react-toolkit/types/user-preferences-type";
import {
  IJwtPayload,
  IUserSessionLS,
  IUserSessionStore,
} from "@/react-toolkit/types/user-session-types";
import { redirectToLoginUtil } from "@/react-toolkit/utils/redirect-utils";
import { jwtDecode } from "jwt-decode";

const setUserSessionLocally = (
  userSession: UserSessionDto,
): IUserSessionStore => {
  // Decode jwt basis env. DO NOT REMOVE DEV CONDITION
  const decodedJwt = jwtDecode<IJwtPayload>(
    import.meta.env.DEV
      ? localStorage.getItem(DEV_JWT_LS_KEY) || ""
      : userSession.accessToken,
  );

  // Create user session local storage object
  const userSessionLS: IUserSessionLS = {
    tenantId: decodedJwt.tntid,
    userName: decodedJwt.uname,
    expiresOn: new Date(decodedJwt.exp * 1000),
  };

  // Set user session in local storage
  localStorage.setItem(USER_SESSION_LS_KEY, JSON.stringify(userSessionLS));

  // Set user preferences in local storage
  setUserPreferencesLocally();

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

const setUserPreferencesLocally = (userPreferences?: UserPreferencesType) => {
  // Get user preferences from local storage
  const oldUserPreferencesLSObj = JSON.parse(
    localStorage.getItem(USER_PREFERENCES_LS_KEY) || '""',
  ) as UserPreferencesType;

  // If user preferences already exist, then return
  if (!userPreferences && oldUserPreferencesLSObj) return;

  // Create user preferences local storage object
  const userPreferencesLS: UserPreferencesType = {
    theme: userPreferences?.theme ? userPreferences.theme : "light",
    studio: userPreferences?.studio
      ? userPreferences.studio
      : {
          layoutDirection: "TB",
          miniMap: true,
          undoRedo: true,
          intractivityToggle: true,
          zoomControls: true,
          deleteAlert: true,
        },
  };

  // Set user preferences in local storage
  localStorage.setItem(
    USER_PREFERENCES_LS_KEY,
    JSON.stringify(userPreferencesLS),
  );
};

const removeUserSessionLocally = (redirectToLogin?: boolean) => {
  localStorage.removeItem(USER_SESSION_LS_KEY);

  // Redirect to login page after 2 seconds
  if (redirectToLogin) redirectToLoginUtil();
};

const addSecondsToDate = (date: Date, secondsToAdd: number): Date => {
  // Convert date into seconds
  let dateInSeconds = date.getTime() / 1000;
  // Add seconds
  dateInSeconds += secondsToAdd;
  // Convert back to date
  return new Date(dateInSeconds * 1000);
};

const convertDateTimeToUTC = (dateInput: Date) => {
  return new Date(
    dateInput.getTime() + dateInput.getTimezoneOffset() * 60 * 1000,
  );
};

export {
  addSecondsToDate,
  convertDateTimeToUTC,
  removeUserSessionLocally,
  setUserPreferencesLocally,
  setUserSessionLocally,
};
