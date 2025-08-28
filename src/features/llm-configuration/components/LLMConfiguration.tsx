/* eslint-disable @typescript-eslint/no-explicit-any */
import { LLMsEnum } from "@/enums/llms-enum";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";

import CloudConfig from "./CloudConfig";
import OnPremConfig from "./OnPremConfig";

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

const LLMConfiguration = ({
  form,
  modelType,
  className,
}: LLMConfigurationProps) => {
  const [openItem, setOpenItem] = useState<string | undefined>("");

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
          <AccordionTrigger className="text-base flex justify-between items-center hover:no-underline [&>svg]:hidden group relative">
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
                name={`${modelType}.llm`}
                render={({ field }) => (
                  <FormItem className="absolute left-40 top-[50%] translate-y-[-50%] w-[125px]">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="text-primary rounded-full bg-slate-200 h-6 text-xs text-left">
                        <span className="w-full">
                          {(field.value &&
                            LLMsEnum[field.value as keyof typeof LLMsEnum]) ||
                            "Select LLM"}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LLMsEnum).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}
          </AccordionTrigger>

          <AccordionContent className="flex flex-col gap-4 text-balance px-1 !border-none">
            <Tabs defaultValue="OnPrem">
              <TabsList
                className={cn("grid grid-cols-2 rounded-none mb-4", className)}
              >
                <TabsTrigger
                  value="OnPrem"
                  className="border-b-slate-200 data-[state=active]:bg-transparent data-[state=active]:border-b data-[state=active]:border-b-black rounded-none"
                >
                  Aventisia on-prem LLMs
                </TabsTrigger>
                <TabsTrigger
                  value="Cloud"
                  className="border-b-slate-200 data-[state=active]:bg-transparent data-[state=active]:border-b data-[state=active]:border-b-black rounded-none"
                >
                  Connect to your cloud LLMs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="OnPrem">
                <OnPremConfig form={form} modelType={modelType} />
              </TabsContent>

              <TabsContent value="Cloud">
                <CloudConfig form={form} modelType={modelType} />
              </TabsContent>
            </Tabs>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default LLMConfiguration;
