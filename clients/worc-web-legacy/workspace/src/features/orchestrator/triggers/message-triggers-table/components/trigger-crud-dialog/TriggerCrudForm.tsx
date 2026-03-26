import { getTimezoneOptions } from "@/react-toolkit/utils/timezone-utils.ts";

import { SubmitButton } from "@aventisia/ui/buttons";
import {
  DatePickerField,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
  InputField,
  SelectField,
  SwitchField,
} from "@aventisia/ui/form";
import { useListOptimisticMutation } from "@aventisia/ui/hooks";
import { ISelectOption } from "@aventisia/ui/types";
import { useEffect, useState } from "react";
import { z } from "zod";

import { getCredSelectOptions } from "../../apis/app-secret-apis.ts";
import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { resourceRequiresReference } from "../../constants/form-utils";
import {
  expiryDateTimeProps,
  idProps,
  isDisabledProps,
  nameProps,
  providerProps,
  referenceProps,
  resourceProps,
  resubscribeEnabledProps,
  resubscribeFrequencyProps,
} from "../../constants/trigger-form-field-props";
import { triggerZodSchema } from "../../constants/trigger-zod-schema";
import { MessageTriggerDto } from "../../dtos/message-trigger-dto";
import { useDefineTriggerForm } from "../../hooks/useDefineTriggerForm";
import { AgentsSelector } from "./AgentsSelector";
import { TimezoneSelector } from "./TimezoneSelector";

export const TriggerCrudForm = () => {
  // Define trigger form
  const {
    form,
    rowId,
    isDirty,
    crudAction,
    // isAvailable,
    // availabilityMessage,
    // isCheckPending,
    // handleInputChange,
    setShowDialog,
    refineFormData,
  } = useDefineTriggerForm();

  // Define optimistic mutation to crete or update the trigger
  const {
    mutate: mutateTrigger,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<
    MessageTriggerDto,
    MessageTriggerDto | boolean,
    MessageTriggerDto
  >([rowId], triggerOptimisticMutationFn, DATA_QUERY_KEY);

  // const resubscribeEnabled = form.watch("resubscribeEnabled");
  const resubscribeFrequency = form.watch("resubscribeFrequency");
  const resubscribeFrequencyCustom = form.watch("resubscribeFrequencyCustom");
  const provider = form.watch("provider");

  const [selectOptions, setSelectOptions] = useState<ISelectOption[]>([]);

  const [, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set loading state
    setLoading(true);

    // Fetch credentials list. Note: Every credential-field should have name ending with 'Credential'
    getCredSelectOptions(provider)
      .then((data) => {
        setSelectOptions(data?.data as ISelectOption[]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch ", err);
        setLoading(false);
      });
  }, [provider]);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof triggerZodSchema>) => {
    // Create or update the trigger
    mutateTrigger({
      payload: refineFormData(formData) as unknown as MessageTriggerDto,
      crudAction: crudAction,
    });

    // Close the dialog if not creating/updating the record
    if (crudAction == "read") setShowDialog(false);
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if ((crudAction === "create" || crudAction === "update") && isSuccess)
      setShowDialog(false);
  }, [isSuccess, crudAction, setShowDialog]);

  useEffect(() => {
    const baseDate = new Date();

    const freq =
      resubscribeFrequency === "custom"
        ? Number(resubscribeFrequencyCustom)
        : Number(resubscribeFrequency);

    if (!freq || isNaN(freq)) return;

    baseDate.setDate(baseDate.getDate() + freq);

    form.setValue(
      "expiryDateTime",
      baseDate,
      //   {
      //   shouldValidate: true,
      //   shouldDirty: true,
      // }
    );
  }, [resubscribeFrequency, resubscribeFrequencyCustom]);

  const referenceRequired = resourceRequiresReference(form.watch("resource"));

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-2.5 pb-5"
      disabled={isReadMode}
    >
      {/* trigger Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField
        {...nameProps}
        // onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        // nonErrorMessage={availabilityMessage}
      />

      <FormField
        name="timezone"
        control={form.control}
        render={({ field }) => (
          <FormItem size={"base"}>
            <FormLabelExt
              size={"base"}
              label="Timezone"
              description="Select the timezone for the trigger."
              isRequired
            />
            <FormControl>
              <TimezoneSelector
                options={getTimezoneOptions()}
                selectedItem={
                  getTimezoneOptions().find(
                    (val) => val.value == field.value,
                  ) || null
                }
                onItemSelect={(item) => field.onChange(item.value)}
                onItemClear={() => field.onChange(null)}
                placeholder="Search"
              />
            </FormControl>

            <FormMessage size={"base"} />
          </FormItem>
        )}
      />
      <SelectField {...providerProps} />
      {crudAction === "create" ? (
        <SelectField
          selectOptions={selectOptions ?? []}
          name="credentialId"
          label="Credential Id"
          isRequired
          disabled={isReadMode}
        />
      ) : (
        form.getValues("credentialId") !== "" && (
          <SelectField
            selectOptions={selectOptions ?? []}
            name="credentialId"
            label="Credential Id"
            isRequired
            disabled={isReadMode}
          />
        )
      )}

      <SelectField {...resourceProps} />
      {referenceRequired && <InputField {...referenceProps} />}

      <SelectField {...resubscribeFrequencyProps} />

      {resubscribeFrequency == "custom" && (
        <InputField
          name="resubscribeFrequencyCustom"
          label="Custom Period (in days)"
        />
      )}
      <DatePickerField {...expiryDateTimeProps} disabled />

      {/* <div className="grid grid-cols-2 gap-2">
        <DatePickerField {...expiryDateTimeProps} />
        <InputField type="time" name="expiryTime" step={60} label="Time" />
      </div> */}

      <SwitchField size="sm" {...resubscribeEnabledProps} />

      {/* {resubscribeEnabled && (
        <>
          <SelectField {...resubscribeFrequencyProps} />

          {resubscribeFrequency == "custom" && (
            <InputField
              name="resubscribeFrequencyCustom"
              label="Custom Frequency (in days)"
            />
          )}
        </>
      )} */}

      {/* Agents Selector */}
      <FormField
        name="agents"
        control={form.control}
        render={({ field }) => (
          <FormItem size={"base"}>
            <FormLabelExt
              size={"base"}
              label="Select Agent(s)"
              description="Choose the agent(s) that should be triggered by this event."
              isRequired
            />

            <FormControl>
              <AgentsSelector
                value={field.value ?? []}
                onChange={field.onChange}
                id={rowId}
                crudAction={crudAction}
              />
            </FormControl>

            <FormMessage size={"base"} />
          </FormItem>
        )}
      />

      {/* Is Disabled */}
      {crudAction !== "create" && (
        <SwitchField size="sm" {...isDisabledProps} />
      )}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-10 flex w-full justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Create" : "Save changes"}
            secondaryText={
              crudAction === "create" ? "Creating..." : "Saving..."
            }
            isPending={isPending}
            disabled={!isDirty}
          />
        </div>
      )}
    </Form>
  );
};
