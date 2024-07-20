import { ILoginData, tenantInfoZodSchema } from "@/features/login";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  SeparatorWithText,
  buttonVariants,
  SubmitButton,
} from "@/react-toolkit/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { getTenantInfo } from "@/react-toolkit/apis";
import { useAuthStore } from "@/stores";
import {
  SocialButtons,
  ContentHeader,
  ContentFooter,
  ContentContainer,
} from "@/components/ui";
import { useDocumentTitle } from "@/react-toolkit/hooks";

interface Step1GetTenantInfoFormProps {
  fnChangeStep: (stepNo: number, navDirection?: string) => void;
  fnSetLoginData: (loginData: ILoginData) => void;
}

const Step1GetTenantInfoForm = ({
  fnChangeStep,
  fnSetLoginData,
}: Step1GetTenantInfoFormProps) => {
  useDocumentTitle("Login");
  const { navDirection } = useAuthStore();
  const userName = localStorage.getItem("userName");

  // Define form
  const form = useForm<z.infer<typeof tenantInfoZodSchema>>({
    resolver: zodResolver(tenantInfoZodSchema),
    defaultValues: {
      email: userName ? userName : "",
    },
  });
  const {
    formState: { isSubmitting },
  } = form;

  // Define mutation
  const { mutate, isPending } = useMutation({
    mutationFn: getTenantInfo,
    onSuccess: (httpResponse) => {
      if (httpResponse.data.ssoConfigJson) {
        console.log(httpResponse.data);
        // PENDING: if SSO enabled then route
      } else {
        // Set userName in localstorage
        localStorage.setItem("userName", httpResponse.data.userName);

        // Set tenantId and email/username
        fnSetLoginData({
          tenantId: httpResponse.data.tenantId,
          email: httpResponse.data.userName,
          pwd: "",
        });

        // Go to next step - Login using Pwd
        fnChangeStep(2);
      }
    },
  });

  // Define submit handler
  const onSubmit = (filledForm: z.infer<typeof tenantInfoZodSchema>) => {
    mutate(filledForm);
  };

  // Return form
  return (
    <ContentContainer
      className={navDirection == "backward" ? "fadeInLTR" : "fadeInRTL"}
    >
      <ContentHeader
        biggerHeading="Log in to your account"
        smallerHeading="Select method to Log in:"
      />
      <SocialButtons isPending={isPending || isSubmitting} />
      <SeparatorWithText width="98%" overlayText="or continue with email" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-3.5"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
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
          <SubmitButton
            className="!mt-5 w-full"
            primaryText="Continue"
            isPending={isPending || isSubmitting}
          />
        </form>
      </Form>
      <ContentFooter className="flex-col mlg:flex-row">
        Don't have an account?
        <a
          href={`${import.meta.env.BASE_URL}create-account`}
          className={buttonVariants({ variant: "link" })}
        >
          Create free account
        </a>
      </ContentFooter>
    </ContentContainer>
  );
};

export { Step1GetTenantInfoForm };
