/** The hand-back parameters the desktop app put on the sign-in URL for this attempt. */
type DesktopIntent = {
  state: string;
  challenge: string;
  port: string;
  computer: string;
};

const DESKTOP_INTENT_VALUE = "desktop";
const SWITCH_ACCOUNT_PARAM = "switch";
const INTENT_STORAGE_KEY = "desktopSignInIntent";
const ATTEMPT_VALUE = /^[A-Za-z0-9_-]{20,128}$/;
const LOOPBACK_PORT = /^\d{1,5}$/;
const COMPUTER_NAME_MAX_LENGTH = 64;
const FALLBACK_COMPUTER_NAME = "this computer";

// IMPORTANT NOTE: the provider round trip loses the query string, so the attempt is remembered in the
// tab; a forgotten attempt expires with the backend code lifetime instead of hijacking a later visit.
const INTENT_TTL_MS = 10 * 60 * 1000;

const isValidAttemptValue = (value: string | null | undefined): value is string =>
  typeof value === "string" && ATTEMPT_VALUE.test(value);

const isValidLoopbackPort = (value: string | null | undefined): value is string => {
  if (typeof value !== "string" || !LOOPBACK_PORT.test(value)) return false;

  const parsed = Number(value);
  return parsed >= 1 && parsed <= 65535;
};

const isPrintableCharacter = (character: string): boolean => {
  const code = character.charCodeAt(0);
  return code >= 0x20 && code !== 0x7f;
};

const sanitizeComputerName = (value: string | null | undefined): string =>
  [...(value ?? "")]
    .filter(isPrintableCharacter)
    .join("")
    .trim()
    .slice(0, COMPUTER_NAME_MAX_LENGTH)
    .trim() || FALLBACK_COMPUTER_NAME;

const buildDesktopIntent = (
  state: string | null | undefined,
  challenge: string | null | undefined,
  port: string | null | undefined,
  computer: string | null | undefined,
): DesktopIntent | null => {
  if (
    !isValidAttemptValue(state) ||
    !isValidAttemptValue(challenge) ||
    !isValidLoopbackPort(port)
  ) {
    return null;
  }

  return { state, challenge, port, computer: sanitizeComputerName(computer) };
};

const readIntentParams = (params: URLSearchParams): DesktopIntent | null => {
  if (params.get("intent") !== DESKTOP_INTENT_VALUE) return null;

  return buildDesktopIntent(
    params.get("state"),
    params.get("challenge"),
    params.get("port"),
    params.get("computer"),
  );
};

const readDesktopIntent = (search: string = window.location.search): DesktopIntent | null =>
  readIntentParams(new URLSearchParams(search));

const readStoredDesktopIntent = (): DesktopIntent | null => {
  try {
    const stored = sessionStorage.getItem(INTENT_STORAGE_KEY);
    if (!stored) return null;

    const saved = JSON.parse(stored) as Partial<DesktopIntent> & { savedAt?: number };
    if (typeof saved.savedAt !== "number" || Date.now() - saved.savedAt > INTENT_TTL_MS) {
      sessionStorage.removeItem(INTENT_STORAGE_KEY);
      return null;
    }

    const intent = buildDesktopIntent(saved.state, saved.challenge, saved.port, saved.computer);
    if (!intent) {
      sessionStorage.removeItem(INTENT_STORAGE_KEY);
    }

    return intent;
  } catch {
    return null;
  }
};

/** Remembers the desktop attempt of this tab, so it survives the provider and onboarding round trips. */
const rememberDesktopIntent = (): void => {
  const intent = readDesktopIntent();
  if (!intent) return;

  try {
    sessionStorage.setItem(INTENT_STORAGE_KEY, JSON.stringify({ ...intent, savedAt: Date.now() }));
  } catch {
    // Storage can be unavailable; the query string still carries the attempt on this page.
  }
};

/** Drops the remembered attempt once it was delivered or refused. */
const forgetDesktopIntent = (): void => {
  try {
    sessionStorage.removeItem(INTENT_STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
};

/** The desktop attempt of this tab: the current query string first, then the remembered attempt. */
const getDesktopIntent = (): DesktopIntent | null =>
  readDesktopIntent() ?? readStoredDesktopIntent();

/** True when this page is part of a desktop hand-back rather than a normal browser visit. */
const hasDesktopIntent = (): boolean => getDesktopIntent() !== null;

const appendDesktopIntent = (params: URLSearchParams): void => {
  const intent = getDesktopIntent();
  if (!intent) return;

  params.set("intent", DESKTOP_INTENT_VALUE);
  params.set("state", intent.state);
  params.set("challenge", intent.challenge);
  params.set("port", intent.port);
  params.set("computer", intent.computer);
};

const accountsBase = (): string => import.meta.env.VITE_ACCOUNTS_PATH.replace(/\/$/, "");

/** `/accounts/desktop/confirm?…`: the confirmation page as a same-origin path, or null outside a hand-back. */
const getDesktopConfirmationAppPath = (): string | null => {
  if (!hasDesktopIntent()) return null;

  const params = new URLSearchParams();
  appendDesktopIntent(params);
  return `${accountsBase()}/desktop/confirm?${params.toString()}`;
};

/** `/desktop/confirm?…`: the confirmation page as a router path, or null outside a hand-back. */
const getDesktopConfirmationPath = (): string | null => {
  const appPath = getDesktopConfirmationAppPath();
  return appPath ? appPath.slice(accountsBase().length) : null;
};

/** `/accounts/login?…`: the desktop-intent sign-in start, optionally bypassing the live-session shortcut. */
const getDesktopLoginPath = ({ switchAccount = false }: { switchAccount?: boolean } = {}):
  string | null => {
  if (!hasDesktopIntent()) return null;

  const params = new URLSearchParams();
  appendDesktopIntent(params);
  if (switchAccount) params.set(SWITCH_ACCOUNT_PARAM, "1");
  return `/login?${params.toString()}`;
};

/** True on the sign-in start reached from "Use a different account". */
const isSwitchingDesktopAccount = (search: string = window.location.search): boolean =>
  new URLSearchParams(search).get(SWITCH_ACCOUNT_PARAM) === "1";

/** Appends the desktop attempt to an onboarding or step-to-step query string. */
const withDesktopIntent = (params: URLSearchParams): URLSearchParams => {
  appendDesktopIntent(params);
  return params;
};

export {
  getDesktopConfirmationAppPath,
  getDesktopConfirmationPath,
  getDesktopIntent,
  getDesktopLoginPath,
  hasDesktopIntent,
  isSwitchingDesktopAccount,
  rememberDesktopIntent,
  forgetDesktopIntent,
  withDesktopIntent,
};
