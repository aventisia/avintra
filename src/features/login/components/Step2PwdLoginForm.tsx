import {
  pwdLoginZodSchema,
  authenticateUser,
  ILoginData,
  ITwoFACodeData,
} from "@/features/login";
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
  FormMessage,
  Input,
  Button,
  buttonVariants,
  SubmitButton,
} from "@/react-toolkit/components/ui";
import { ContentFooter, ContentContainer } from "@/components/ui";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { setUserSessionLocally } from "@/react-toolkit/utils";
import { useDocumentTitle } from "@/react-toolkit/hooks";

interface Step2PwdLoginFormProps {
  loginData: ILoginData;
  fnChangeStep: (stepNo: number, navDirection?: string) => void;
  fnSetLoginData: (loginData: ILoginData) => void;
  fnSetTwoFACodeData: (twoFACodeData: ITwoFACodeData) => void;
}

const Step2PwdLoginForm = ({
  loginData,
  fnChangeStep,
  fnSetLoginData,
  fnSetTwoFACodeData,
}: Step2PwdLoginFormProps) => {
  useDocumentTitle("Login");
  const navigate = useNavigate();
  const { navDirection } = useAuthStore();
  const userName = localStorage.getItem("userName");

  // Define form
  const form = useForm<z.infer<typeof pwdLoginZodSchema>>({
    resolver: zodResolver(pwdLoginZodSchema),
    defaultValues: {
      email: loginData.email,
      pwd: "",
    },
  });
  const {
    formState: { isSubmitting },
  } = form;

  // Define mutation
  const { mutate, isPending } = useMutation({
    mutationFn: authenticateUser,
    onSuccess: (httpResponse) => {
      // Password  has expired
      if (httpResponse.message.includes("Your password has been expired")) {
        // Ask to reset password
        toast.warning("Password expired", {
          description: httpResponse.message,
        });
        return;
      }

      //TwoFA is enabled
      if (httpResponse.message.includes("TwoFA is enabled")) {
        // Set verification code id
        fnSetTwoFACodeData({
          email: httpResponse.data.email,
          requestType: httpResponse.data.requestType,
          codeId: httpResponse.data.verificationCodeId,
        });

        // Move to stepNo-3 (TwoFA) without reseting login data
        changeStep(3, false, "forward");
        return;
      }

      // OnSuccess reset loginData & set stepNo to ZERO
      changeStep(0, true, "forward");

      // Set authenticated user locally
      const userSessionStoreObj = setUserSessionLocally(httpResponse.data);

      // Route as per user type (internal or external)
      navigate(
        "/redirect?msg=Logging in...&url=" +
          (userSessionStoreObj.isAE
            ? import.meta.env.VITE_INTRANET_CENTER_URL
            : import.meta.env.VITE_WORKSPACE_URL),
      );
    },
    onError: () => {
      // Reset loginData & move to stepNo-1
      changeStep(1, true, "backward");
    },
  });

  const changeStep = (
    stepNo: number,
    clearLoginData: boolean = false,
    navDirection: string = "forward",
  ) => {
    // StepNo==0 means flow is complete. so no need to transition
    if (stepNo > 0) {
      fnChangeStep(stepNo, navDirection);
    }
    if (clearLoginData) {
      fnSetLoginData({ tenantId: "none", email: "", pwd: "" });
    }
  };

  // Define submit handler
  const onSubmit = (filledForm: z.infer<typeof pwdLoginZodSchema>) => {
    // Set pwd to use in StepNo-3 to resend the code (if user asks)
    fnSetLoginData({
      tenantId: loginData.tenantId,
      email: loginData.email,
      pwd: filledForm.pwd,
    });
    mutate({
      email: filledForm.email,
      pwd: filledForm.pwd,
    });
  };

  // Return form
  return (
    <ContentContainer
      className={navDirection == "backward" ? "fadeInLTR" : "fadeInRTL"}
    >
      <div className="w-full overflow-hidden">
        <div className="mb-2 flex items-center text-sm">
          <Button
            variant="outline"
            size="icon8"
            className="min-w-[2rem]"
            disabled={isPending || isSubmitting}
            onClick={() => changeStep(1, true, "backward")}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <h2 className="ml-3 w-full truncate">{userName}</h2>
        </div>
        <h1 className="text-3xl font-medium">Enter password</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input
                    type="email"
                    disabled={isPending || isSubmitting}
                    placeholder="Email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pwd"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    disabled={isPending || isSubmitting}
                    placeholder="Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton
            className="!mt-5 w-full"
            primaryText="Log in"
            isPending={isPending || isSubmitting}
          />
        </form>
      </Form>
      <ContentFooter>
        or
        <a
          href={`${import.meta.env.BASE_URL}reset-pwd`}
          className={buttonVariants({ variant: "link" })}
        >
          Reset password
        </a>
      </ContentFooter>
    </ContentContainer>
  );
};

export { Step2PwdLoginForm };
