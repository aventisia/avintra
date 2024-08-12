import {
  StudioPreferencesType,
  UserPreferencesType,
} from "@/react-toolkit/types/user-preferences-type";

export const setStudioPreferencesLocally = (
  studioPreferences: StudioPreferencesType,
) => {
  // Get old user preferences from local storage
  const oldUserPreferencesLSObj = JSON.parse(
    localStorage.getItem("userPreferences") || '""',
  ) as UserPreferencesType;

  // If user preferences does not exist in local storage, then return
  if (!oldUserPreferencesLSObj) return;

  // Update studio preferences in user preferences local storage object
  const newUserPreferencesLSObj: UserPreferencesType = {
    ...oldUserPreferencesLSObj,
    studio: studioPreferences,
  };

  // Set user preferences in local storage
  localStorage.setItem(
    "userPreferences",
    JSON.stringify(newUserPreferencesLSObj),
  );
};
