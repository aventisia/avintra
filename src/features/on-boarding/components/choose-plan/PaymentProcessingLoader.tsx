import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { MinimalFooter } from "@/react-toolkit/layout/MinimalFooter";

import { LoadingSpinner } from "@aventisia/ui";
import { buttonVariants } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";

const PaymentProcessingLoader = () => {
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
      <div className="-mt-4 flex items-center flex-col gap-3 text-md">
        <LoadingSpinner className="h-10 w-10 text-primary" />
        {"Payment is being processed"}
      </div>
      <MinimalFooter />
    </div>
  );
};

export { PaymentProcessingLoader };
