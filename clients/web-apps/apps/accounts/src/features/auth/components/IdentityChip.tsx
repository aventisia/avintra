import { PencilSimpleIcon } from "@phosphor-icons/react";

import { useAuthStore } from "../stores/auth-store";

type IdentityChipProps = {
  email: string;

  /** Replaces the email initial, e.g. with the provider logo of a passwordless account */
  leading?: React.ReactNode;
};

/** The email a step is for; pressing it goes back to the start to use a different one. */
const IdentityChip = ({ email, leading }: IdentityChipProps) => {
  const changeEmail = useAuthStore((state) => state.changeEmail);

  return (
    <button
      type="button"
      className="group inline-flex h-8 max-w-full items-center gap-2 rounded-full border border-line bg-surface pe-3 ps-1 text-body-sm text-ink outline-none transition-colors duration-[120ms] hover:border-line-strong hover:bg-hover focus-visible:shadow-focus motion-reduce:transition-none"
      aria-label={`Change email, ${email}`}
      onClick={changeEmail}
    >
      <span
        aria-hidden="true"
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-fill text-label font-semibold uppercase text-ink-2"
      >
        {leading ?? email.charAt(0)}
      </span>
      <span className="truncate">{email}</span>
      <PencilSimpleIcon
        aria-hidden="true"
        className="size-3.5 shrink-0 text-muted-foreground group-hover:text-ink"
      />
    </button>
  );
};

export { IdentityChip };
