import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { useShallow } from "zustand/react/shallow";

import { type ConfigureEnvironment, useEnvironmentStore } from "@/stores/environment-store";

const ENV_OPTIONS: { label: string; value: ConfigureEnvironment }[] = [
  { label: "Dev", value: "dev" },
  { label: "Prod", value: "prod" },
];

/**
 * A Dev/Prod segmented control for the Configure section. Selecting an
 * environment updates the persisted store, and every Configure API call reads
 * the selected value to send as the `X-Env-Type` request header.
 */
export const EnvironmentToggle = () => {
  const { env, setEnv } = useEnvironmentStore(
    useShallow((state) => ({
      env: state.env,
      setEnv: state.setEnv,
    })),
  );

  return (
    <div className="flex items-center">
      <Tabs
        value={env}
        onValueChange={(value) => setEnv(value as ConfigureEnvironment)}
        className="[&>div]:h-auto"
      >
        <TabsList className="h-5 bg-transparent p-0.5">
          {ENV_OPTIONS.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="h-full px-1.5 text-3xs font-medium uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-primary"
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};
