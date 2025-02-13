import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { MinimalFooter } from "@/react-toolkit/layout/MinimalFooter";
import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface RedirectPageProps {
  className?: string;
}

/** Default message is Loading... redirect?url=https://domain.com/&msg=Please Wait...*/
const RedirectPage = ({ className }: RedirectPageProps) => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const message = searchParams.get("msg"); // loading or wait message

  useEffect(() => {
    url ? window.location.assign(url) : null;
  });

  return (
    <div
      className={cn(
        "flex h-screen w-full flex-col items-center justify-between p-3 lg:w-[100%]",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between p-5 xs:p-3">
        <AppLogo doNotShowAppName={true} />
        <a
          href="/help?id=redirect"
          className={cn(buttonVariants({ variant: "link" }), "text-right")}
        >
          Help?
        </a>
      </div>
      <div className="-mt-4 flex items-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-[--icon-color]" />
        {message ? message : "Loading..."}
      </div>
      <MinimalFooter />
    </div>
  );
};

export { RedirectPage };
