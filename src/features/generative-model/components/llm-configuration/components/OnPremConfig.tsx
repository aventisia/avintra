/* eslint-disable @typescript-eslint/no-explicit-any */
import { generativeModelInputZodSchema } from "@/features/generative-model/constants/model-input-zod-schema";
import { SliderField } from "@/shared/Slider/SliderField";
import { SelectField } from "@/shared/select-field/SelectField";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@aventisia/ui/accordion";
import { AutosizeTextareaField, FormItem, FormLabel } from "@aventisia/ui/form";
import { Tooltip } from "@aventisia/ui/tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { ChevronRight } from "lucide-react";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import {
  baseLlmProps,
  nodePromptProps,
} from "../constants/llm-config-field-props";

interface OnPremConfigProps {
  form: UseFormReturn<z.infer<typeof generativeModelInputZodSchema>>;
  taskType:
    | "thoughtLeadership"
    | "companyDeepDives"
    | "personaResearch"
    | "rfpRpiResponseGenerator"
    | "documentDrafting";
}

const OnPremConfig = ({ form, taskType }: OnPremConfigProps) => {
  return (
    <>
      <SelectField {...baseLlmProps} name={`${taskType}.llm`} />

      {/* Advanced Options */}
      <Accordion type="single" collapsible className="w-full !p-0 mt-4">
        <AccordionItem value="item-2" className="!border-none">
          <AccordionTrigger className="text-base flex justify-between items-center hover:no-underline [&>svg]:hidden group !py-1">
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
            <FormItem>
              <div className="flex items-center gap-0.5">
                <FormLabel className={"flex items-center gap-0.5 mb-1"}>
                  Temperature
                </FormLabel>
                <Tooltip
                  side="right"
                  content={
                    <ul className="list-disc marker:white pl-4">
                      <li>
                        Precise: For deterministic tasks like classification,
                        summarization, parsing
                      </li>
                      <li>
                        Balances: When a balance of creativity and accuracy is
                        needed (e.g., emails)
                      </li>
                      <li>
                        Creative: For storytelling, idea generation, marketing
                        copy
                      </li>
                      <li>
                        Experimental: Brainstorming, exploratory prompts (warn
                        users of unpredictable results)
                      </li>
                    </ul>
                  }
                >
                  <div className="rounded hover:bg-slate-100 hover:text-primary mb-1 ml-1">
                    <InformationCircleIcon className="h-4 w-4" />
                  </div>
                </Tooltip>
              </div>
              <Controller
                control={form.control}
                name={`${taskType}.temperature`}
                render={({ field }) => {
                  return (
                    <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2">
                      <span className="text-sm">0</span>
                      <SliderField
                        name={field.name}
                        value={[field.value ?? 0]}
                        onValueChange={(val) => field.onChange(val[0])}
                        onValueCommit={field.onBlur}
                        min={0}
                        max={1.2}
                        step={0.1}
                        className="text-sm resize-none"
                        trackColor="bg-accent"
                      />
                      <span className="text-sm">1.2</span>
                    </div>
                  );
                }}
              />
            </FormItem>
            <AutosizeTextareaField
              {...nodePromptProps}
              name={`${taskType}.nodePrompt`}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default OnPremConfig;
