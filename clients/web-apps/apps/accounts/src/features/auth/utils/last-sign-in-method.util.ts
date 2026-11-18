import { LAST_SIGN_IN_METHOD_LS_KEY } from "@/constants/variables";

/** Remembers how this browser signed in, "email" or a provider name, for the "Last used" hint. */
const rememberSignInMethod = (method: string) => {
  try {
    localStorage.setItem(LAST_SIGN_IN_METHOD_LS_KEY, method);
  } catch {
    // IMPORTANT NOTE: storage throws in private mode or with blocked site data; the hint is optional.
  }
};

const getLastSignInMethod = (): string | null => {
  try {
    return localStorage.getItem(LAST_SIGN_IN_METHOD_LS_KEY);
  } catch {
    return null;
  }
};

export { getLastSignInMethod, rememberSignInMethod };
