import { SubmitButton } from "@avplatform/ui/buttons";
import { CheckboxField, Form, InputField } from "@avplatform/ui/form";
import type { z } from "zod";

import { useDefineProfilePasswordForm } from "../../hooks/useDefineProfilePasswordForm";
import { useProfilePasswordFormMutation } from "../../hooks/useProfilePasswordFormMutation";
import type { PwdZodSchema } from "../../types/pwd-zod-schema";
import { InputDivElement } from "../InputDivElement";

export const SecurityTab = () => {
  const { form } = useDefineProfilePasswordForm();
  const { mutate, isPending } = useProfilePasswordFormMutation();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof PwdZodSchema>) => {
    mutate(formData);
    form.reset();
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      disabled={isPending}
      className="box box--stacked flex flex-col p-5"
    >
      {/* <div className="mb-6 border-b border-dashed border-line pb-5 text-sm font-medium">
        Security
      </div> */}
      <div>
        <InputDivElement
          headingForInput="Current Password"
          isRequired={true}
          messageForInput="Enter your current password to verify your identity."
        >
          <InputField name="oldPwd" type="password" className="border-input" size={80} />
        </InputDivElement>

        <InputDivElement
          headingForInput="New Password"
          isRequired={true}
          messageForInput="Create a new password for your account."
        >
          <InputField name="newPwd" type="password" className="border-input" size={80} />
        </InputDivElement>

        <InputDivElement
          headingForInput="Confirm New Password"
          isRequired={true}
          messageForInput="Please re-enter the new password you've just chosen."
        >
          <InputField type="password" name="confirmNewPwd" className="border-input" size={80} />
        </InputDivElement>

        <InputDivElement
          headingForInput="Log out From All Sessions"
          isRequired={false}
          messageForInput="Please choose whether to log out from all your login sessions elsewhere."
        >
          <CheckboxField label="" name="logoffFromOtherSessions" className="border-input" />
        </InputDivElement>
      </div>
      <div className="flex pt-5 md:justify-end">
        <SubmitButton
          variant="default"
          type="submit"
          primaryText="Update"
          className="border-primary/50 w-full px-4 md:w-auto"
          isPending={isPending}
        />
      </div>
    </Form>
  );
};
