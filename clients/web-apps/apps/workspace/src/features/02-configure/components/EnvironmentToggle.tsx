import { cn } from "@avplatform/ui/lib";
import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { useShallow } from "zustand/react/shallow";

import { type ConfigureEnvironment, useEnvironmentStore } from "@/stores/environment-store";

const ENV_OPTIONS: { label: string; value: ConfigureEnvironment }[] = [
  { label: "Dev", value: "dev" },
  { label: "Prod", value: "prod" },
];

type EnvironmentToggleProps = {
  className?: string;
};

/**
 * A Dev/Prod segmented control for the Configure section, rendered as a
 * contained pill: a rounded track holding a rounded active thumb the user can
 * switch between. Selecting an environment updates the persisted store, and
 * every Configure API call reads the selected value to send as the
 * `X-Env-Type` request header.
 *
 * Highlights the Prod option in amber so the current environment is hard to miss.
 */
export const EnvironmentToggle = ({ className }: EnvironmentToggleProps) => {
  const { env, setEnv } = useEnvironmentStore(
    useShallow((state) => ({
      env: state.env,
      setEnv: state.setEnv,
    })),
  );

  return (
    <Tabs
      value={env}
      onValueChange={(value) => setEnv(value as ConfigureEnvironment)}
      className={cn("inline-flex items-center", className)}
    >
      <TabsList className="gap-0.5 rounded-md border border-line-strong bg-hover p-0.5 h-6">
        {ENV_OPTIONS.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className={cn(
              "h-full rounded-sm px-1.5 py-0 font-medium text-3xs uppercase tracking-widest transition-colors data-[state=active]:after:hidden",
              option.value === "prod"
                ? "data-[state=active]:bg-warn data-[state=active]:text-bg"
                : "data-[state=active]:bg-surface data-[state=active]:text-ink-2",
            )}
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
