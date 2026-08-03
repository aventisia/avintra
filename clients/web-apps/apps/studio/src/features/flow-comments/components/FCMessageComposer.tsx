import { AutosizeTextarea } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Form } from "@avplatform/ui/form";
import { FormControl } from "@avplatform/ui/form";
import { FormField } from "@avplatform/ui/form";
import { FormItem } from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { CheckIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { flowCommentOptimisticMutationFn } from "../apis/flow-comments-apis";
import { flowCommentZodSchema } from "../constants/flow-comment-zod-schema";
import { FlowCommentDto } from "../dtos/flow-comment-dto";
import { useFlowCommentsStore } from "../stores/flow-comments-store";

interface FCMessageComposerProps {
  crudAction: "create" | "update";
  form: UseFormReturn<z.infer<typeof flowCommentZodSchema>>;
  className?: string;
}

/**
 * Renders a message composer component for creating or updating flow comment.
 *
 * @param {string} props.crudAction - The CRUD action ("create" or "update").
 * @param {Object} props.form - The form object. Seperate form object are being used for create and update flow comment
 * @param {string} props.className - The CSS class name for the component.
 */
export const FCMessageComposer = ({ crudAction, form, className }: FCMessageComposerProps) => {
  // Get store state and actions
  const { fcQueryKey, setFlowCommentId } = useFlowCommentsStore(
    useShallow((state) => ({
      fcQueryKey: state.fcQueryKey,
      setFlowCommentId: state.setFlowCommentId,
    })),
  );

  // Define optimistic mutation (create or update)
  const { mutate: mutateFlowComment } = useListOptimisticMutation<
    FlowCommentDto,
    FlowCommentDto | boolean,
    FlowCommentDto
  >([form.getValues("id")], flowCommentOptimisticMutationFn, fcQueryKey, "asc", false);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof flowCommentZodSchema>) => {
    // Call mutation
    mutateFlowComment({
      payload: formData as unknown as FlowCommentDto,
      crudAction: crudAction,
    });

    // Reset form
    form.reset();

    // Reset flow comment id
    setFlowCommentId("");
  };

  // Return the component
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("relative w-auto transition-all duration-500", className)}
    >
      {/* Comment to edit. Note: We don't need FieldMessage thats why using the AutosizeTextarea directly instead of form field AutosizeTextareaField */}
      <FormField
        control={form.control}
        name="comment"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <AutosizeTextarea
                maxHeight={crudAction === "create" ? 200 : 2000}
                minHeight={36}
                {...field}
                className="h-10 resize-none border-none bg-slate-100 py-2.5 pr-12 text-xs"
                placeholder="Type a comment..."
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Submit button */}
      <Button
        type="submit"
        variant={"ghost"}
        size={"icon8"}
        className="group/submit absolute bottom-1 right-1 h-[2.04rem] w-[2.04rem]"
      >
        {crudAction === "create" ? (
          <PaperAirplaneIcon className="h-5 w-5 text-[--icon-color] group-hover/submit:text-primary" />
        ) : (
          <CheckIcon className="h-5 w-5 text-[--icon-color] group-hover/submit:text-primary" />
        )}
      </Button>
    </Form>
  );
};
