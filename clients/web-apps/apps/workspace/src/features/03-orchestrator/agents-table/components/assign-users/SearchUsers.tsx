import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";

import { useAssignUserMutation } from "../../hooks/user/useAssignUserMutation";
import { useSearchUserMultiSelect } from "../../hooks/user/useSearchUserMultiSelect";
import { MultiSelector } from "./MultiSelector";

export const SearchUsers = ({
  assignAll,
  savedAssignAll,
  onUpdateSuccess,
}: {
  assignAll: boolean;
  savedAssignAll: boolean;
  onUpdateSuccess: (newValue: boolean) => void;
}) => {
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
    flowVersionId,
  } = useSearchUserMultiSelect();

  const { mutate: assignToAllUsers, isPending: isAssigningAll } = useAssignUserMutation();

  const assignAllChanged = assignAll !== savedAssignAll;
  const hasSelectedUsers = selectedItems && selectedItems.length > 0;
  const isActionRunning = isSubmitting || isAssigningAll;

  // The button is disabled if actions are running, OR if nothing changed AND no users selected
  const isButtonDisabled = isActionRunning || (!assignAllChanged && !hasSelectedUsers);

  // The selector is disabled if the draft says assign all, OR if the backend still says assign all
  // This forces the user to complete the "unassign all" operation first.
  const isSelectorDisabled = assignAll || savedAssignAll;

  const handleActionClick = () => {
    // 1. If checkbox changed state, sync with backend
    if (assignAllChanged) {
      assignToAllUsers(
        { flowVersionId, isAssignedToAllUsers: assignAll },
        {
          onSuccess: () => {
            onUpdateSuccess(assignAll);
          },
        },
      );
    }

    // 2. If assignAll is false AND they selected specific users, process them
    if (!assignAll && hasSelectedUsers) {
      handleSubmit();
    }
  };

  // Dynamic Button Label
  let buttonLabel = "Assign";
  if (assignAllChanged) {
    buttonLabel = savedAssignAll ? "Unassign All" : "Assign All";
  }

  // Dynamic Placeholder to explain WHY the selector is disabled
  let dynamicPlaceholder = "Assign Users...";
  if (assignAll) {
    dynamicPlaceholder = "Uncheck 'Assign to all' to select manually";
  } else if (savedAssignAll) {
    dynamicPlaceholder = "Click 'Unassign All' to unlock manual selection";
  }

  return (
    <div className="flex gap-2 p-4 items-start">
      <div className="flex-1">
        <MultiSelector
          searchResults={searchData?.data || []}
          selectedItems={selectedItems}
          onItemSelect={handleItemSelect}
          onItemRemove={handleItemRemove}
          onSearchChange={setSearchTerm}
          searchQuery={searchTerm}
          isLoading={isLoading}
          disabled={isSelectorDisabled}
          isError={isError}
          placeholder={dynamicPlaceholder}
          maxHeight="300px"
        />
      </div>
      <Button onClick={handleActionClick} disabled={isButtonDisabled} className="min-w-28">
        {isActionRunning ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <>{buttonLabel}</>}
      </Button>
    </div>
  );
};
