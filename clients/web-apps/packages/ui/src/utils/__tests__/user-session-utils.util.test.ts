import { describe, expect, it } from "vitest";

import type { IUserSessionStore } from "../../types/user-session-types";
import { isTenantSetupPending, needsDeferredProfile } from "../user-session-utils";

const session = (overrides: Partial<IUserSessionStore> = {}): IUserSessionStore => ({
  tenantId: "tenant-1",
  tenantName: "Acme",
  email: "user@acme.com",
  firstName: "Ada",
  lastName: "Lovelace",
  userInitials: "AL",
  platformVersion: "1",
  deploymentType: "Commercial",
  isAE: false,
  userRoles: [],
  expiresOn: new Date(),
  ...overrides,
});

describe("isTenantSetupPending", () => {
  it("is pending when the backend flags the tenant", () => {
    expect(isTenantSetupPending(session({ isTenantSetupPending: true }))).toBe(true);
  });

  it("is not pending when the backend clears the flag", () => {
    expect(isTenantSetupPending(session({ isTenantSetupPending: false }))).toBe(false);
  });

  it("is not pending for a stored session without the flag", () => {
    expect(isTenantSetupPending(session())).toBe(false);
  });

  it("is not pending without a session", () => {
    expect(isTenantSetupPending(null)).toBe(false);
    expect(isTenantSetupPending(undefined)).toBe(false);
  });
});

describe("needsDeferredProfile", () => {
  it("is true while setup is pending", () => {
    expect(needsDeferredProfile(session({ isTenantSetupPending: true }))).toBe(true);
  });

  it("is true when the name is missing", () => {
    expect(needsDeferredProfile(session({ firstName: "  " }))).toBe(true);
  });

  it("is false for a complete profile", () => {
    expect(needsDeferredProfile(session({ isTenantSetupPending: false }))).toBe(false);
  });
});
