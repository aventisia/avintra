/* eslint-disable @typescript-eslint/no-explicit-any */
import { LLMsEnumForProduction } from "@/enums/llms-enum";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/select-field/Select";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@aventisia/ui/accordion";
import { FormItem } from "@aventisia/ui/form";
import { cn } from "@aventisia/ui/lib";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { useModelProviderStore } from "../stores/model-provider-store";
import CloudConfig from "./CloudConfig";

interface LLMConfigurationProps {
  form: UseFormReturn<any>;
  modelType:
    | "extraction"
    | "summarization"
    | "classification"
    | "sentimentAnalytics"
    | "questionAnswer"
    | "aiPersona";
  className?: string;
}

const LLMConfiguration = ({ form, modelType }: LLMConfigurationProps) => {
  const [openItem, setOpenItem] = useState<string | undefined>("");

  const { models } = useModelProviderStore(
    useShallow((state) => ({ models: state.models })),
  );

  return (
    <>
      <Accordion
        type="single"
        collapsible
        value={openItem}
        onValueChange={(val) => setOpenItem(val)}
        className="w-full"
      >
        <AccordionItem value="item-1" className="!border-none">
          <AccordionTrigger
            className={cn(
              "text-base flex justify-between items-center hover:no-underline [&>svg]:hidden group relative ",
              openItem && "pb-0",
            )}
          >
            <div className="mr-1">
              <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
            </div>

            <div className="flex items-center w-full justify-start gap-2 group ">
              <span className="text-md group-hover:underline">
                LLM Configuration
              </span>
            </div>
            {!openItem && (
              <Controller
                control={form.control}
                name={`${modelType}.model`}
                render={({ field }) => (
                  <FormItem className="absolute left-40 top-[50%] translate-y-[-50%] w-40">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="text-primary rounded-full bg-slate-200 h-6 text-xs text-left">
                        <span className="w-full">
                          {field.value || "Select LLM"}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {import.meta.env.MODE !== "production"
                          ? models.map((model) => (
                              <SelectItem key={model.value} value={model.value}>
                                {model.value}
                              </SelectItem>
                            ))
                          : Object.entries(LLMsEnumForProduction).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}
          </AccordionTrigger>

          <AccordionContent className="flex flex-col gap-4 text-balance px-1 !border-none">
            <CloudConfig form={form} modelType={modelType} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default LLMConfiguration;
