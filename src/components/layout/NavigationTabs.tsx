import { useNavigatePreserveQuery } from "@/hooks/useNavigatePreserveQuery";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { useEffect, useState } from "react";

const tabs = [
  { id: "label", label: "Label" },
  { id: "test", label: "Test" },
  { id: "train", label: "Train" },
  { id: "view", label: "View" },
];

export const NavigationTabs = () => {
  const [activeTab, setActiveTab] = useState("label");

  useEffect(() => {
    const currentPath = window.location.pathname.split("/")[1];
    setActiveTab(currentPath);
  }, []);

  const navigateWithQueryParams = useNavigatePreserveQuery();

  const handleTabClick = (id: string) => {
    //TODO: Add logic to handle moving to next tab based on pervious tab status
    setActiveTab(id);
    navigateWithQueryParams(id);
  };

  return (
    <>
      {/* Tabs Container */}
      <div className="flex rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => (
          <Button
            variant={"ghost"}
            size={"xs"}
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-center text-sm font-medium transition-colors ${
              activeTab === tab.id && "bg-white shadow-sm hover:bg-white"
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </>
  );
};
