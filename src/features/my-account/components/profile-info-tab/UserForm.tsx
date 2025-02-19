import { enumToArray } from "@/react-toolkit/utils/enum-to-array";
import { CountriesEnum } from "@/react-toolkit/enums/countries-enum";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { DatePickerField } from "@/react-toolkit/ui/form/fields/DatePickerField";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { Form } from "@/react-toolkit/ui/form/Form";

import { InputDivElement } from "../InputDivElement";

import type { z } from "zod";
import type { UserProfileZodSchema } from "../../types/profile-zod-schema";
import CheckboxFeildDiv from "../CheckboxFeildDiv";
import { useDefineProfileInfoForm } from "../../hooks/useDefineProfileInfoForm";
import { useProfileInfoFormMutation } from "../../hooks/useProfileInfoFormMutation";
import type { MyAccountDto } from "../../dtos/my-account-profile-dto";
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
        <div className="mb-6 border-b border-dashed border-slate-300/70 pb-5 text-2xl font-medium">
          Profile Info
        </div>

        {/* Form feilds */}
        <div>
          <InputDivElement
            headingForInput="Full Name"
            isRequired={true}
            messageForInput="Enter your full legel name as it appears on your official documentation."
            showSkelaton={isLoading}
          >
            <div className="flex w-auto flex-col items-center md:flex-row">
              <InputField
                type="text"
                name="firstName"
                className="rounded-e-none border-slate-300/60 shadow-sm"
                size={50}
                placeholder="First Name"
              />
              <InputField
                name="lastName"
                type="text"
                className="rounded-s-none border-slate-300/60 shadow-sm"
                size={50}
                placeholder="Last Name"
              />
            </div>
          </InputDivElement>

          <InputDivElement
            headingForInput="Date of Birth"
            messageForInput="This information is required to verify your age and provide age appropriate services."
            showSkelaton={isLoading}
          >
            <DatePickerField name="dateOfBirth" />
          </InputDivElement>

          <InputDivElement
            headingForInput={"Gender"}
            messageForInput={"Select your gender from the options."}
            showSkelaton={isLoading}
          >
            <div className="flex flex-col items-center md:flex-row">
              <div className="dark:bg-darkmode-600 w-full rounded-md border border-slate-300/60 bg-white px-3 py-2 shadow-sm first:rounded-b-none last:-mt-px last:rounded-t-none focus:z-10 first:md:rounded-r-none first:md:rounded-bl-md last:md:-ml-px last:md:mt-0 last:md:rounded-l-none last:md:rounded-tr-md [&:not(:first-child):not(:last-child)]:-mt-px [&:not(:first-child):not(:last-child)]:rounded-none [&:not(:first-child):not(:last-child)]:md:-ml-px [&:not(:first-child):not(:last-child)]:md:mt-0">
                <CheckboxFeildDiv>
                  <CheckboxFeildDiv.CheckboxInputFeild
                    type="radio"
                    value="Male"
                    name="gender"
                  />
                  <CheckboxFeildDiv.Label
                    className="font-semibold text-slate-500"
                    htmlFor="checkbox-switch-1"
                  >
                    Male
                  </CheckboxFeildDiv.Label>
                </CheckboxFeildDiv>
              </div>
              <div className="dark:bg-darkmode-600 w-full rounded-md border border-slate-300/60 bg-white px-3 py-2 shadow-sm first:rounded-b-none last:-mt-px last:rounded-t-none focus:z-10 first:md:rounded-r-none first:md:rounded-bl-md last:md:-ml-px last:md:mt-0 last:md:rounded-l-none last:md:rounded-tr-md [&:not(:first-child):not(:last-child)]:-mt-px [&:not(:first-child):not(:last-child)]:rounded-none [&:not(:first-child):not(:last-child)]:md:-ml-px [&:not(:first-child):not(:last-child)]:md:mt-0">
                <CheckboxFeildDiv>
                  <CheckboxFeildDiv.CheckboxInputFeild
                    type="radio"
                    value="Female"
                    name="gender"
                  />
                  <CheckboxFeildDiv.Label
                    className="font-semibold text-slate-500"
                    htmlFor="checkbox-switch-1"
                  >
                    Female
                  </CheckboxFeildDiv.Label>
                </CheckboxFeildDiv>
              </div>
              <div className="dark:bg-darkmode-600 w-full rounded-md border border-slate-300/60 bg-white px-3 py-2 shadow-sm first:rounded-b-none last:-mt-px last:rounded-t-none focus:z-10 first:md:rounded-r-none first:md:rounded-bl-md last:md:-ml-px last:md:mt-0 last:md:rounded-l-none last:md:rounded-tr-md [&:not(:first-child):not(:last-child)]:-mt-px [&:not(:first-child):not(:last-child)]:rounded-none [&:not(:first-child):not(:last-child)]:md:-ml-px [&:not(:first-child):not(:last-child)]:md:mt-0">
                <CheckboxFeildDiv>
                  <CheckboxFeildDiv.CheckboxInputFeild
                    type="radio"
                    value="PreferNotToSay"
                    name="gender"
                  />
                  <CheckboxFeildDiv.Label
                    className="font-semibold text-slate-500"
                    htmlFor="checkbox-switch-1"
                  >
                    Prefer Not To Say
                  </CheckboxFeildDiv.Label>
                </CheckboxFeildDiv>
              </div>
            </div>
          </InputDivElement>

          <InputDivElement
            headingForInput={"Phone Number"}
            showSkelaton={isLoading}
            messageForInput="Please provide a valid phone number where we can reach you if needed."
          >
            <InputField
              type="text"
              name="phoneNumber"
              className="border-slate-300/60 shadow-sm"
              required={false}
              placeholder=""
            />
          </InputDivElement>

          <InputDivElement
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
          </InputDivElement>

          <InputDivElement
            headingForInput="Country"
            messageForInput="Please Specify the country you are currently residing in."
            showSkelaton={isLoading}
          >
            <SelectField
              name="country"
              selectOptions={enumToArray(CountriesEnum)}
              className="border-slate-300/60 shadow-sm"
            />
          </InputDivElement>

          <InputDivElement
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
          </InputDivElement>

          <InputDivElement
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
          </InputDivElement>

          <InputDivElement
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
          </InputDivElement>
        </div>

        <div className="mt-6 flex border-t border-dashed border-slate-300/70 pt-5 md:justify-end">
          <Button
            variant="default"
            type="submit"
            className="border-primary/50 w-full px-4 md:w-auto"
            disabled={isLoading || isPending}
          >
            Save
          </Button>
        </div>
      </div>
    </Form>
  );
};
