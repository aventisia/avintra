import { useNavigatePreserveQuery } from "@/hooks/useNavigatePreserveQuery";

import { Button } from "@aventisia/ui/buttons";
import { useDocumentTitle } from "@aventisia/ui/hooks";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

const tabs = [
  { id: "setup-test", label: "Setup & Test" },
  { id: "run-review", label: "Run & Review" },
  { id: "fine-tune", label: "Fine-tune" },
];

export const NavigationTabs = () => {
  const [activeTab, setActiveTab] = useState("setup-test");
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const pathSegment = location.pathname.split("/")[1]; // first segment after "/"
    const source = searchParams.get("source");

    let normalizedTab = pathSegment;

    if (pathSegment === "view") {
      if (source === "run-review" || source === "fine-tune") {
        normalizedTab = source;
      } else {
        normalizedTab = "run-review"; // fallback for /view
      }
    }

    setActiveTab(normalizedTab);
  }, [location.pathname, searchParams]);

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
