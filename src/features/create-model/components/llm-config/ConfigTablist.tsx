import { cn } from "@aventisia/ui/lib";
import { TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { FlaskConicalIcon } from "lucide-react";

const ConfigTablist = () => {
  return (
    <div className="flex justify-between">
      <TabsList className="rounded-full">
        <TabsTrigger
          value="Prompt"
          className="rounded-full outline-none data-[state=active]:text-primary"
        >
          Prompt
        </TabsTrigger>
        <TabsTrigger
          value="Model"
          className="rounded-full outline-none data-[state=active]:text-primary"
        >
          Model
        </TabsTrigger>
        <TabsTrigger
          value="Memory"
          className="rounded-full outline-none data-[state=active]:text-primary"
        >
          Memory
        </TabsTrigger>
        <TabsTrigger
          value="Tools"
          className="rounded-full outline-none data-[state=active]:text-primary"
        >
          Tools
        </TabsTrigger>
        <TabsTrigger
          value="OnError"
          className="rounded-full outline-none data-[state=active]:text-primary"
        >
          On Error
        </TabsTrigger>
      </TabsList>
      <TabsList className="rounded-full">
        <TabsTrigger
          value="Test"
          className={cn(
            "rounded-full outline-none",
            "flex items-center gap-1.5 text-primary hover:text-primary data-[state=active]:text-primary",
          )}
        >
          <FlaskConicalIcon className="h-3.5 w-3.5" />
          Test
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default ConfigTablist;
