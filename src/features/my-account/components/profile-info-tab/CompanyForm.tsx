import { Button } from "@/react-toolkit/ui/buttons/Button";
import { FormCheck } from "@/components/Form";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { InputDivElement } from "../InputDivElement";
import { Form } from "@/react-toolkit/ui/form/Form";
import { useMyAccountCompanyForm } from "../../hooks/useMyAccountCompanyForm";
import type { z } from "zod";
import type { CompanyZodSchema } from "../../types/company-zod-schema";
import type { CompanyDto } from "../../dtos/my-account-company-dto";
import {
  SelectField,
  type SelectFieldProps,
} from "@/react-toolkit/ui/form/fields/SelectField";
import { CountriesEnum } from "@/react-toolkit/enums/countries-enum";
import { enumToArray } from "@/react-toolkit/utils/enum-to-array";
import { useOptimisticMutation } from "@/react-toolkit/hooks/useOptimisticMutation";
import { updateCompanyInfo } from "../../apis/my-account-apis";

// Select countries props
const countriesSelectProps: SelectFieldProps = {
  name: "country",
  isRequired: true,
  selectOptions: enumToArray(CountriesEnum),
};

export const CompanyForm = () => {
  const { form, refineFormData } = useMyAccountCompanyForm();

  const { mutate } = useOptimisticMutation<CompanyDto, CompanyDto, CompanyDto>(
    updateCompanyInfo,
    ["userid"],
    [form.getValues() as CompanyDto],
  );
  // Define submit handler
  const onSubmit = (formData: z.infer<typeof CompanyZodSchema>) => {
    mutate(refineFormData(formData) as unknown as CompanyDto);
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="box flex flex-col p-5"
    >
      <div>
        <div className="mb-6 border-b border-dashed border-slate-300/70 pb-5 text-2xl font-medium">
          Company Info
        </div>

        {/* Form feilds */}
        <div>
          <InputDivElement
            headingForInput="Company Type*"
            messageForInput="Select your company type from the options."
          >
            <div className="flex flex-col items-center md:flex-row">
              {/* <CheckboxField label /> */}
              <div className="dark:bg-darkmode-600 w-full rounded-md border border-slate-300/60 bg-white px-3 py-2 shadow-sm first:rounded-b-none last:-mt-px last:rounded-t-none focus:z-10 first:md:rounded-r-none first:md:rounded-bl-md last:md:-ml-px last:md:mt-0 last:md:rounded-l-none last:md:rounded-tr-md [&:not(:first-child):not(:last-child)]:-mt-px [&:not(:first-child):not(:last-child)]:rounded-none [&:not(:first-child):not(:last-child)]:md:-ml-px [&:not(:first-child):not(:last-child)]:md:mt-0">
                <FormCheck>
                  <FormCheck.Input type="radio" name="companyType" value="" />
                  <FormCheck.Label
                    className="font-semibold text-slate-400"
                    htmlFor="checkbox-switch-1"
                  >
                    Individual
                  </FormCheck.Label>
                </FormCheck>
              </div>
              <div className="dark:bg-darkmode-600 w-full rounded-md border border-slate-300/60 bg-white px-3 py-2 shadow-sm first:rounded-b-none last:-mt-px last:rounded-t-none focus:z-10 first:md:rounded-r-none first:md:rounded-bl-md last:md:-ml-px last:md:mt-0 last:md:rounded-l-none last:md:rounded-tr-md [&:not(:first-child):not(:last-child)]:-mt-px [&:not(:first-child):not(:last-child)]:rounded-none [&:not(:first-child):not(:last-child)]:md:-ml-px [&:not(:first-child):not(:last-child)]:md:mt-0">
                <FormCheck>
                  <FormCheck.Input type="radio" name="companyType" value="" />
                  <FormCheck.Label
                    className="font-semibold text-slate-400"
                    htmlFor="checkbox-switch-2"
                  >
                    Company
                  </FormCheck.Label>
                </FormCheck>
              </div>
            </div>
          </InputDivElement>

          <InputDivElement headingForInput="Company Name*" messageForInput="">
            <InputField
              type="text"
              name="comapanyName"
              placeholder=""
              className="border-slate-300/60 shadow-sm"
              size={80}
            />
          </InputDivElement>

          <InputDivElement headingForInput="Role*" messageForInput="">
            <InputField
              type="text"
              name="role"
              className="border-slate-300/60 shadow-sm"
              placeholder=""
              size={80}
            />
          </InputDivElement>

          <InputDivElement headingForInput="Address Line 1*" messageForInput="">
            <InputField
              name="addressLine1"
              type="text"
              placeholder=""
              className="border-slate-300/60 shadow-sm"
            />
          </InputDivElement>

          <InputDivElement headingForInput="Address Line 2" messageForInput="">
            <InputField
              name="addressLine2"
              className="border-slate-300/60 shadow-sm"
              type="text"
              placeholder=""
            />
          </InputDivElement>

          <InputDivElement headingForInput="Country*" messageForInput="">
            <SelectField
              {...countriesSelectProps}
              className="border-slate-300/60 shadow-sm"
            />
          </InputDivElement>

          <InputDivElement
            headingForInput="State or Province*"
            messageForInput=""
          >
            <InputField
              name="stateOrProvince"
              type="text"
              placeholder=""
              className="border-slate-300/60 shadow-sm"
            />
          </InputDivElement>

          <InputDivElement headingForInput="City*" messageForInput="">
            <InputField
              name="city"
              type="text"
              placeholder=""
              className="border-slate-300/60 shadow-sm"
            />
          </InputDivElement>

          <InputDivElement
            headingForInput="Zip or Postal Code*"
            messageForInput=""
          >
            <InputField
              name="ZipOrPostalCode"
              type="text"
              placeholder=""
              className="border-slate-300/60 shadow-sm"
            />
          </InputDivElement>
        </div>

        {/* Save details button */}
        <div className="mt-6 flex border-t border-dashed border-slate-300/70 pt-5 md:justify-end">
          <Button
            variant="default"
            type="submit"
            className="border-primary/50 w-full px-4 md:w-auto"
          >
            Save
          </Button>
        </div>
      </div>
    </Form>
  );
};
