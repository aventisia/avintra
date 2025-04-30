import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { MinimalFooter } from "@/react-toolkit/layout/MinimalFooter";

import { LoadingSpinner } from "@aventisia/ui";
import { buttonVariants } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface RedirectPageProps {
  className?: string;
}

/**
 * RedirectPage component is responsible for handling redirection to a specified URL
 * while optionally displaying a loading or wait message. It uses query parameters
 * from the URL to determine the redirection target and message to display.
 *
 * @component
 * @param {string} [props.className] - Optional additional class names to style the component.
 *
 * @remarks
 * - The component reads the `url` and `msg` query parameters from the URL.
 * - If the `url` parameter is present, the component redirects the user to the specified URL.
 * - The `msg` parameter is used to display a loading or wait message alongside a spinner.
 *
 * @example
 * // Example URL: /redirect?url=https://example.com&msg=Please wait...
 * <RedirectPage className="custom-class" />
 *
 * @returns {JSX.Element} A JSX element containing the redirection UI.
 */
const RedirectPage = ({ className }: RedirectPageProps) => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const message = searchParams.get("msg"); // loading or wait message

  useEffect(() => {
    if (url) {
      window.location.assign(url);
    }
  });

  return (
    <div
      className={cn(
        "flex h-screen w-full flex-col items-center justify-between p-3 pb-3 lg:w-[100%]",
        className,
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
      <div className="-mt-4 flex items-center gap-3 text-md">
        <LoadingSpinner className="h-10 w-10 text-primary" />
        {message}
      </div>
      <MinimalFooter />
    </div>
  );
};

export { RedirectPage };
