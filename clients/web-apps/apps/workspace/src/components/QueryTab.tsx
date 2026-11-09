import { cn } from "@avplatform/ui/lib";
import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { type Icon } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { SEGMENTED_TABS_LIST_CLASS, SEGMENTED_TABS_TRIGGER_CLASS } from "./segmented-tabs.constant";

export interface QueryTabItem {
  label: string;
  value: string;
  icon?: Icon;
}

interface QueryTabsProps {
  tabs: QueryTabItem[];
  queryKey?: string;
  defaultTab?: string;
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
  onTabChange?: (value: string) => void;
}

/**
 * A generic Tabs component that automatically syncs its state with URL query parameters.
 */
export const QueryTabs = ({
  tabs,
  queryKey = "tab", // defaults to '?tab='
  defaultTab,
  className,
  listClassName,
  triggerClassName,
  onTabChange,
}: QueryTabsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get(queryKey);

  // Fallback to the provided defaultTab, or the first tab in the array
  const fallbackTab = defaultTab || tabs[0]?.value;
  const isValidTab = tabs.some((t) => t.value === tabParam);

  const [tabValue, setTabValue] = useState<string>(tabParam && isValidTab ? tabParam : fallbackTab);

  const handleTabParamChange = useCallback(
    (newTab: string) => {
      // Preserve other URL parameters (like search, date filters, etc.)
      const params = Object.fromEntries(searchParams.entries());
      params[queryKey] = newTab;
      setSearchParams(params);
    },
    [searchParams, setSearchParams, queryKey],
  );

  // Sync tab selection with URL param on mount and when param changes externally
  useEffect(() => {
    if (tabParam && isValidTab) {
      setTabValue(tabParam);
    } else if (!tabParam) {
      handleTabParamChange(fallbackTab);
    }
  }, [fallbackTab, handleTabParamChange, isValidTab, tabParam]);

  const handleTabSelect = (tab: string) => {
    setTabValue(tab);
    handleTabParamChange(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <Tabs value={tabValue} onValueChange={handleTabSelect} className={className}>
      <TabsList className={cn(SEGMENTED_TABS_LIST_CLASS, listClassName)}>
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(SEGMENTED_TABS_TRIGGER_CLASS, triggerClassName)}
            >
              {TabIcon && <TabIcon className="size-4 shrink-0" aria-hidden="true" />}
              <span>{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};
