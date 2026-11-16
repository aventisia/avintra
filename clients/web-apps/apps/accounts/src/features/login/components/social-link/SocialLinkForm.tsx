import { SubmitButton } from "@avplatform/ui/buttons";
import { Form, InputOtpField } from "@avplatform/ui/form";
import { toast } from "@avplatform/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { useVerifySocialLinkMutation } from "@/features/social-sign-in";

import { verificationCodeProps } from "../../constants/form-field-props";
import { twoFAZodSchema } from "../../constants/two-fa-zod-schema";

export const SocialLinkForm = () => {
  const { socialLinkData, verifySocialLinkMutation, isVerifyPending } =
    useVerifySocialLinkMutation();

  const form = useForm<z.infer<typeof twoFAZodSchema>>({
    resolver: zodResolver(twoFAZodSchema),
    defaultValues: { verificationCode: "" },
  });

  const onSubmit = (formData: z.infer<typeof twoFAZodSchema>) => {
    if (!socialLinkData) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    verifySocialLinkMutation({
      verificationCodeId: socialLinkData.codeId,
      secretCode: formData.verificationCode,
    });
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isVerifyPending}
      checkDirtyForm={false}
    >
      <div className="px-2">
        <InputOtpField {...verificationCodeProps} />
      </div>

      <SubmitButton
        className="text-md !mt-5 h-11 w-full"
        primaryText="Confirm code"
        isPending={isVerifyPending}
      />
    </Form>
  );
};
