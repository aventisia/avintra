import { LoadingSpinner } from "@avplatform/ui";
import { badgeVariants } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";

import { type SocialProvider } from "../utils/social-provider.util";

type SocialButtonsProps = {
  /** The providers to offer, in order; defaults to Google then GitHub */
  providers?: SocialProvider[];

  /** Called with the client-facing provider name when a button is pressed */
  onProviderClick: (provider: SocialProvider) => void;

  /** The provider whose sign-in is starting; every button is disabled while it is set */
  pendingProvider?: string;

  /** The provider this browser last signed in with; its button carries a "Last used" tag */
  lastUsedProvider?: string | null;
};

const GoogleLogo = ({ className }: { className?: string }) => (
  <img
    className={cn("size-4", className)}
    src={import.meta.env.BASE_URL + "google_g_logo.svg"}
    alt=""
    aria-hidden="true"
  />
);

const GitHubLogo = ({ className }: { className?: string }) => (
  <svg
    className={cn("size-4", className)}
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const PROVIDER_LOGOS: Record<SocialProvider, typeof GoogleLogo> = {
  Google: GoogleLogo,
  GitHub: GitHubLogo,
};

/** Full-width "Continue with Google/GitHub" buttons, the primary way into the app. */
const SocialButtons = ({
  providers = ["Google", "GitHub"],
  onProviderClick,
  pendingProvider,
  lastUsedProvider,
}: SocialButtonsProps) => {
  return (
    <div className="flex w-full flex-col gap-2.5">
      {providers.map((provider) => {
        const Logo = PROVIDER_LOGOS[provider];
        const isPending = pendingProvider === provider;

        return (
          <Button
            key={provider}
            className="relative w-full gap-2.5 [&:disabled_img]:opacity-50"
            variant="outline"
            size="lg"
            disabled={Boolean(pendingProvider)}
            aria-busy={isPending}
            onClick={() => onProviderClick(provider)}
          >
            {isPending ? <LoadingSpinner className="size-4" /> : <Logo />}
            {isPending ? `Redirecting to ${provider}…` : `Continue with ${provider}`}
            {lastUsedProvider === provider && !isPending && (
              <span
                className={cn(
                  badgeVariants({ variant: "primary" }),
                  "absolute -top-2 right-3 h-4 bg-surface px-1.5 text-[9.5px]",
                )}
              >
                Last used
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
};

export { GitHubLogo, GoogleLogo, PROVIDER_LOGOS, SocialButtons };
