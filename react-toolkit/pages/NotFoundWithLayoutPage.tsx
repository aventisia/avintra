import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { MinimalFooter } from "@/react-toolkit/layout/MinimalFooter";
import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { Separator } from "@/react-toolkit/ui/separator";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface NotFoundWithLayoutPageProps {
  appLogo?: React.ReactNode;
}

const NotFoundWithLayoutPage = ({ appLogo }: NotFoundWithLayoutPageProps) => {
  return (
    <div className="flex max-h-screen w-full flex-col items-center justify-between p-3 lg:w-[100%]">
      <div className="flex w-full items-center justify-between p-5 xs:p-6">
        {appLogo && <AppLogo showFullLogo={true} />}
        <a
          href="/help?id=help-on-error"
          className={cn(
            buttonVariants({ variant: "link" }),
            "text-right text-md",
            "hidden", // TODO: Hide the help link till we have a docs app
          )}
        >
          Help?
        </a>
      </div>
      <div className="-mt-4 flex grow flex-col items-center justify-center gap-3 text-md mlg:flex-row">
        <DocumentMagnifyingGlassIcon className="h-[25%] stroke-1 text-slate-100 opacity-40 mlg:h-[40%]" />
        <h2 className="text-4xl text-primary">404</h2>
        <Separator
          orientation="vertical"
          className="hidden h-10 w-[1px] rounded-full mlg:flex"
        />
        <p>Page not found</p>
      </div>
      <MinimalFooter />
    </div>
  );
};

export { NotFoundWithLayoutPage };

