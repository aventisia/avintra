/* eslint-disable @typescript-eslint/no-explicit-any */
import { linkProps } from "@/features/generative-model/constants/generative-model-field-props/generative-model-field-props";

import { Button } from "@aventisia/ui/buttons";
import { InputField } from "@aventisia/ui/form";
import { TrashIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "lucide-react";
import { Controller, UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";

type FormSchema = z.infer<any>;

type GenerativeInputLinksProps = {
  form: UseFormReturn<FormSchema>;
  title?: string;
  name?: string;
};

const GenerativeInputLinks = ({
  form,
  title = "Links",
  name = "generativeModel.setupObject.links",
}: GenerativeInputLinksProps) => {
  const { control } = form;
  const {
    fields: linkFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name,
  });

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between px-3 py-2 bg-muted rounded-t-lg">
        <p className="text-md">{title}</p>
        <Button
          variant="ghost"
          size="icon8"
          onClick={() => append({ url: "" })}
          type="button"
        >
          <PlusIcon className="h-5 w-5 stroke-2 text-primary" />
        </Button>
      </div>

      {linkFields.length > 0 && (
        <div className="px-2 py-4 space-y-4">
          {linkFields.map((field, index) => {
            return (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_auto] items-center gap-2"
              >
                <Controller
                  control={control}
                  name={`generativeModel.setupObject.links.${index}.url`}
                  render={({ field }) => (
                    <InputField
                      {...linkProps}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  )}
                />
                {linkFields.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    className="m-0 p-0"
                    variant="ghost"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GenerativeInputLinks;
