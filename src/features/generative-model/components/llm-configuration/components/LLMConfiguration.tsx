/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModelLLMEnum } from "@/features/model-library-table/enums/model-llm-enum";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import CloudConfig from "./CloudConfig";
import OnPremConfig from "./OnPremConfig";

interface LLMConfigurationProps {
  form: UseFormReturn<z.infer<any>>;
}

const LLMConfiguration = ({ form }: LLMConfigurationProps) => {
  const [openItem, setOpenItem] = useState<string | undefined>("");

  return (
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
              name={`generativeModel.llm`}
              render={({ field }) => (
                <FormItem className="absolute left-40 top-[50%] translate-y-[-50%] w-[125px]">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="text-primary rounded-full bg-slate-200 h-6 text-xs text-left">
                      <span className="w-full">
                        {(field.value &&
                          ModelLLMEnum[
                            field.value as keyof typeof ModelLLMEnum
                          ]) ||
                          "Select LLM"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ModelLLMEnum).map(([value, label]) => (
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
            <TabsList className="grid grid-cols-2 rounded-none mb-4 bg-white">
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
              <OnPremConfig form={form} />
            </TabsContent>

            <TabsContent value="Cloud">
              <CloudConfig form={form} />
            </TabsContent>
          </Tabs>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default LLMConfiguration;
