export interface ActiveSessionDto {
  id: string;
  deviceId: string;
  IPAddress: string;
  refreshToken: string;
  browserType: string;
  operatingSystem: string;
  location: string;
  sessionExpiresOn: Date;
  loggedInOn: Date;
  lastRefreshOn: Date;
  version: number;
}
