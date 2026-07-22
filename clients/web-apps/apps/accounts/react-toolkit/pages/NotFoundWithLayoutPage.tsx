import { Separator } from "@avplatform/ui";
import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { MinimalFooter } from "@/react-toolkit/layout/MinimalFooter";

const NotFoundWithLayoutPage = () => {
  return (
    <div className="flex max-h-screen w-full flex-col items-center justify-between p-3 lg:w-[100%]">
      <div className="flex w-full items-center justify-between p-5 xs:p-6">
        <AppLogo showFullLogo={true} className="h-7" />
        <a
          href="/help?id=help-on-error"
          className={cn(
            buttonVariants({ variant: "link" }),
            "text-md text-right",
            "hidden", // TODO: Hide the help link till we have a docs app
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
      <MinimalFooter />
    </div>
  );
};

export { NotFoundWithLayoutPage };
