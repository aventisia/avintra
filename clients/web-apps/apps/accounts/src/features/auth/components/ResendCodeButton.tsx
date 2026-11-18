import { LoadingSpinner } from "@avplatform/ui";
import { useEffect, useState } from "react";

const RESEND_COOLDOWN_SECONDS = 120;

type ResendCodeButtonProps = {
  isPending: boolean;
  onResend: () => void;
};

const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

/**
 * "Didn't get it? Resend code" with a cooldown. Remount it (e.g. key it by the code id) to restart
 * the cooldown after a new code is sent.
 */
const ResendCodeButton = ({ isPending, onResend }: ResendCodeButtonProps) => {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (secondsLeft === 0) return;

    const timeoutId = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timeoutId);
  }, [secondsLeft]);

  const isCoolingDown = secondsLeft > 0;

  return (
    <p className="flex flex-wrap items-center gap-x-1.5 text-body-sm text-muted-foreground">
      Didn't get it?
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-sm font-medium text-primary-text underline-offset-4 outline-none hover:underline focus-visible:shadow-focus disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline aria-busy:cursor-progress"
        disabled={isPending || isCoolingDown}
        aria-busy={isPending}
        onClick={onResend}
      >
        {isPending && <LoadingSpinner className="size-3.5" />}
        {isPending ? "Sending…" : "Resend code"}
      </button>
      {isCoolingDown && !isPending && (
        <span className="font-mono tabular-nums" aria-live="off">
          in {formatCountdown(secondsLeft)}
        </span>
      )}
    </p>
  );
};

export { ResendCodeButton };
