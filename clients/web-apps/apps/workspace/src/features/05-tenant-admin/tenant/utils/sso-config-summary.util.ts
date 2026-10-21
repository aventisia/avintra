/** Summary of the stored tenant single sign-on configuration document */
export type SsoConfigSummary = {
  externalTenantId: string;
  emailDomain: string;
};

const emptySsoConfigSummary: SsoConfigSummary = {
  externalTenantId: "",
  emailDomain: "",
};

/** Parses the redacted single sign-on configuration document into a summary. */
export const parseSsoConfig = (ssoConfigJson?: string): SsoConfigSummary => {
  if (!ssoConfigJson) return emptySsoConfigSummary;

  try {
    const parsed = JSON.parse(ssoConfigJson) as Partial<SsoConfigSummary>;

    return {
      externalTenantId: parsed.externalTenantId ?? "",
      emailDomain: parsed.emailDomain ?? "",
    };
  } catch {
    return emptySsoConfigSummary;
  }
};
