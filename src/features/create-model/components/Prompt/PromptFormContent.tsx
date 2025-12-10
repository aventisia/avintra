import { TextareaField } from "@aventisia/ui/form";
import { TabsContent } from "@aventisia/ui/tabs";
import { ConfigPanelOuputField } from "@/features/dynamic-config-panel";
import { outputProps } from "../../constants/llm-config-field-props";

const PromptFormContent = () => {
  return (
    <TabsContent className="px-1 py-2" value="Prompt">
      <div className="flex flex-col gap-4">
        <TextareaField
          placeholder="Enter prompt here"
          autoFocus
          name="input"
          rows={20}
        />
        <h3 className="flex items-center gap-1 text-sm font-medium">
          <span className="rounded-full bg-accent px-1.5 text-indigo-600">
            Outputs
          </span>
          <span className="h-[0.06rem] flex-grow rounded bg-accent"></span>
        </h3>
        <ConfigPanelOuputField {...outputProps} />
      </div>
    </TabsContent>
  );
};

export default PromptFormContent;
