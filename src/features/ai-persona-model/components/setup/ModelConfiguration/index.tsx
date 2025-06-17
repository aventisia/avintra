import {
  modelTypeProps,
  // temperatureProps,
} from "@/features/ai-persona-model/constants/ai-persona-setup-form-field-props";
import { aiPersonaSetupFormZodSchema } from "@/features/ai-persona-model/constants/ai-persona-setup-zod-schema";
import { SliderField } from "@/shared/Slider/SliderField";
import { SelectField } from "@/shared/select-field/SelectField";

import { FormItem, FormLabel } from "@aventisia/ui/form";
import { Tooltip } from "@aventisia/ui/tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

type FormSchema = z.infer<typeof aiPersonaSetupFormZodSchema>;

type TemperatureFieldProps = {
  form: UseFormReturn<FormSchema>;
};

const ModelConfiguration = ({ form }: TemperatureFieldProps) => {
  // const temperature = form.watch("temperature");

  return (
    <div className="space-y-4">
      <p className="text-base">Model Configuration</p>
      <div className="grid md:grid-cols-2 gap-4 items-center">
        <SelectField {...modelTypeProps} />

        {/* <SliderField
        value={[temperature ?? 0]}
        onValueChange={(val) =>
          form.setValue("temperature", val[0], { shouldValidate: true })
        }
        min={0}
        max={1.2}
        step={0.1}
        {...temperatureProps}
      /> */}

        <FormItem>
          {/* <FormLabel className="flex items-center justify-between text-sm">
          Temperature
        </FormLabel> */}

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
                    Creative: For storytelling, idea generation, marketing copy
                  </li>
                  <li>
                    Experimental: Brainstorming, exploratory prompts (warn users
                    of unpredictable results)
                  </li>
                </ul>
              }
            >
              <div className="rounded hover:bg-slate-100 hover:text-primary">
                <InformationCircleIcon className="h-4 w-4" />
              </div>
            </Tooltip>
          </div>
          <Controller
            control={form.control}
            name={`temperature`}
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
                  />
                  <span className="text-sm">1.2</span>
                </div>
              );
            }}
          />
        </FormItem>
      </div>
    </div>
  );
};

export default ModelConfiguration;
