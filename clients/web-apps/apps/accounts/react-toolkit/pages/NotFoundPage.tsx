import { Separator } from "@avplatform/ui";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";

const NotFoundPage = () => {
  return (
    <div className="flex h-[calc(100vh-var(--header-height)-1px)] w-full flex-col items-center justify-center gap-4 mlg:flex-row">
      <DocumentMagnifyingGlassIcon className="h-[25%] stroke-1 text-slate-100 opacity-40 mlg:h-[40%]" />
      <h2 className="text-3xl text-primary">404</h2>
      <Separator orientation="vertical" className="hidden h-10 w-[1px] rounded-full mlg:flex" />
      <p className="text-base">Page not found</p>
    </div>
  );
};

export { NotFoundPage };
