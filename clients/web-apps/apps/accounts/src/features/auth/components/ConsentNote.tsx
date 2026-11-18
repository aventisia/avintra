import { buttonVariants } from "@avplatform/ui/buttons";
import { IS_TAURI } from "@avplatform/ui/constants";
import { cn } from "@avplatform/ui/lib";

type ConsentNoteProps = {
  /** What the user is agreeing by: "By continuing, …" or "By creating an account, …" */
  action: "continuing" | "creating an account";
};

const linkClassName = cn(buttonVariants({ variant: "link" }), "inline h-auto p-0 text-hint");

/** The terms and privacy line under a step that can create an account. */
const ConsentNote = ({ action }: ConsentNoteProps) => {
  if (IS_TAURI) return null;

  return (
    <p className="text-pretty text-hint text-muted-foreground">
      By {action}, you agree to the{" "}
      <a
        className={linkClassName}
        href={`${import.meta.env.VITE_MARKETING_URL}/terms-of-service`}
        target="_blank"
        rel="noreferrer"
      >
        Terms of Service
      </a>{" "}
      and{" "}
      <a
        className={linkClassName}
        href={`${import.meta.env.VITE_MARKETING_URL}/privacy-policy`}
        target="_blank"
        rel="noreferrer"
      >
        Privacy Policy
      </a>
      .
    </p>
  );
};

export { ConsentNote };
