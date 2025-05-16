import {
  instructionsProps,
  questionProps,
} from "@/features/question-answer-model/constants/question-answer-setup-form-field-props";

import { Button } from "@aventisia/ui/buttons";
import { AutosizeTextareaField } from "@aventisia/ui/form";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { questionAnswerSetupFormZodSchema } from "../../../constants/question-answer-setup-zod-schema";

type QuestionAnswerProps = {
  form: UseFormReturn<z.infer<typeof questionAnswerSetupFormZodSchema>>;
  categoryFields: { id: string }[];
  addCategory: () => void;
  removeCategory: (index: number) => void;
};

const QuestionAnswerTable = ({
  form,
  categoryFields,
  addCategory,
  removeCategory,
}: QuestionAnswerProps) => {
  const { control } = form;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-base">Questions</p>
        <Button
          variant="ghost"
          size="icon8"
          onClick={addCategory}
          type="button"
        >
          <PlusIcon className="h-5 w-5 stroke-2 text-primary" />
        </Button>
      </div>
      <div className="!mt-0.5 inline-block rounded-lg border w-full">
        <div className="grid grid-cols-2 bg-accent px-1 py-3 text-sm">
          <div className="px-3">Questions</div>
          <div className="px-3">Instructions</div>
        </div>

        {categoryFields.map((field, index) => (
          <div
            key={field.id}
            className={`justify-left grid grid-cols-2 gap-2 ${index !== categoryFields.length - 1 && "border-b"} p-2.5`}
          >
            {/* Category Name */}
            <Controller
              control={control}
              name={`questions.${index}.question`}
              render={({ field }) => (
                <AutosizeTextareaField
                  {...questionProps}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />

            <div className="grid grid-cols-[1fr_auto] gap-1">
              {/* Instructions */}
              <Controller
                control={control}
                name={`questions.${index}.instructions`}
                render={({ field }) => (
                  <AutosizeTextareaField
                    {...instructionsProps}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                )}
              />

              {/* Delete button */}
              {categoryFields.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeCategory(index)}
                  className="m-0 p-0"
                  variant="ghost"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionAnswerTable;
