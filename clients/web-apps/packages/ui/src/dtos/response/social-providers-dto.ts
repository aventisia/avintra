/** Social sign-in providers that are set up on this installation */
interface SocialProvidersDto {
  /** Whether "Continue with Google" is offered */
  google: boolean;

  /** Whether "Continue with GitHub" is offered */
  gitHub: boolean;
}

export { type SocialProvidersDto };
