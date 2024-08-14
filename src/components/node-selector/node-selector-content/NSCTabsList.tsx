import { TabsList, TabsTrigger } from "@/react-toolkit/ui/tabs";

const triggerList = [
  { value: "all", label: "All tools" },
  { value: "activities", label: "Activities" },
  { value: "logical", label: "Logical" },
  { value: "connectors", label: "Connectors" },
];

export const NSCTabsList = () => {
  return (
    <TabsList className="absolute bottom-0 left-0 right-0 h-9 w-full rounded-t-none bg-slate-100">
      {triggerList.map((item) => (
        <TabsTrigger
          key={item.value}
          value={item.value}
          className="h-6 rounded-md px-2 text-2xs"
        >
          {item.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
