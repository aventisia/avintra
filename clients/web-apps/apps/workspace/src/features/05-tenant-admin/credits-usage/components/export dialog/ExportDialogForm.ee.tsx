import { DateTimePickerField, Form, crudDialogFieldClasses } from "@avplatform/ui/form";
import { Label } from "@avplatform/ui/label";
import React from "react";
import { createPortal } from "react-dom";
import { FormProvider } from "react-hook-form";

import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { MultiSelectField } from "@/components/multi-select/MultiSelectField";

import {
  endDateProps,
  serviceTypeProps,
  startDateProps,
} from "../../constants/export-chart-field-props.ee";
import { useAgentSearchMultiSelect } from "../../hooks/agents/useAgentSearchMultiSelect.ee";
import { useExportChartForm } from "../../hooks/useExportChartForm.ee";
import { useSearchMultiSelect } from "../../hooks/users/useSearchMultiSelect.ee";
import { useExportDialogStore } from "../../store/export-dialog-store.ee";
import { AgentsMultiSelector } from "./AgentsMultiSelector.ee";
import { UsersMultiSelector } from "./UsersMultiSelector.ee";

const ExportDialogForm = ({ actionsSlot }: { actionsSlot: HTMLElement | null }) => {
  const { setOpen } = useExportDialogStore();
  const { form, isSubmitting, mutateExportChartCSV, isPending } = useExportChartForm();
  const {
    searchTerm,
    setSearchTerm,
    selectedItems,
    handleItemSelect,
    handleItemRemove,
    searchData,
    isLoading,
    isError,
  } = useSearchMultiSelect();

  const {
    searchTerm: agentSearchTerm,
    setSearchTerm: agentSetSearchTerm,
    selectedItems: agentSelectedItems,
    handleItemSelect: agentHandleItemSelect,
    handleItemRemove: agentHandleItemRemove,
    searchData: agentSearchData,
    isLoading: agentIsLoading,
    isError: agentIsError,
  } = useAgentSearchMultiSelect();

  async function submitHandler(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    const formData = {
      ...form.getValues(),
      users: selectedItems.map((item) => item.id),
      agents: agentSelectedItems.map((item) => item.id),
    };
    await mutateExportChartCSV(formData);
    setOpen(false);
  }
  const isExporting = isSubmitting || isPending;

  return (
    <Form methods={form} disabled={isSubmitting}>
      <FormProvider {...form}>
        <MultiSelectField {...serviceTypeProps} />

        <div className="space-y-1.5">
          <Label className={crudDialogFieldClasses.label}>Users</Label>
          <UsersMultiSelector
            searchResults={searchData?.data || []}
            selectedItems={selectedItems}
            onItemSelect={handleItemSelect}
            onItemRemove={handleItemRemove}
            onSearchChange={setSearchTerm}
            searchQuery={searchTerm}
            isLoading={isLoading}
            isError={isError}
            placeholder="Search for users..."
            maxHeight="300px"
          />
        </div>

        <div className="space-y-1.5">
          <Label className={crudDialogFieldClasses.label}>Agents</Label>
          <AgentsMultiSelector
            searchResults={agentSearchData?.data || []}
            selectedItems={agentSelectedItems}
            onItemSelect={agentHandleItemSelect}
            onItemRemove={agentHandleItemRemove}
            onSearchChange={agentSetSearchTerm}
            searchQuery={agentSearchTerm}
            isLoading={agentIsLoading}
            isError={agentIsError}
            placeholder="Search for agents..."
            maxHeight="300px"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DateTimePickerField {...startDateProps} className={crudDialogFieldClasses.input} />
          <DateTimePickerField {...endDateProps} className={crudDialogFieldClasses.input} />
        </div>
      </FormProvider>

      {actionsSlot &&
        createPortal(
          <CardDialogButton
            variant="primary"
            disabled={isExporting}
            isBusy={isExporting}
            onClick={submitHandler}
          >
            {isExporting ? "Downloading" : "Download"}
          </CardDialogButton>,
          actionsSlot,
        )}
    </Form>
  );
};

export default ExportDialogForm;
