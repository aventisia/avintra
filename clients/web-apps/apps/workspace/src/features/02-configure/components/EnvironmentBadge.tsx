import { cn } from "@avplatform/ui/lib";

import { useEnvironmentStore } from "@/stores/environment-store";

/**
 * Small pill that surfaces the active Configure environment (DEV or PROD).
 *
 * PROD is rendered in amber so the environment is obvious at a glance; DEV is
 * intentionally quiet. Visible in both environments.
 */
export const EnvironmentBadge = ({ className }: { className?: string }) => {
  const env = useEnvironmentStore((state) => state.env);
  const isProd = env === "prod";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-1.5 py-0.5 text-3xs font-semibold uppercase tracking-widest",
        isProd
          ? "border-amber-500/40 bg-amber-500/15 text-amber-700"
          : "border-slate-300 bg-slate-100 text-slate-500",
        className,
      )}
    >
      {isProd ? "PROD" : "DEV"}
    </span>
  );
};
