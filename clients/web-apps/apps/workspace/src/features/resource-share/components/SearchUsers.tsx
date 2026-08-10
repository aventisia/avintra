import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";

import { resourceAccessOptions } from "../constant";
import { ResourceTypeEnum } from "../enums/resource-type-enum";
import { useSearchUserMultiSelect } from "../hooks/useSearchUserMultiSelect";
import { MultiSelector } from "./MultiSelector";

interface SearchUsersProps {
  isTenantAccessDraft: boolean;
  isTenantAccessSaved: boolean;
  isMutating: boolean;
  onCommitTenantAccess: () => Promise<void>;
}

/**
 * Handles the UI and execution triggers for user assignment.
 * Adapts its visual state and click behavior based on pending tenant-wide changes.
 */
export const SearchUsers = ({
  isTenantAccessDraft,
  isTenantAccessSaved,
  isMutating,
  onCommitTenantAccess,
}: SearchUsersProps) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedItems,
    handleItemSelect,
    handleItemRemove,
    isSubmitting,
    handleSubmit,
    searchData,
    isLoading,
    isError,
    accessType,
    setAccessType,
    resourceType,
  } = useSearchUserMultiSelect();

  // Access levels (View/Edit/Owner) have no relevance when assigning users to a
  // Space, so hide the access-level selector for Space resources.
  const isSpaceResource = resourceType === ResourceTypeEnum.Space;

  const isDraftDifferent = isTenantAccessDraft !== isTenantAccessSaved;
  const hasSelectedUsers = selectedItems && selectedItems.length > 0;
  const isActionRunning = isSubmitting || isMutating;

  // Disable button if an action is pending, or if no modifications have been drafted
  const isButtonDisabled = isActionRunning || (!isDraftDifferent && !hasSelectedUsers);

  // Lock selector while tenant-wide access is active or pending confirmation
  const isSelectorDisabled = isTenantAccessDraft || isTenantAccessSaved;

  /**
   * Routes the execution path based on current state.
   * Prioritizes syncing tenant access changes before handling individual user assignments.
   */
  const handleActionClick = () => {
    if (isDraftDifferent) {
      onCommitTenantAccess();
      return;
    }

    if (hasSelectedUsers) {
      handleSubmit();
    }
  };

  let buttonLabel = "Assign";
  if (isDraftDifferent) {
    buttonLabel = isTenantAccessSaved ? "Unassign All" : "Assign All";
  }

  let dynamicPlaceholder = "Assign Users...";
  if (isTenantAccessDraft) {
    dynamicPlaceholder = "Uncheck 'Assign to all' to select manually";
  } else if (isTenantAccessSaved) {
    dynamicPlaceholder = "Click 'Unassign All' to unlock manual selection";
  }

  return (
    <div className="flex gap-2 p-4 items-start">
      <MultiSelector
        searchResults={searchData?.data || []}
        selectedItems={selectedItems}
        onItemSelect={handleItemSelect}
        onItemRemove={handleItemRemove}
        onSearchChange={setSearchTerm}
        searchQuery={searchTerm}
        isLoading={isLoading}
        isError={isError}
        disabled={isSelectorDisabled}
        placeholder={dynamicPlaceholder}
        actionSelect={
          isSpaceResource
            ? undefined
            : {
                onChange: setAccessType,
                value: accessType,
                options: resourceAccessOptions,
              }
        }
      />

      <Button onClick={handleActionClick} disabled={isButtonDisabled} className="min-w-28">
        {isActionRunning ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <>{buttonLabel}</>}
      </Button>
    </div>
  );
};
