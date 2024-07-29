import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { cn } from "@/react-toolkit/lib/utils";
import { AutosizeTextarea } from "@/react-toolkit/ui/autosize-textarea/AutosizeTextarea";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Form } from "@/react-toolkit/ui/form/Form";
import { FormControl } from "@/react-toolkit/ui/form/FormControl";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
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
export const FCMessageComposer = ({
  crudAction,
  form,
  className,
}: FCMessageComposerProps) => {
  // 1. Get store state and actions
  const { fcQueryKey, setFlowCommentId } = useFlowCommentsStore(
    useShallow((state) => ({
      fcQueryKey: state.fcQueryKey,
      setFlowCommentId: state.setFlowCommentId,
    })),
  );

  // 2. Define optimistic mutation (create or update)
  const { mutate: mutateFlowComment } = useListOptimisticMutation<
    FlowCommentDto,
    FlowCommentDto | boolean,
    FlowCommentDto
  >(flowCommentOptimisticMutationFn, fcQueryKey, "asc", false);

  // 3. Define submit handler
  const onSubmit = (formData: z.infer<typeof flowCommentZodSchema>) => {
    // Call mutation
    mutateFlowComment({
      id: formData.id,
      payload: formData as unknown as FlowCommentDto,
      crudAction: crudAction,
    });

    // Reset the form
    form.reset();

    // Reset flow comment id
    setFlowCommentId("");
  };

  // 4. Return the component
  return (
    <Form methods={form}>
      <form
        className={cn("relative w-auto transition-all duration-500", className)}
        onSubmit={form.handleSubmit(onSubmit)}
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
      </form>
    </Form>
  );
};
