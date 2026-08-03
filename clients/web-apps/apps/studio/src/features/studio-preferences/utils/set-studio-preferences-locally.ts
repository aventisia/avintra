import { USER_PREFERENCES_LS_KEY } from "@avplatform/ui/constants";
import { StudioPreferencesType, UserPreferencesType } from "@avplatform/ui/types";

export const setStudioPreferencesLocally = (studioPreferences: StudioPreferencesType) => {
  // Get old user preferences from local storage
  const oldUserPreferencesLSObj = JSON.parse(
    localStorage.getItem(USER_PREFERENCES_LS_KEY) || "{}",
  ) as UserPreferencesType;

  // If user preferences does not exist in local storage, then return
  if (!oldUserPreferencesLSObj) return;

  // Update studio preferences in user preferences local storage object
  const newUserPreferencesLSObj: UserPreferencesType = {
    ...oldUserPreferencesLSObj,
    studio: studioPreferences,
  };

  // Set user preferences in local storage
  localStorage.setItem(USER_PREFERENCES_LS_KEY, JSON.stringify(newUserPreferencesLSObj));
};
