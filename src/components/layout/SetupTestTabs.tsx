import { cn } from "@aventisia/ui/lib";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const tabs = ["setup", "test"];

const SetupTestTabs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("t")?.toLowerCase();
  const defaultTab = tabs[0];
  const [selected, setSelected] = useState(
    tabParam && tabs.includes(tabParam) ? tabParam : defaultTab,
  );

  const handleTabParamChange = useCallback(
    (newTab: string) => {
      // preserve other params
      const params = Object.fromEntries(searchParams.entries());
      params.t = newTab;
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // Sync tab selection with URL param on mount and when param changes
  useEffect(() => {
    if (tabParam && tabs.includes(tabParam)) {
      setSelected(tabParam);
    } else if (!tabParam) {
      handleTabParamChange(defaultTab);
    }
  }, [defaultTab, handleTabParamChange, tabParam]);

  const handleTabSelect = (tab: string) => {
    setSelected(tab);
    handleTabParamChange(tab);
  };

  return (
    <div className="flex w-fit rounded-full bg-white/10 px-1 py-[0.22rem] text-white">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabSelect(tab)}
          className={cn(
            "group relative w-fit px-4 h-7 text-sm font-semibold capitalize",
            "text-foreground transition-colors",
          )}
        >
          <span
            className={cn(
              "relative font-medium z-10 text-white/70 group-hover:text-white",
              selected === tab && "text-white",
            )}
          >
            {tab}
          </span>
          {selected === tab && (
            <motion.span
              layoutId="tab"
              transition={{ type: "spring", duration: 0.4 }}
              className="absolute bg-primary inset-0 z-0 rounded-full shadow-sm"
            />
          )}
        </button>
      ))}
    </div>
  );
};

export { SetupTestTabs };
