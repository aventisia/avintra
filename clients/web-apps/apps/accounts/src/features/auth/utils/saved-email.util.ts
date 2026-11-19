import { USER_NAME_LS_KEY } from "@avplatform/ui/constants";

/** The email this browser last signed in with, to prefill the email field. */
const readSavedEmail = () => {
  try {
    return localStorage.getItem(USER_NAME_LS_KEY) ?? "";
  } catch {
    return "";
  }
};

export { readSavedEmail };
