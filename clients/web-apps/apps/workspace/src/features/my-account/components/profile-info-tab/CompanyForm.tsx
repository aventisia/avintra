// import { SubmitButton } from "@avplatform/ui/buttons";
import { DefaultTenantsEnum } from "@avplatform/ui/enums/default-tenants-enum";
import { Form, InputField } from "@avplatform/ui/form";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useState } from "react";
import type { z } from "zod";
import { useShallow } from "zustand/react/shallow";

// import { countriesSelectProps } from "../../constants/constants";
import type { UserBillingAddressDto } from "../../dtos/my-account-company-dto";
import { useCompanyInfoFormMutation } from "../../hooks/useCompanyInfoFormMutation";
import { useDefineComapnyInfoForm } from "../../hooks/useDefineComapnyInfoForm";
import type { BillingAddressZodSchema } from "../../types/company-zod-schema";
import { InputDivElement } from "../InputDivElement";

export const CompanyForm = () => {
  const { form, isLoading } = useDefineComapnyInfoForm();

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  //if user has the permission to change the billing address of the company/tenant
  const [hasSpecialPermission] = useState(false);

  const { mutate, isPending } = useCompanyInfoFormMutation();
  // Define submit handler
  const onSubmit = (formData: z.infer<typeof BillingAddressZodSchema>) => {
    mutate(formData as unknown as UserBillingAddressDto);
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="box flex flex-col p-5"
      disabled={userSession?.tenantName != DefaultTenantsEnum.IndividualUsers}
    >
      <div>
        {/* <div className="mb-6 border-b border-dashed border-slate-300/70 pb-5 text-xl font-medium">
          {userSession?.tenantName == DefaultTenantsEnum.IndividualUsers
            ? "Billing Info"
            : "Tenant Info"}
        </div> */}

        {/* Form feilds */}
        <div>
          {userSession?.tenantName != DefaultTenantsEnum.IndividualUsers && (
            <>
              <InputDivElement
                headingForInput="Tenant Name"
                messageForInput=""
                aria-disabled="true"
                showSkelaton={isPending || isLoading}
              >
                <InputField
                  type="text"
                  name="tenantName"
                  disabled={!hasSpecialPermission}
                  placeholder=""
                  className="border-slate-300/60 shadow-sm"
                  size={80}
                />
              </InputDivElement>
              {/* <InputDivElement
                headingForInput="Designation"
                messageForInput="Your current designation for you tenant."
                aria-disabled="true"
                showSkelaton={isPending || isLoading}
              >
                <InputField
                  type="text"
                  name="role"
                  className="border-slate-300/60 shadow-sm"
                  placeholder=""
                  disabled={!hasSpecialPermission}
                  size={80}
                />
              </InputDivElement> */}
            </>
          )}

          {/* <InputDivElement
            headingForInput="Address"
            messageForInput=""
            showSkelaton={isPending || isLoading}
          >
            <InputField
              name="addressLine1"
              type="text"
              placeholder="Address Line 1"
              disabled={
                userSession?.tenantName != DefaultTenantsEnum.IndividualUsers
              }
              className="border-slate-300/60 shadow-sm"
            />
            <InputField
              name="addressLine2"
              type="text"
              placeholder="Address Line 2"
              disabled={
                userSession?.tenantName != DefaultTenantsEnum.IndividualUsers
              }
              className="mt-3 border-slate-300/60 shadow-sm"
            />
          </InputDivElement>

          <InputDivElement
            headingForInput="Country"
            messageForInput=""
            showSkelaton={isPending || isLoading}
          >
            {form.getValues("country") !== "" && (
              <SelectField
                {...countriesSelectProps}
                className="border-slate-300/60 shadow-sm"
                disabled={
                  userSession?.tenantName != DefaultTenantsEnum.IndividualUsers
                }
              />
            )}
          </InputDivElement>

          <InputDivElement
            headingForInput="State or Province"
            messageForInput=""
            showSkelaton={isPending || isLoading}
          >
            <InputField
              name="stateOrProvince"
              type="text"
              placeholder=""
              disabled={
                userSession?.tenantName != DefaultTenantsEnum.IndividualUsers
              }
              className="border-slate-300/60 shadow-sm"
            />
          </InputDivElement>

          <InputDivElement
            headingForInput="City"
            messageForInput=""
            showSkelaton={isPending || isLoading}
          >
            <InputField
              name="city"
              type="text"
              disabled={
                userSession?.tenantName != DefaultTenantsEnum.IndividualUsers
              }
              placeholder=""
              className="border-slate-300/60 shadow-sm"
            />
          </InputDivElement>

          <InputDivElement
            headingForInput="Zip or Postal Code"
            messageForInput=""
            showSkelaton={isPending || isLoading}
          >
            <InputField
              name="ZipOrPostalCode"
              type="text"
              disabled={
                userSession?.tenantName != DefaultTenantsEnum.IndividualUsers
              }
              placeholder=""
              className="border-slate-300/60 shadow-sm"
            />
          </InputDivElement> */}
        </div>

        {/* Save details button */}
        {/* <div className="mt-6 flex border-t border-dashed border-slate-300/70 pt-5 md:justify-end">
          {userSession?.tenantName == DefaultTenantsEnum.IndividualUsers && (
            <SubmitButton
              variant="default"
              isPending={isPending || isLoading}
              className="border-primary/50 w-full px-4 md:w-auto"
            >
              Save
            </SubmitButton>
          )}
        </div> */}
      </div>
    </Form>
  );
};
