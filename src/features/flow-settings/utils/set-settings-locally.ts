import { SETTINGS_LS_KEY } from "../constants";
import { SettingType } from "../types/setting-types";

export const setSettingsLocally = (settings: SettingType) => {
  // Get old settings from local storage
  const oldSettingsLSObj = JSON.parse(
    localStorage.getItem(SETTINGS_LS_KEY) || '""',
  );
  let newSettingsLSObj = {};

  // If settings does not exist in local storage, then add
  if (!oldSettingsLSObj) {
    newSettingsLSObj = { ...settings };
  }

  // Update settings local storage object
  else {
    newSettingsLSObj = {
      ...oldSettingsLSObj,
      ...settings,
    };
  }
  // Set settings in local storage
  localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify(newSettingsLSObj));
};
