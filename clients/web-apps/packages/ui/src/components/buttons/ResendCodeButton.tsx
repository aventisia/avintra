import { useEffect, useState } from "react";

import { LoadingSpinner } from "@/ui/components";
import { Button } from "@/ui/components/buttons";

const RESEND_COOLDOWN_SECONDS = 120;

interface ResendCodeButtonProps {
  /** Indicates whether the resend action is currently pending */
  isPending: boolean;

  /** Disables the button when true */
  disabled: boolean;

  /** The function to call when the button is clicked to resend the code */
  resendCodeFn: () => void;
}

const padTwoDigits = (value: number) => value.toString().padStart(2, "0");

/**
 * Link-style button that resends a code, locked behind a countdown that restarts on every resend.
 */
const ResendCodeButton = ({ isPending, disabled, resendCodeFn }: ResendCodeButtonProps) => {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (isPending) {
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    }
  }, [isPending]);

  useEffect(() => {
    if (secondsLeft === 0) {
      return;
    }
    const timeoutId = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timeoutId);
  }, [secondsLeft]);

  const renderLabel = () => {
    if (isPending) {
      return (
        <>
          <LoadingSpinner className="h-4 w-4" />
          Resending...
        </>
      );
    }
    if (secondsLeft === 0) {
      return "Resend";
    }
    return (
      <>
        Resend in
        <span className="text-md flex w-14 justify-center rounded-lg bg-accent font-medium tabular-nums">
          <span className="w-[1.2rem]">{padTwoDigits(Math.floor(secondsLeft / 60))}</span>
          <span className="w-1">:</span>
          <span className="w-[1.2rem]">{padTwoDigits(secondsLeft % 60)}</span>
        </span>
      </>
    );
  };

  return (
    <Button
      type="button"
      className="text-md h-0 gap-1 p-0 font-normal"
      variant="link"
      disabled={disabled || isPending || secondsLeft > 0}
      onClick={resendCodeFn}
    >
      {renderLabel()}
    </Button>
  );
};

export { ResendCodeButton };
