import { PhoneInput } from "@avplatform/ui";
import { SubmitButton } from "@avplatform/ui/buttons";
import { CountriesEnum } from "@avplatform/ui/enums";
import {
  // DatePickerField,
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
        {/* <div className="mb-6 border-b border-dashed border-slate-300/70 pb-5 text-xl font-medium">
          Profile Info
        </div> */}

        {/* Form feilds */}
        <div>
          <InputDivElement
            headingForInput="Full Name"
            isRequired={true}
            messageForInput="Enter your full legel name as it appears on your official documentation."
            showSkelaton={isLoading}
          >
            <div className="flex w-auto flex-col items-center gap-2 md:flex-row">
              <InputField
                type="text"
                name="firstName"
                className="border-slate-300/60 shadow-sm"
                size={50}
                placeholder="First Name"
              />
              <InputField
                name="lastName"
                type="text"
                className="border-slate-300/60 shadow-sm"
                size={50}
                placeholder="Last Name"
              />
            </div>
          </InputDivElement>

          {/* <InputDivElement
            headingForInput="Date of Birth"
            messageForInput="This information is required to verify your age and provide age appropriate services."
            showSkelaton={isLoading}
          >
            <DatePickerField name="dateOfBirth" />
          </InputDivElement> */}

          {/* <InputDivElement
            headingForInput={"Gender"}
            messageForInput={"Select your gender from the options."}
            showSkelaton={isLoading}
          >
            <CheckboxFeildDiv>
              <CheckboxFeildDiv.CheckboxFormField
                name="gender"
                type="radio"
                value={form.getValues("gender")}
              >
                <div className="flex flex-col items-center md:flex-row">
                  <CheckboxFeildDiv.CheckboxInputFeildWrapper>
                    <CheckboxFeildDiv.CheckboxInputFeild value="Male" />
                    <CheckboxFeildDiv.Label className="text-sm text-slate-500">
                      Male
                    </CheckboxFeildDiv.Label>
                  </CheckboxFeildDiv.CheckboxInputFeildWrapper>
                  <CheckboxFeildDiv.CheckboxInputFeildWrapper>
                    <CheckboxFeildDiv.CheckboxInputFeild value="Female" />
                    <CheckboxFeildDiv.Label className="text-sm text-slate-500">
                      Female
                    </CheckboxFeildDiv.Label>
                  </CheckboxFeildDiv.CheckboxInputFeildWrapper>
                  <CheckboxFeildDiv.CheckboxInputFeildWrapper>
                    <CheckboxFeildDiv.CheckboxInputFeild value="PreferNotToSay" />
                    <CheckboxFeildDiv.Label className="text-sm text-slate-500">
                      Prefer Not To Say
                    </CheckboxFeildDiv.Label>
                  </CheckboxFeildDiv.CheckboxInputFeildWrapper>
                </div>
              </CheckboxFeildDiv.CheckboxFormField>
            </CheckboxFeildDiv>
          </InputDivElement> */}

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
              className="border-slate-300/60 shadow-sm"
            />
            <InputField
              name="addressLine2"
              type="text"
              placeholder="Address Line 2"
              className="mt-3 border-slate-300/60 shadow-sm"
            />
          </InputDivElement> */}

          <InputDivElement
            headingForInput="Country"
            messageForInput="Please Specify the country you are currently residing in."
            showSkelaton={isLoading}
          >
            {
              <SelectField
                name="country"
                selectOptions={enumToArray(CountriesEnum)}
                className="border-slate-300/60 shadow-sm"
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
              className="border-slate-300/60 shadow-sm"
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
              className="border-slate-300/60 shadow-sm"
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
              className="border-slate-300/60 shadow-sm"
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
