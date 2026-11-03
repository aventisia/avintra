import { ClockIcon, RocketIcon } from "@phosphor-icons/react";
import React from "react";
import { useLocation } from "react-router-dom";

const ComingSoon: React.FC = () => {
  const location = useLocation();

  const getPageNameFromPath = React.useCallback((path: string): string => {
    if (!path) return "Page";

    return (
      path
        .replace(/^\//, "")
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ") || "Page"
    );
  }, []);

  const pageName = React.useMemo(
    () => getPageNameFromPath(location.pathname),
    [location.pathname, getPageNameFromPath],
  );

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <div className="flex flex-col items-center space-y-8 text-center">
        <div
          className="flex items-center justify-center rounded-lg bg-sunken p-6"
          aria-hidden="true"
        >
          <RocketIcon className="h-16 w-16 text-primary" />
        </div>
        <div
          className="flex items-center justify-center space-x-4 text-muted-foreground"
          aria-live="polite"
        >
          <ClockIcon className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm">Feature under development</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-title text-ink">{pageName} Page is Coming Soon</h1>

          <p className="mx-auto max-w-md text-lg text-ink-2">
            We're currently working on developing the {pageName.toLowerCase()} feature. Stay tuned
            for exciting updates!
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ComingSoon);
