import { Tabs, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { label: "time", path: "/configure/triggers/time" },
  { label: "email", path: "/configure/triggers/email" },
  { label: "message", path: "/configure/triggers/message" },
  { label: "webhook", path: "/configure/triggers/webhook" },
];

export const TriggerTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // find active tab based on URL
  const activeTab =
    tabs.find((tab) => location.pathname.includes(tab.path))?.label ?? "time";

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => {
        const tab = tabs.find((t) => t.label === val);
        if (tab) navigate(tab.path);
      }}
    >
      <TabsList className="h-fit rounded-lg px-1.5 py-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.label}
            value={tab.label}
            className="rounded-lg py-0.5 capitalize"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
