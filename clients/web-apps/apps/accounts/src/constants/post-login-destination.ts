/**
 * The email domain that identifies Aventisia employees. Users logging in with
 * this domain are routed to the Atlas app; everyone else goes to the workspace app.
 */
const AVENTISIA_EMAIL_DOMAIN = "@aventisia.com";

/**
 * Determines the post-login destination app path based on the user's email domain.
 *
 * - Emails ending in `@aventisia.com` (Aventisia employees) → Atlas app
 * - All other users → Workspace app
 *
 * @param email The user's email address (from the decoded JWT `uname`).
 * @returns The base path of the destination app (e.g. `/atlas/` or `/workspace/`).
 */
const getPostLoginDestination = (email: string): string => {
  const normalizedEmail = email?.toLowerCase() ?? "";
  return normalizedEmail.endsWith(AVENTISIA_EMAIL_DOMAIN)
    ? import.meta.env.VITE_ATLAS_PATH
    : import.meta.env.VITE_WORKSPACE_PATH;
};

export { AVENTISIA_EMAIL_DOMAIN, getPostLoginDestination };
