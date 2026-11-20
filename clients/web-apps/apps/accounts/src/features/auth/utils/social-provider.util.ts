type SocialProvider = "Google" | "GitHub";

const isSocialProvider = (provider: string | null | undefined): provider is SocialProvider =>
  provider === "Google" || provider === "GitHub";

export { isSocialProvider, type SocialProvider };
