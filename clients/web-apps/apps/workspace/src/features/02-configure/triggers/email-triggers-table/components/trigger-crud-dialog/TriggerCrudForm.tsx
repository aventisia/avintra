import { SubmitButton } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import {
  DateTimePickerField,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
  InputField,
  SelectField,
  SwitchField,
} from "@avplatform/ui/form";
import { useListOptimisticMutation } from "@avplatform/ui/hooks";
import { type CrudActionType, ISelectOption } from "@avplatform/ui/types";
import {
  applyTimeZoneOffset,
  getTimezoneOptions,
  removeTimeZoneOffset,
} from "@avplatform/ui/utils/timezone-utils";
import { useEffect, useState } from "react";
import { z } from "zod";

import { getVaultCredentialIconSrc } from "@/features/02-configure/vault-credentials/vault-credential-config/utils/vault-credential-icon.util";

import { triggerOptimisticMutationFn } from "../../apis/triggers-table-apis.ts";
import { getVaultCredentialSelectOptions } from "../../apis/vault-credential-select.apis.ts";
import {
  expiryDateTimeProps,
  folderProps,
  idProps,
  isDisabledProps,
  mailboxProps,
  nameProps,
  providerProps,
  resubscribeEnabledProps,
  resubscribeFrequencyProps,
} from "../../constants/trigger-form-field-props.ts";
import { triggerZodSchema } from "../../constants/trigger-zod-schema.ts";
import { EmailTriggerDto } from "../../dtos/email-trigger-dto.ts";
import { useDefineTriggerForm } from "../../hooks/useDefineTriggerForm.ts";
import { useTableTab } from "../../hooks/useTableTab.ts";
import { AgentsSelector } from "./AgentsSelector.tsx";
import { TimezoneSelector } from "./TimezoneSelector.tsx";

interface TriggerCrudFormProps {
  rowId: string;
  crudAction: CrudActionType;
}

export const TriggerCrudForm = ({ rowId, crudAction }: TriggerCrudFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();

  // Define trigger form
  const {
    form,
    isDirty,
    isAvailable,
    availabilityMessage,
    isCheckPending,
    handleInputChange,
    refineFormData,
  } = useDefineTriggerForm({ rowId, crudAction });

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Define optimistic mutation to crete or update the trigger
  const {
    mutate: mutateTrigger,
    isPending,
    isSuccess,
  } = useListOptimisticMutation<EmailTriggerDto, EmailTriggerDto | boolean, EmailTriggerDto>(
    [rowId],
    triggerOptimisticMutationFn,
    queryKey,
  );

  const resubscribeFrequency = form.watch("resubscribeFrequency");
  const provider = form.watch("provider");
  const [selectOptions, setSelectOptions] = useState<ISelectOption[]>([]);

  const [, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set loading state
    setLoading(true);

    // Fetch credentials list. Note: Every credential-field should have name ending with 'Credential'
    getVaultCredentialSelectOptions(provider)
      .then((data) => {
        setSelectOptions(
          (data?.data ?? []).map((option) => ({
            ...option,
            icon: getVaultCredentialIconSrc(provider),
          })),
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch ", err);
        setLoading(false);
      });
  }, [provider]);

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
  }, [resubscribeFrequency, timezone]);
  // Define submit handler
  const onSubmit = (formData: z.infer<typeof triggerZodSchema>) => {
    // Create or update the trigger
    mutateTrigger({
      payload: refineFormData(formData) as unknown as EmailTriggerDto,
      crudAction: crudAction,
    });

    // Close the dialog if not creating/updating the record
    if (crudAction == "read") onCloseConfirmed();
  };

  // Close dialog and reset form when mutation is successful
  useEffect(() => {
    if ((crudAction === "create" || crudAction === "update") && isSuccess) onCloseConfirmed();
  }, [isSuccess, crudAction, onCloseConfirmed]);

  // Is form in read mode?
  const isReadMode = crudAction === "read";
  const isUpdateMode = crudAction === "update";

  const timezoneOptions = getTimezoneOptions();

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
        onChangeCapture={(e) => handleInputChange(e.currentTarget.value)}
        nonErrorMessage={availabilityMessage}
        disabled={crudAction !== "create"}
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
                options={timezoneOptions}
                selectedItem={timezoneOptions.find((val) => val.value == field.value) || null}
                onItemSelect={(item) => field.onChange(item.value)}
                onItemClear={() => field.onChange(null)}
                placeholder="Search"
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
          name="credentialName"
          label="Credential"
          isRequired
          disabled={isReadMode}
        />
      ) : (
        form.getValues("credentialName") !== "" && (
          <SelectField
            selectOptions={selectOptions ?? []}
            name="credentialName"
            label="Credential"
            isRequired
            disabled={isReadMode || isUpdateMode}
          />
        )
      )}

      <InputField disabled={isReadMode || isUpdateMode} {...mailboxProps} />
      <InputField disabled={isReadMode || isUpdateMode} {...folderProps} />

      <InputField type="number" {...resubscribeFrequencyProps} min={1} max={4320} />

      <DateTimePickerField {...expiryDateTimeProps} disabled />

      <SwitchField size="sm" {...resubscribeEnabledProps} />

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
      {crudAction !== "create" && <SwitchField size="sm" {...isDisabledProps} />}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-10 flex w-full justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            primaryText={crudAction === "create" ? "Create" : "Save changes"}
            secondaryText={crudAction === "create" ? "Creating..." : "Saving..."}
            isPending={isPending}
            disabled={!isDirty || !isAvailable || isCheckPending}
          />
        </div>
      )}
    </Form>
  );
};
