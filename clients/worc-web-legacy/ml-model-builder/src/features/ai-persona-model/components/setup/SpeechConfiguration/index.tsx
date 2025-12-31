import { aiPersonaSetupFormZodSchema } from "@/features/ai-persona-model/constants/ai-persona-setup-zod-schema";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@aventisia/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import CloudConfig from "./CloudConfig";
import OnPremConfig from "./OnPremConfig";

type FormSchema = z.infer<typeof aiPersonaSetupFormZodSchema>;

type SpeechConfigurationFieldProps = {
  form: UseFormReturn<FormSchema>;
};

const SpeechConfiguration = ({ form }: SpeechConfigurationFieldProps) => {
  const [openItem, setOpenItem] = useState<string | undefined>("");
  const configurationTypeValue = form.watch(
    "aiPersona.setupObject.speechConfiguration.configurationType",
  );

  const handleTabChange = (newValue: "OnPrem" | "Cloud") => {
    form.setValue(
      "aiPersona.setupObject.speechConfiguration.configurationType",
      newValue,
      { shouldValidate: true, shouldDirty: true },
    );
  };

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
              Speech Configuration
            </span>
          </div>
        </AccordionTrigger>

        <AccordionContent className="flex flex-col gap-4 text-balance px-1 !border-none">
          <Tabs
            value={configurationTypeValue}
            onValueChange={(val) => handleTabChange(val as "OnPrem" | "Cloud")}
            className="bg-white"
          >
            <TabsList className="grid grid-cols-2 rounded-none mb-4 bg-white">
              <TabsTrigger
                value="OnPrem"
                className="border-b-slate-200 data-[state=active]:border-b data-[state=active]:border-b-black rounded-none"
              >
                Aventisia on-prem LLMs
              </TabsTrigger>
              <TabsTrigger
                value="Cloud"
                className="border-b-slate-200 data-[state=active]:border-b data-[state=active]:border-b-black rounded-none"
              >
                Connect to your cloud LLMs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="OnPrem">
              <OnPremConfig />
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

export default SpeechConfiguration;
