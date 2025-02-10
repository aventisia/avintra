import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputDivElement } from "../InputDivElement";
import { Form } from "@/react-toolkit/ui/form/Form";
import { useUpdatePassword } from "../../hooks/useUpdatePassword";
import { useOptimisticMutation } from "@/react-toolkit/hooks/useOptimisticMutation";
import type { PwdUpdateDto } from "@/react-toolkit/dtos/request/pwd-update-dto";
import type { PwdZodSchema } from "../../types/pwd-zod-schema";
import { updateMyAccountPassword } from "../../apis/my-account-apis";
import { UN_QUERY_KEY_UPDATE_PASSWORD } from "../../constants/constants";
import type { z } from "zod";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";

export const SecurityTab = () => {
  const { form, refineFormData } = useUpdatePassword();

  const { mutate } = useOptimisticMutation<
    PwdUpdateDto,
    PwdUpdateDto,
    PwdUpdateDto
  >(updateMyAccountPassword, UN_QUERY_KEY_UPDATE_PASSWORD, [
    form.getValues() as PwdUpdateDto,
  ]);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof PwdZodSchema>) => {
    mutate(refineFormData(formData) as unknown as PwdUpdateDto);
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="box box--stacked flex flex-col p-5"
    >
      <div className="mb-6 border-b border-dashed border-slate-300/70 pb-5 text-[0.94rem] font-medium">
        Security
      </div>
      <div>
        <InputDivElement
          headingForInput="Current Password*"
          messageForInput="Enter your current password to verify your identity."
        >
          <InputField
            name="oldPwd"
            type="password"
            placeholder="p*******d"
            className="border-slate-300/60 shadow-sm"
            size={80}
          />
        </InputDivElement>

        <InputDivElement
          headingForInput="New Password*"
          messageForInput="Create a new password for your account."
        >
          <InputField
            name="newPwd"
            type="password"
            placeholder="p*******d"
            className="border-slate-300/60 shadow-sm"
            size={80}
          />
        </InputDivElement>

        <InputDivElement
          headingForInput="Confirm New Password*"
          messageForInput="Please re-enter the new password you've just chosen."
        >
          <InputField
            type="password"
            name="confirmNewPwd"
            placeholder="p*******d"
            className="border-slate-300/60 shadow-sm"
            size={80}
          />
        </InputDivElement>
      </div>
      <div className="mt-6 flex border-t border-dashed border-slate-300/70 pt-5 md:justify-end">
        <Button
          variant="default"
          className="border-primary/50 w-full px-4 md:w-auto"
        >
          Save Changes
        </Button>
      </div>
    </Form>
  );
};
