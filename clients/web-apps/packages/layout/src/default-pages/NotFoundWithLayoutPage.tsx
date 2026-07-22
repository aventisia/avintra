import { Separator } from "@avplatform/ui";
import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface NotFoundWithLayoutPageProps {
  appLogo: React.ReactNode;
  minimalFooter: React.ReactNode;
}

/**
 * A React functional component that renders a "404 Not Found" page with a layout.
 * This component is designed to display a custom "Page not found" message along with
 * optional elements such as an application logo and a minimal footer.
 *
 * @param {NotFoundWithLayoutPageProps} props - The props for the component.
 * @param {React.ReactNode} props.appLogo - The application logo to display at the top of the page.
 * @param {React.ReactNode} props.minimalFooter - The minimal footer to display at the bottom of the page.
 *
 * @returns {JSX.Element} The rendered "404 Not Found" page with layout.
 */
const NotFoundWithLayoutPage = ({ appLogo, minimalFooter }: NotFoundWithLayoutPageProps) => {
  return (
    <div className="flex max-h-screen w-full flex-col items-center justify-between p-3 lg:w-[100%]">
      <div className="flex w-full items-center justify-between p-5 xs:p-6">
        {appLogo}
        <a
          href="/help?id=help-on-error"
          className={cn(
            buttonVariants({ variant: "link" }),
            "text-md text-right",
            "hidden", // TODO: Hide the help for now
          )}
        >
          Help?
        </a>
      </div>
      <div className="text-md -mt-4 flex grow flex-col items-center justify-center gap-3 mlg:flex-row">
        <DocumentMagnifyingGlassIcon className="h-[25%] stroke-1 text-slate-100 opacity-40 mlg:h-[40%]" />
        <h2 className="text-4xl text-primary">404</h2>
        <Separator orientation="vertical" className="hidden h-10 w-[1px] rounded-full mlg:flex" />
        <p>Page not found</p>
      </div>
      {minimalFooter}
    </div>
  );
};

export { NotFoundWithLayoutPage };
