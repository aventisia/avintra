import { useEffect, useState } from "react";

import { LoadingSpinner } from "@/ui/components";
import { Button } from "@/ui/components/buttons";

interface ResendCodeButtonProps {
  /** Indicates whether the resend action is currently pending */
  isPending: boolean;

  /** Disables the button when true */
  disabled: boolean;

  /** The function to call when the button is clicked to resend the code */
  resendCodeFn: () => void;
}

/**
 *
 * A React component that renders a button for resending a code with a countdown timer.
 * The button is disabled while the timer is active or when explicitly disabled.
 * It also displays a loading spinner when the resend action is pending.
 *
 */
const ResendCodeButton = ({ isPending, disabled, resendCodeFn }: ResendCodeButtonProps) => {
  const maxTime: number = 120; // Set initial timer
  const [timer, setTimer] = useState(maxTime);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000); // Update timer every second

    // Cleanup function to clear the interval on unmount
    return () => {
      clearInterval(intervalId);
      if (isPending) {
        setTimer(maxTime); // Reset to initial value
      }
    };
  }, [timer, isPending]);

  const formattedMinutes = (seconds: number) =>
    Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");

  const formattedSeconds = (seconds: number) => (seconds % 60).toString().padStart(2, "0");

  return (
    <Button
      className="text-md h-0 gap-1 p-0 font-normal"
      variant={"link"}
      disabled={disabled || timer > 0}
      onClick={resendCodeFn}
    >
      {isPending ? (
        <>
          <LoadingSpinner className="h-4 w-4" />
          Resending...
        </>
      ) : (
        <>
          {timer > 0 ? (
            <>
              Resend in
              <div className="text-md flex w-14 justify-center rounded-lg bg-accent font-medium">
                <div className="w-[1.2rem]">{formattedMinutes(timer)}</div>
                <div className="w-1">:</div>
                <div className="w-[1.2rem]">{formattedSeconds(timer)}</div>
              </div>
            </>
          ) : (
            "Resend"
          )}
        </>
      )}
    </Button>
  );
};

export { ResendCodeButton };
