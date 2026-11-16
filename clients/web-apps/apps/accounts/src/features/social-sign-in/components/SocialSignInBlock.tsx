import { SeparatorWithText } from "@avplatform/ui";
import { buttonVariants } from "@avplatform/ui/buttons";
import { IS_TAURI } from "@avplatform/ui/constants";
import { cn } from "@avplatform/ui/lib";

import { SocialButtons } from "@/components/ui/SocialButtons";

import { useSocialSignInMutation } from "../hooks/useSocialSignInMutation.hook";

/**
 * The "Continue with Google/GitHub" block of the login and sign-up screens. It renders nothing
 * inside the desktop app, where the provider round trip cannot finish in the Tauri webview.
 */
const SocialSignInBlock = () => {
  const { socialSignInMutation, isSignInPending } = useSocialSignInMutation();

  if (IS_TAURI) return null;

  return (
    <div className="flex w-full flex-col gap-4">
      <SocialButtons
        providers={{ google: true, gitHub: true }}
        disabled={isSignInPending}
        onProviderClick={socialSignInMutation}
      />

      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to the{" "}
        <a
          className={cn(buttonVariants({ variant: "link" }), "inline h-auto p-0 text-xs")}
          href={`${import.meta.env.VITE_MARKETING_URL}/terms-of-service`}
          target="_blank"
          rel="noreferrer"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          className={cn(buttonVariants({ variant: "link" }), "inline h-auto p-0 text-xs")}
          href={`${import.meta.env.VITE_MARKETING_URL}/privacy-policy`}
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </a>
        .
      </p>

      <SeparatorWithText width="98%" overlayText="or continue with email" />
    </div>
  );
};

export { SocialSignInBlock };
