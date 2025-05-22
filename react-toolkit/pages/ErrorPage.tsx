import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { MinimalFooter } from "@/react-toolkit/layout/MinimalFooter";
import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { Separator } from "@aventisia/ui";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRouteError } from "react-router-dom";

const ErrorPage = () => {
  // Get the error object
  const error = useRouteError() as {
    message: string;
    status?: number;
    statusText?: string;
  };

  return (
    <div className="flex h-screen w-full flex-col items-center p-3 lg:w-[100%]">
      <div className="flex w-full items-center justify-between p-5 xs:p-3">
        <AppLogo doNotShowAppName={true} />
        <a
          href="/help?id=help-on-error"
          className={cn(buttonVariants({ variant: "link" }), "text-right")}
        >
          Help?
        </a>
      </div>
      <div className="-mt-4 flex grow flex-col items-center justify-center gap-3 text-sm mlg:flex-row">
        <ExclamationTriangleIcon className="h-[25%] stroke-1 text-slate-100 opacity-40 mlg:h-[40%]" />
        <h2 className="text-xl text-destructive">Error!</h2>
        <Separator
          orientation="vertical"
          className="hidden h-10 w-[1px] rounded-full mlg:flex"
        />
        {error.statusText || error.message ? (
          <p>{error.statusText || error.message}</p>
        ) : (
          <p>Something went wrong</p>
        )}
      </div>
      <MinimalFooter />
    </div>
  );
};

export { ErrorPage };
