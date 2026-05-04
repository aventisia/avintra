import {
  applyTimeZoneOffset,
  getTimezoneOptions,
  removeTimeZoneOffset,
} from "@/react-toolkit/utils/timezone-utils.ts";

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

import APIKeyField from "../../../webhook-triggers-table/components/trigger-crud-dialog/APIKeyField.tsx";
import { getCredSelectOptions } from "../../apis/app-secret-apis.ts";
import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis";
import { DATA_QUERY_KEY } from "../../constants";
import { resourceRequiresReference } from "../../constants/form-utils";
import { getTimeFromDate } from "../../constants/form-utils.ts";
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
  const timezone = form.watch("timezone");

  // sync expiry date with selected timezone
  useEffect(() => {
    const freq = Number(resubscribeFrequency);
    if (!freq || isNaN(freq) || !timezone) return;

    // 1. Get expiry date
    const currDate = form.getValues("expiryDateTime") || new Date();

    // 2. Convert to selected timezone
    const tzDate = applyTimeZoneOffset(currDate, timezone);

    // 3. Add minutes in THAT timezone
    tzDate.setMinutes(tzDate.getMinutes() + freq);

    // 4. (optional) convert back to UTC/system if needed
    const finalDate = removeTimeZoneOffset(tzDate, timezone);

    form.setValue("expiryDateTime", finalDate);
    form.setValue("expiryTime", getTimeFromDate(tzDate)); // show local TZ time
  }, [resubscribeFrequency, timezone]);

  const referenceRequired = resourceRequiresReference(form.watch("resource"));

  // Is form in read mode?
  const isReadMode = crudAction === "read";
  const isUpdateMode = crudAction === "update";

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
      <FormField
        name="apiKey"
        control={form.control}
        render={({ field }) => (
          <FormItem size={"base"}>
            <FormLabelExt size={"base"} label="Api Key" isRequired />

            <FormControl>
              <APIKeyField
                value={field.value}
                onChange={field.onChange}
                crudAction={crudAction}
                disabled={isReadMode}
              />
            </FormControl>

            <FormMessage size={"base"} />
          </FormItem>
        )}
      />
      <SelectField {...providerProps} disabled={isReadMode || isUpdateMode} />
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
            disabled={isReadMode || isUpdateMode}
          />
        )
      )}

      <SelectField {...resourceProps} disabled={isReadMode || isUpdateMode} />
      {referenceRequired && (
        <InputField {...referenceProps} disabled={isReadMode || isUpdateMode} />
      )}

      <InputField
        type="number"
        {...resubscribeFrequencyProps}
        min={1}
        max={4320}
      />
      <div className="grid grid-cols-2 gap-2">
        <DatePickerField disabled {...expiryDateTimeProps} />
        <InputField
          type="time"
          name="expiryTime"
          step={60}
          label="Time"
          disabled
        />
      </div>

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
                disabled={isReadMode || isUpdateMode}
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
