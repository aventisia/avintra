import { Button } from "@aventisia/ui/buttons";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ResendCodeButtonProps {
  isPending: boolean;
  disabled: boolean;
  resendCodeFn: () => void;
}

const ResendCodeButton = ({
  isPending,
  disabled,
  resendCodeFn,
}: ResendCodeButtonProps) => {
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

  const formattedSeconds = (seconds: number) =>
    (seconds % 60).toString().padStart(2, "0");

  return (
    <Button
      className="h-0 gap-1 text-md p-0 font-normal"
      variant={"link"}
      disabled={disabled || timer > 0}
      onClick={resendCodeFn}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Resending...
        </>
      ) : (
        <>
          {timer > 0 ? (
            <>
              Resend in
              <div className="flex w-12 justify-center text-md rounded-sm bg-slate-100 font-medium">
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
