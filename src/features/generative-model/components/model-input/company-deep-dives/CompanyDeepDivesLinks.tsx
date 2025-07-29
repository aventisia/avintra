import { linkProps } from "@/features/generative-model/constants/generative-model-field-props.ts/generative-model-field-props";
import { generativeModelInputZodSchema } from "@/features/generative-model/constants/model-input-zod-schema";

import { Button } from "@aventisia/ui/buttons";
import { InputField } from "@aventisia/ui/form";
import { TrashIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "lucide-react";
import { useEffect } from "react";
import { Controller, UseFormReturn, useFieldArray } from "react-hook-form";
import { z } from "zod";

type FormSchema = z.infer<typeof generativeModelInputZodSchema>;

type ThoughtLeadershipLinksdProps = {
  form: UseFormReturn<FormSchema>;
};

const CompanyDeepDiveLinks = ({ form }: ThoughtLeadershipLinksdProps) => {
  const { control } = form;
  const {
    fields: linkFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "companyDeepDives.links",
  });

  useEffect(() => {
    if (linkFields.length === 0) {
      form.setValue("companyDeepDives.links", [{ id: "", link: "" }]);
    }
  }, []);

  return (
    <div className=" rounded-lg border">
      <div className="flex items-center justify-between px-3 py-2 bg-muted rounded-t-lg">
        <p className="text-md">Links</p>
        <Button
          variant="ghost"
          size="icon8"
          onClick={() => append({ id: "", link: "" })}
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
                  name={`companyDeepDives.links.${index}.link`}
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

export default CompanyDeepDiveLinks;
