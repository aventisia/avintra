import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { SparklesIcon } from "lucide-react";
import { useDefinePromptForm } from "../../hooks/useDefinePromptForm";
import { promptZodSchema } from "../../constants/prompt-zod-schema";
import z from "zod";
import { Form, TextareaField } from "@aventisia/ui/form";

const PromptForm = () => {
  // Define form
  const { form, isDirty, isSubmitting } = useDefinePromptForm();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof promptZodSchema>) => {
    console.log(formData);
  };
  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5 p-2"
      checkDirtyForm={false}
    >
      <div className="px-2">
        <p className="mb-2 border-b text-xs">User Prompt</p>
        <TextareaField rows={12} name="userPrompt" />
      </div>
      <div className="px-2">
        <p className="mb-2 border-b text-xs">System Prompt</p>
        <TextareaField rows={12} name="systemPrompt" />
      </div>
      <div className="border-t p-2 pt-2.5 ">
        <Button
          variant="outline"
          size="sm"
          disabled={!isDirty || isSubmitting}
          className={cn(
            "flex items-center gap-2 rounded-full border-primary text-primary transition-all duration-200 hover:bg-primary hover:text-white",
            // isPending && "cursor-wait",
          )}
          type="submit"
        >
          {/* Icon with pulse animation while generating */}
          <SparklesIcon
            className={cn(
              "h-4 w-4",
              // isPending && "animate-pulse"
            )}
          />
          Improve with AI
        </Button>
      </div>
    </Form>
  );
};

export default PromptForm;
