import { Button } from "@/react-toolkit/ui/buttons/Button";
import { FormCheck } from "@/components/Form";
import { DatePickerField } from "@/react-toolkit/ui/form/fields/DatePickerField";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SelectField } from "@/react-toolkit/ui/form/fields/SelectField";
import { InputDivElement } from "../InputDivElement";
import Lucide from "@/react-toolkit/ui/Lucide";

export const UserForm = () => {
  /*  const { data: userRoles } = useFetchUserRoles();

  Define user form
  const {
    form,
    crudAction,
    setAvailabilityMessage,
    setShowDialog,
    refineFormData,
  } = useDefineUserForm();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof userZodSchema>) => {
    // Create or update the user
    // mutateUser({
    //   payload: refineFormData(formData) as unknown as UsersTableDto,
    //   crudAction: crudAction,
    // });

    // Reset the availability message
    setAvailabilityMessage(null);

    // Close the dialog
    setShowDialog(false);
  };
*/
  return (
    // <Form
    //   methods={form}
    //   onSubmit={form.handleSubmit(onSubmit)}
    //   className="box flex flex-col p-5"
    // >
    <div>
      <div className="mb-6 border-b border-dashed border-slate-300/70 pb-5 text-2xl font-medium">
        Profile Info
      </div>

      {/* Form feilds */}
      <div>
        <InputDivElement headingForInput="Full Name*" messageForInput="">
          <div className="flex w-auto flex-col items-center md:flex-row">
            <InputField
              type="text"
              name="firstName"
              className="rounded-e-none border-slate-300/60 shadow-sm"
              size={50}
              placeholder="First Name*"
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

        <InputDivElement headingForInput="Date of Birth*" messageForInput="">
          <DatePickerField name="dateOfBirth" />
        </InputDivElement>

        <InputDivElement
          headingForInput={"Gender*"}
          messageForInput={"Select your gender from the options."}
        >
          <div className="flex flex-col items-center md:flex-row">
            {/* <CheckboxField label /> */}
            <div className="dark:bg-darkmode-600 w-full rounded-md border border-slate-300/60 bg-white px-3 py-2 shadow-sm first:rounded-b-none last:-mt-px last:rounded-t-none focus:z-10 first:md:rounded-r-none first:md:rounded-bl-md last:md:-ml-px last:md:mt-0 last:md:rounded-l-none last:md:rounded-tr-md [&:not(:first-child):not(:last-child)]:-mt-px [&:not(:first-child):not(:last-child)]:rounded-none [&:not(:first-child):not(:last-child)]:md:-ml-px [&:not(:first-child):not(:last-child)]:md:mt-0">
              <FormCheck>
                <FormCheck.Input type="radio" name="gender" value="" />
                <FormCheck.Label
                  className="font-semibold text-slate-400"
                  htmlFor="checkbox-switch-1"
                >
                  Male
                </FormCheck.Label>
              </FormCheck>
            </div>
            <div className="dark:bg-darkmode-600 w-full rounded-md border border-slate-300/60 bg-white px-3 py-2 shadow-sm first:rounded-b-none last:-mt-px last:rounded-t-none focus:z-10 first:md:rounded-r-none first:md:rounded-bl-md last:md:-ml-px last:md:mt-0 last:md:rounded-l-none last:md:rounded-tr-md [&:not(:first-child):not(:last-child)]:-mt-px [&:not(:first-child):not(:last-child)]:rounded-none [&:not(:first-child):not(:last-child)]:md:-ml-px [&:not(:first-child):not(:last-child)]:md:mt-0">
              <FormCheck>
                <FormCheck.Input type="radio" name="gender" value="" />
                <FormCheck.Label
                  className="font-semibold text-slate-400"
                  htmlFor="checkbox-switch-2"
                >
                  Female
                </FormCheck.Label>
              </FormCheck>
            </div>
            <div className="dark:bg-darkmode-600 w-full rounded-md border border-slate-300/60 bg-white px-3 py-2 shadow-sm first:rounded-b-none last:-mt-px last:rounded-t-none focus:z-10 first:md:rounded-r-none first:md:rounded-bl-md last:md:-ml-px last:md:mt-0 last:md:rounded-l-none last:md:rounded-tr-md [&:not(:first-child):not(:last-child)]:-mt-px [&:not(:first-child):not(:last-child)]:rounded-none [&:not(:first-child):not(:last-child)]:md:-ml-px [&:not(:first-child):not(:last-child)]:md:mt-0">
              <FormCheck>
                <FormCheck.Input type="radio" name="gender" value="" />
                <FormCheck.Label
                  className="font-semibold text-slate-400"
                  htmlFor="checkbox-switch-3"
                >
                  Prefer Not to Say
                </FormCheck.Label>
              </FormCheck>
            </div>
          </div>
        </InputDivElement>

        <InputDivElement
          headingForInput={"Phone Number*"}
          messageForInput="Please provide a valid phone number where we can reach you if needed."
        >
          <div className="flex flex-col items-center md:flex-row">
            <InputField
              type="text"
              name="phoneNumber"
              className="rounded-e-none border-slate-300/60 shadow-sm"
              placeholder=""
              size={80}
            />
            <SelectField
              name="typeOfPhoneNumber"
              className="rounded-s-none border-slate-300/60 shadow-sm"
              selectOptions={[
                {
                  value: "office",
                  label: "Office",
                  fixed: true,
                },
                {
                  value: "home",
                  label: "Home",
                },
              ]}
            />
          </div>
          <span className="-mb-1 mt-3.5 flex items-center font-medium text-primary">
            <Lucide icon="Plus" className="mr-1 h-4 w-4 stroke-[1.3]" />
            Add phone
          </span>
        </InputDivElement>

        <InputDivElement headingForInput="Address Line 1*" messageForInput="">
          <InputField
            name="addressLine2"
            type="text"
            className="border-slate-300/60 shadow-sm"
            placeholder=""
          />
        </InputDivElement>

        <InputDivElement headingForInput="Address Line 2" messageForInput="">
          <InputField
            name="addressLine2"
            type="text"
            className="border-slate-300/60 shadow-sm"
            placeholder=""
          />
        </InputDivElement>

        <InputDivElement headingForInput="Country*" messageForInput="">
          <InputField
            name="country"
            type="text"
            placeholder=""
            className="border-slate-300/60 shadow-sm"
          />
        </InputDivElement>

        <InputDivElement
          headingForInput="State or Province*"
          messageForInput=""
        >
          <InputField
            name="country"
            type="text"
            placeholder=""
            className="border-slate-300/60 shadow-sm"
          />
        </InputDivElement>

        <InputDivElement headingForInput="City*" messageForInput="">
          <InputField
            name="country"
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
            name="country"
            type="text"
            placeholder=""
            className="border-slate-300/60 shadow-sm"
          />
        </InputDivElement>
      </div>

      <div className="mt-6 flex border-t border-dashed border-slate-300/70 pt-5 md:justify-end">
        <Button
          variant="default"
          className="border-primary/50 w-full px-4 md:w-auto"
        >
          Save
        </Button>
      </div>
    </div>
    // </Form>
  );
};
