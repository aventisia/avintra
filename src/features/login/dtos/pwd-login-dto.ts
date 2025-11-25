import { IOSInfo } from "../types/os-info";

/** To make mannual login request using username and pwd */
interface PwdLoginDto {
  /** Email/username of user's account */
  email: string;

  /** Password of user's account */
  pwd: string;

  /** OS info (optional) */
  osInfo?: IOSInfo;
}

export { type PwdLoginDto };
