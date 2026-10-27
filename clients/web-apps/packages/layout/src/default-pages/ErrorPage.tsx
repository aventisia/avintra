import { Separator } from "@avplatform/ui";
import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { TriangleAlertIcon } from "lucide-react";
import { useRouteError } from "react-router-dom";

interface ErrorPageProps {
  appLogo: React.ReactNode;
  minimalFooter: React.ReactNode;
}

/**
 * The `ErrorPage` component is a user interface for displaying error messages
 * when an application encounters an issue. It provides a structured layout
 * with an optional application logo, error details, and a minimal footer.
 *
 * @param {ErrorPageProps} props - The props for the `ErrorPage` component.
 * @param {React.ReactNode} props.appLogo - An optional logo to display at the top of the error page.
 * @param {React.ReactNode} props.minimalFooter - An optional footer to display at the bottom of the error page.
 *
 * @returns {JSX.Element} A React component that renders the error page.
 *
 * @remarks
 * - The error details are retrieved using the `useRouteError` hook, which provides
 *   information such as the error message, status code, and status text.
 * - The "Help?" link is currently hidden and can be enabled once the documentation app is available.
 * - The component uses Tailwind CSS for styling and includes responsive design considerations.
 *
 * @example
 * ```tsx
 * import ErrorPage from './ErrorPage';
 *
 * const App = () => {
 *   return (
 *     <ErrorPage
 *       appLogo={<img src="/logo.png" alt="App Logo" />}
 *       minimalFooter={<footer>© 2023 My App</footer>}
 *     />
 *   );
 * };
 * ```
 */
const ErrorPage = ({ appLogo, minimalFooter }: ErrorPageProps) => {
  // Get the error object
  const error = useRouteError() as {
    message: string;
    status?: number;
    statusText?: string;
  };

  return (
    <div className="flex h-screen w-full flex-col items-center p-3 lg:w-[100%]">
      <div className="flex w-full items-center justify-between p-5 xs:p-6">
        {appLogo}
        <a
          href="/help?id=help-on-error"
          className={cn(
            buttonVariants({ variant: "link" }),
            "text-right",
            "hidden", // TODO: Hide the help for now
          )}
        >
          Help?
        </a>
      </div>

      <div className="-mt-4 flex grow flex-col items-center justify-center gap-3 text-body text-ink-2 mlg:flex-row">
        <TriangleAlertIcon className="size-10 text-muted-foreground" strokeWidth={1.75} />
        <h2 className="text-heading font-semibold text-bad">Error!</h2>
        <Separator orientation="vertical" className="hidden h-10 w-px bg-line mlg:flex" />
        {error.statusText || error.message ? (
          <p>{error.statusText || error.message}</p>
        ) : (
          <p>Something went wrong</p>
        )}
      </div>
      {minimalFooter}
    </div>
  );
};

export { ErrorPage };
