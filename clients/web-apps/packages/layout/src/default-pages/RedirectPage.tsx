import { LoadingSpinner } from "@avplatform/ui";
import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface RedirectPageProps {
  appLogo: React.ReactNode;
  minimalFooter: React.ReactNode;
  className?: string;
}

/**
 * RedirectPage is a React functional component that handles redirection to a specified URL
 * while displaying a loading or wait message. It also includes optional app logo and footer components.
 *
 * @param {RedirectPageProps} props - The props for the RedirectPage component.
 * @param {React.ReactNode} props.appLogo - The logo to display at the top of the page.
 * @param {React.ReactNode} props.minimalFooter - The footer to display at the bottom of the page.
 * @param {string} [props.className] - Additional CSS class names to apply to the root container.
 *
 * @returns {JSX.Element} A JSX element representing the redirect page.
 *
 * @remarks
 * - The component uses the `useSearchParams` hook to extract the `url` and `msg` query parameters.
 * - If the `url` parameter is present, the component redirects the user to the specified URL using `window.location.assign`.
 * - The `msg` parameter is displayed as a loading or wait message alongside a spinner.
 * - The "Help?" link is currently hidden and can be enabled by removing the `hidden` class.
 *
 * @example
 * ```tsx
 * <RedirectPage
 *   appLogo={<AppLogo />}
 *   minimalFooter={<MinimalFooter />}
 *   className="custom-class"
 * />
 * ```
 */
const RedirectPage = ({ appLogo, minimalFooter, className }: RedirectPageProps) => {
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
        {appLogo}
        <a
          href="/help?id=redirect"
          className={cn(
            buttonVariants({ variant: "link" }),
            "text-md text-right",
            "hidden", // TODO: Hide the help for now
          )}
        >
          Help?
        </a>
      </div>
      <div className="-mt-4 flex items-center gap-3 text-body text-ink-2">
        <LoadingSpinner className="size-6 text-primary-text" />
        {message}
      </div>
      {minimalFooter}
    </div>
  );
};

export { RedirectPage };
