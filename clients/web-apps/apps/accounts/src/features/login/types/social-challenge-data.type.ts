export type ISocialChallengeData = {
  codeId: string;
  email: string;
  provider: string;
  redirectUrl: string | null;
  hasPlanIntent: boolean;
};

export type ISocialLinkData = {
  codeId: string;
  email: string;
  provider: string;
};
