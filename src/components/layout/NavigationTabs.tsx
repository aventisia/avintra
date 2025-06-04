import { useNavigatePreserveQuery } from "@/hooks/useNavigatePreserveQuery";

import { Button } from "@aventisia/ui/buttons";
import { useDocumentTitle } from "@aventisia/ui/hooks";
import { useEffect, useState } from "react";

const tabs = [
  { id: "setup-test", label: "Setup & Test" },
  { id: "run-review", label: "Run & Review" },
  { id: "fine-tune", label: "Fine-tune" },
];

export const NavigationTabs = () => {
  const [activeTab, setActiveTab] = useState("setup-test");

  useEffect(() => {
    const currentPath = window.location.pathname.split("/")[1];

    const normalizedPath =
      currentPath === "run-review-view" ? "run-review" : currentPath;
    setActiveTab(normalizedPath);
  }, []);

  const { navigateWithQueryParams, modelName } = useNavigatePreserveQuery();

  const handleTabClick = (id: string) => {
    //TODO: Add logic to handle moving to next tab based on pervious tab status
    setActiveTab(id);
    navigateWithQueryParams(id);
  };

  // Find the label of the active tab
  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label || "";

  useDocumentTitle(`${modelName} | ${activeTabLabel}`);

  return (
    <>
      {/* Tabs Container */}
      <div className="flex rounded-full bg-white/10 p-1 text-white">
        {tabs.map((tab) => (
          <Button
            variant={"ghost"}
            size={"xs"}
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`h-7 flex-1 rounded-full px-3 py-1.5 text-center text-sm font-medium transition-colors hover:bg-primary hover:text-white ${
              activeTab === tab.id && "bg-primary shadow-sm"
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </>
  );
};
