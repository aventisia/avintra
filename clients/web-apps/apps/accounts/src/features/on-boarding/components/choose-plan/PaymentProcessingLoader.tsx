import { AppLogo } from "@avplatform/layout/logo";
import { MinimalFooter } from "@avplatform/layout/minimal-footer";
import { LoadingSpinner } from "@avplatform/ui";
import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const PaymentProcessingLoader = ({
  showRedirectMessage,
  countdown,
}: {
  showRedirectMessage: boolean;
  countdown: number;
}) => {
  const [showPaymentMessage, setShowPaymentMessage] = useState(false);

  useEffect(() => {
    if (showRedirectMessage) {
      setTimeout(() => {
        setShowPaymentMessage(true); // Show the payment received message after a short delay
      }, 1000); // Small delay for smooth transition
    }
  }, [showRedirectMessage]);

  return (
    <div
      className={cn(
        "flex h-screen w-full flex-col items-center justify-between p-3 pb-3 lg:w-[100%]",
      )}
    >
      <div className="flex w-full items-center justify-between p-5 xs:p-6">
        <AppLogo showFullLogo={true} className="h-7" />
        <a
          href="/help?id=redirect"
          className={cn(
            buttonVariants({ variant: "link" }),
            "text-right text-md",
            "hidden", // TODO: Hide the help link till we have a docs app
          )}
        >
          Help?
        </a>
      </div>
      <div className="-mt-7 flex flex-col items-center space-y-4">
        {/* Loading Spinner or Success Icon */}
        {!showPaymentMessage ? (
          <div className="flex flex-col items-center gap-5">
            <LoadingSpinner className="h-12 w-12 text-primary " />
            <p className="text-lg ">Payment is being processed</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <CheckCircleIcon className="h-12 w-12 text-ok" />
            <div className="flex flex-col gap-1 items-center">
              <p className="text-2xl font-semibold text-ok">Payment successful</p>
              <p className="text-base  text-muted-foreground">
                {countdown == 0
                  ? "Redirecting in few seconds"
                  : `Redirecting in ${countdown} seconds`}{" "}
              </p>
            </div>
          </div>
        )}
      </div>
      <MinimalFooter />
    </div>
  );
};

export { PaymentProcessingLoader };
