interface IUserSessionStore {
  tenantId: string;
  tenantName: string;
  email: string;
  firstName: string;
  lastName: string;
  userInitials: string;
  /** IsAventisiaEmployee */
  isAE: boolean;
  userRoles: string[];
  expiresOn: Date;
  avatarSrc?: string;
}

interface IJwtPayload {
  /** jwt audience */
  aud: string;
  /** issuer of jwt */
  iss: string;
  /** jwt expires on */
  exp: number;
  /** jwt issued on */
  iat: number;
  /** JWT Id optional claim */
  jti: string;
  /** Session Id */
  sid: string;
  /** Tenant Id */
  tntid: string;
  /** User Id */
  uid: string;
  /** Username */
  uname: string;
  /** List of user roles */
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string[];
}

export { type IUserSessionStore, type IJwtPayload };
