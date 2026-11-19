/** To make a manual login request using email and password */
interface PwdLoginDto {
  /** Email/username of the user's account */
  email: string;

  /** Password of the user's account */
  pwd: string;
}

export { type PwdLoginDto };
