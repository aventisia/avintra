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
import { toast } from "@aventisia/ui/sonner";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { getProviderModels } from "../apis/llm-model-apis";
import { Model, modelProviders } from "../constants/model-providers";
import { useModelProviderStore } from "../stores/model-provider-store";
import { uniqueAndNormalizeArray } from "../utils/uniqueAndNormalizeArray";
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

  const [initialModels, setInitialModels] = useState<Model[]>([]);

  // Derived values
  const provider = form.watch(`${modelType}.provider`);
  const isBYOKEnabled = form.watch(`${modelType}.isBYOKEnabled`);
  const credentialId = form.watch(`${modelType}.credentialId`);

  const { models } = useModelProviderStore(
    useShallow((state) => ({ models: state.models })),
  );

  // 2. Initialize on mount (for saved data)
  useEffect(() => {
    const initializeModels = async () => {
      let initModels: Model[] = [];
      if (!isBYOKEnabled) {
        // Static models mode - no need to fetch
        const provider = modelProviders.find(
          (p) => p.value === form.watch(`${modelType}.provider`),
        );

        initModels =
          models?.length > 0
            ? models
            : (provider?.models.filter((m) => m.available) ?? []);
      } else {
        // BYOK mode - need to fetch models if credential exists
        if (credentialId && provider) {
          try {
            const mapper: Record<string, string> = {
              openai: "OpenAI",
              googlegemini: "Gemini",
              openrouter: "OpenRouter",
            };

            const providerM = mapper[provider];
            if (providerM) {
              initModels = (await getProviderModels(providerM, credentialId))
                .data as Model[];
            }
          } catch (err) {
            toast.error(err as string);
            setInitialModels([]);
          }
        }
      }
      setInitialModels(uniqueAndNormalizeArray(initModels));
    };

    initializeModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models]);

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
                Model Configuration
              </span>
            </div>
            {!openItem && (
              <Controller
                control={form.control}
                name={`${modelType}.model`}
                render={({ field }) => (
                  <FormItem className="absolute left-[10.5rem] top-[50%] translate-y-[-50%] w-40">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="text-primary rounded-full bg-slate-200 h-6 text-xs text-left">
                        <span className="w-full">
                          {field.value || "Select LLM"}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {import.meta.env.MODE !== "production"
                          ? initialModels?.map((model) => (
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
