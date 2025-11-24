/** To make mannual login request using username and pwd */
interface PwdLoginDto {
  /** Email/username of user's account */
  email: string;

  /** Password of user's account */
  pwd: string;

  /** OS id (optional) */
  os_unique_id?: string;
}

export { type PwdLoginDto };
