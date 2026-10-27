import { PhoneInput } from "@avplatform/ui";
import { SubmitButton } from "@avplatform/ui/buttons";
import { CountriesEnum } from "@avplatform/ui/enums";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  InputField,
  SelectField,
} from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";
import type { z } from "zod";

import type { MyAccountDto } from "../../dtos/my-account-profile-dto";
import { useDefineProfileInfoForm } from "../../hooks/useDefineProfileInfoForm";
import { useProfileInfoFormMutation } from "../../hooks/useProfileInfoFormMutation";
import type { UserProfileZodSchema } from "../../types/profile-zod-schema";
// import CheckboxFeildDiv from "../CheckboxFeildDiv";
import { InputDivElement } from "../InputDivElement";

export const UserForm = () => {
  const { form, isLoading } = useDefineProfileInfoForm();
  const { mutate, isPending } = useProfileInfoFormMutation();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof UserProfileZodSchema>) => {
    mutate(formData as unknown as MyAccountDto);
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      method="Post"
      className="box flex flex-col p-5"
    >
      <div>
        {/* <div className="mb-6 border-b border-dashed border-line pb-5 text-xl font-medium">
          Profile Info
        </div> */}

        {/* Form feilds */}
        <div>
          <InputDivElement
            headingForInput="Full Name"
            isRequired={true}
            messageForInput="Enter your full legal name as it appears on your official documentation."
            showSkelaton={isLoading}
          >
            <div className="flex w-auto flex-col items-center gap-2 md:flex-row">
              <InputField
                type="text"
                name="firstName"
                className="border-input"
                size={50}
                placeholder="First Name"
              />
              <InputField
                name="lastName"
                type="text"
                className="border-input"
                size={50}
                placeholder="Last Name"
              />
            </div>
          </InputDivElement>

          <InputDivElement
            headingForInput={"Phone Number"}
            showSkelaton={isLoading}
            messageForInput="Please provide a valid phone number where we can reach you if needed."
          >
            <FormField
              name={"phoneNumber"}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PhoneInput value={field.value} onChange={field.onChange} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </InputDivElement>

          {/* <InputDivElement
            headingForInput="Address"
            messageForInput="Please specify the address you are currently residing in."
            showSkelaton={isLoading}
          >
            <InputField
              name="addressLine1"
              type="text"
              placeholder="Address Line 1"
              className="border-input"
            />
            <InputField
              name="addressLine2"
              type="text"
              placeholder="Address Line 2"
              className="mt-3 border-input"
            />
          </InputDivElement> */}

          <InputDivElement
            headingForInput="Country"
            messageForInput="Please specify the country you are currently residing in."
            showSkelaton={isLoading}
          >
            {
              <SelectField
                name="country"
                selectOptions={enumToArray(CountriesEnum)}
                className="border-input"
              />
            }
          </InputDivElement>

          {/* <InputDivElement
            headingForInput="State or Province"
            messageForInput="Please specify your state or province you are currently residing in."
            showSkelaton={isLoading}
          >
            <InputField
              name="stateOrProvince"
              type="text"
              placeholder=""
              className="border-input"
            />
          </InputDivElement> */}

          {/* <InputDivElement
            headingForInput="City"
            messageForInput="Enter the name of the city or locality where your address is located."
            showSkelaton={isLoading}
          >
            <InputField
              name="city"
              type="text"
              placeholder=""
              className="border-input"
            />
          </InputDivElement> */}

          {/* <InputDivElement
            headingForInput="Zip or Postal Code"
            messageForInput="Please specify your zip or postal code of your current locality."
            showSkelaton={isLoading}
          >
            <InputField
              name="zipOrPostalCode"
              type="text"
              placeholder="548462"
              className="border-input"
            />
          </InputDivElement> */}
        </div>

        <div className="flex pt-5 md:justify-end">
          <SubmitButton
            variant="default"
            type="submit"
            primaryText="Save"
            className="border-primary/50 w-full px-4 md:w-auto"
            isPending={isLoading || isPending}
          />
        </div>
      </div>
    </Form>
  );
};
