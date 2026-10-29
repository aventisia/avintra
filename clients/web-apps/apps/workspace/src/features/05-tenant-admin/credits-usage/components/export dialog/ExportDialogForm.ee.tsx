import { LoadingSpinner, Separator } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { DateTimePickerField, Form } from "@avplatform/ui/form";
import { Label } from "@avplatform/ui/label";
import { ScrollArea } from "@avplatform/ui/scroll";
import React from "react";
import { FormProvider } from "react-hook-form";

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

const ExportDialogForm = () => {
  const { setOpen } = useExportDialogStore();
  const { form, isSubmitting, mutateExportChartCSV, isPending } = useExportChartForm();
  // Users Search
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

  // Agents Search
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
  return (
    <Form
      methods={form}
      // onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
    >
      <FormProvider {...form}>
        <ScrollArea className="h-[calc(100vh-8.5rem)]">
          <div className="space-y-4 px-5 py-4">
            <MultiSelectField {...serviceTypeProps} />
            <Separator />
            {/* Users */}
            <div className="space-y-1">
              <Label className="ml-1 flex items-center gap-0.5 text-2xs">
                Users
                {/* <span className="text-destructive">*</span> */}
              </Label>
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
              {/* {form.formState.errors.} */}
            </div>

            {/* Agents */}
            <div className="space-y-1">
              <Label className="ml-1 flex items-center gap-0.5 text-2xs">
                Agents
                {/* <span className="text-destructive">*</span> */}
              </Label>
              <AgentsMultiSelector
                searchResults={agentSearchData?.data || []}
                selectedItems={agentSelectedItems}
                onItemSelect={agentHandleItemSelect}
                onItemRemove={agentHandleItemRemove}
                onSearchChange={agentSetSearchTerm}
                searchQuery={agentSearchTerm}
                isLoading={agentIsLoading}
                isError={agentIsError}
                placeholder="Search for Agents..."
                maxHeight="300px"
              />
            </div>

            {/* Date Picker */}
            <div className="grid grid-cols-2 gap-4">
              <DateTimePickerField {...startDateProps} />
              <DateTimePickerField {...endDateProps} />
            </div>
          </div>
        </ScrollArea>
      </FormProvider>

      <Separator className="!mt-0.5" />
      <div className="flex items-center justify-end px-6 pb-4">
        <Button
          type="submit"
          disabled={isSubmitting || isPending}
          className="w-28"
          onClick={(e) => submitHandler(e)}
        >
          {isSubmitting || isPending ? <LoadingSpinner className="h-4 w-4" /> : "Download"}
        </Button>
      </div>
    </Form>
  );
};

export default ExportDialogForm;
