import { Separator } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

/**
 * A functional React component that renders a "404 Not Found" page.
 *
 * This component displays a centered layout with the following elements:
 * - An icon representing a document with a magnifying glass.
 * - A "404" heading indicating the error code.
 * - A vertical separator (visible only on medium-large screens and above).
 * - A descriptive message stating "Page not found".
 *
 * The layout is responsive and adjusts for different screen sizes using Tailwind CSS classes.
 *
 * @returns A JSX element representing the "Not Found" page.
 */
const NotFoundPage = () => {
  const { appBanner } = useBaseLayoutStore(
    useShallow((state) => ({
      appBanner: state.appBanner,
    })),
  );

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-4 mlg:flex-row",
        appBanner
          ? "h-[calc(100vh-var(--header-height)-var(--header-padding)-var(--banner-height))]"
          : "h-[calc(100vh-var(--header-height)-var(--header-padding))]",
      )}
    >
      <DocumentMagnifyingGlassIcon className="h-[25%] stroke-1 text-slate-100 opacity-40 mlg:h-[40%]" />
      <h2 className="text-3xl text-primary">404</h2>
      <Separator orientation="vertical" className="hidden h-10 w-[1px] rounded-full mlg:flex" />
      <p className="text-base">Page not found</p>
    </div>
  );
};

export { NotFoundPage };
