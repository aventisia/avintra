/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@aventisia/ui/accordion";
import { AutosizeTextareaField } from "@aventisia/ui/form";
import { ChevronRight } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { nodePromptProps } from "../constants/llm-config-field-props";
import { ModelConfigField } from "./ModelConfigField";

interface CloudConfigProps {
  form: UseFormReturn<any>;
  modelType:
    | "extraction"
    | "summarization"
    | "classification"
    | "sentimentAnalytics"
    | "questionAnswer"
    | "aiPersona";
}

const CloudConfig = ({ modelType }: CloudConfigProps) => {
  return (
    <div className="space-y-4">
      {/* Advanced Options */}
      <Accordion type="single" collapsible className="w-full !p-0 mt-4">
        <AccordionItem value="item-2" className="!border-none">
          <ModelConfigField name={modelType} />
          <AccordionTrigger className="mt-4 text-base flex justify-between items-center hover:no-underline [&>svg]:hidden group !py-1">
            <div className="mr-1">
              <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
            </div>

            <div className="flex items-center w-full justify-start gap-2 group">
              <span className="text-md group-hover:underline">
                Advanced Options
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="flex flex-col gap-4 text-balance px-1 pt-4">
            <AutosizeTextareaField
              {...nodePromptProps}
              name={`${modelType}.nodePrompt`}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default CloudConfig;
