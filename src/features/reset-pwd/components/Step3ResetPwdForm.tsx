import { resetPwd, resetPwdZodSchema } from "@/features/reset-pwd";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Checkbox,
  Button,
  SubmitButton,
} from "@/react-toolkit/components/ui";
import {
  ContentHeader,
  ContentFooter,
  ContentContainer,
} from "@/components/ui";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useDocumentTitle } from "@/react-toolkit/hooks";

interface Step3ResetPwdFormProps {
  fnChangeStep: (stepNo: number, navDirection?: string) => void;
}

const Step3ResetPwdForm = ({ fnChangeStep }: Step3ResetPwdFormProps) => {
  useDocumentTitle("Reset Password");
  const navigate = useNavigate();
  const { navDirection } = useAuthStore();

  // Define form.
  const form = useForm<z.infer<typeof resetPwdZodSchema>>({
    resolver: zodResolver(resetPwdZodSchema),
    defaultValues: {
      newPwd: "",
      confirmNewPwd: "",
      logoffFromAllSessions: false,
    },
  });
  const {
    formState: { isSubmitting },
  } = form;

  // Define mutation
  const { mutate, isPending } = useMutation({
    mutationFn: resetPwd,
    onSuccess: (httpResponse) => {
      // Inform user
      toast.success("Success", { description: httpResponse.message });

      //Navigate to login page
      navigate("/login");
    },
    onError: () => {
      // Set the stepNo to 1.  Start again
      fnChangeStep(1, "backward");
    },
  });

  // Define a submit handler.
  const onSubmit = (filledForm: z.infer<typeof resetPwdZodSchema>) => {
    mutate({
      newPwd: filledForm.newPwd,
      logoffFromAllSessions: filledForm.logoffFromAllSessions,
    });
  };

  // Return form
  return (
    <ContentContainer
      className={navDirection == "backward" ? "fadeInLTR" : "fadeInRTL"}
    >
      <ContentHeader
        biggerHeading="Reset password"
        smallerHeading="Must be at least 8 characters"
      ></ContentHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-3.5"
        >
          <FormField
            control={form.control}
            name="newPwd"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    disabled={isPending || isSubmitting}
                    placeholder="New password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmNewPwd"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    disabled={isPending || isSubmitting}
                    placeholder="Confirm password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="logoffFromAllSessions"
            render={({ field }) => (
              <FormItem className="ml-1 flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    disabled={isPending || isSubmitting}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Logout from all active sessions
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton
            className="!mt-5 w-full"
            primaryText="Reset password"
            isPending={isPending || isSubmitting}
          />
        </form>
      </Form>
      <ContentFooter>
        <Button
          className="h-0 p-0 font-normal"
          variant={"link"}
          disabled={isPending || isSubmitting}
          onClick={() => navigate("/login")}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="ml-2">Back to log in</span>
        </Button>
      </ContentFooter>
    </ContentContainer>
  );
};

export { Step3ResetPwdForm };
