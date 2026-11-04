import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";

import { useAssignUiBuilderUserMutation } from "../../hooks/useAssignUiBuilderUserMutation";
import { useSearchUiBuilderUserMultiSelect } from "../../hooks/useSearchUiBuilderUserMultiSelect";
import { MultiSelector } from "./MultiSelector";

export const UiBuilderSearchUsers = ({
  uiBuilderProjectId,
  assignAll,
  savedAssignAll,
  onUpdateSuccess,
}: {
  uiBuilderProjectId: string;
  assignAll: boolean;
  savedAssignAll: boolean;
  onUpdateSuccess: (newValue: boolean) => void;
}) => {
  const {
    setSearchTerm,
    selectedItems,
    handleItemSelect,
    handleItemRemove,
    isSubmitting,
    handleSubmit,
    searchData,
    isLoading,
    isError,
  } = useSearchUiBuilderUserMultiSelect(uiBuilderProjectId);

  const { mutate: assignToAllUsers, isPending: isAssigningAll } =
    useAssignUiBuilderUserMutation(uiBuilderProjectId);

  const assignAllChanged = assignAll !== savedAssignAll;
  const hasSelectedUsers = selectedItems && selectedItems.length > 0;
  const isActionRunning = isSubmitting || isAssigningAll;

  const isButtonDisabled = isActionRunning || (!assignAllChanged && !hasSelectedUsers);

  const isSelectorDisabled = assignAll || savedAssignAll;

  const handleActionClick = () => {
    if (assignAllChanged) {
      assignToAllUsers(
        { uiBuilderProjectId, isAssignedToAllUsers: assignAll },
        {
          onSuccess: () => {
            onUpdateSuccess(assignAll);
          },
        },
      );
    }

    if (!assignAll && hasSelectedUsers) {
      handleSubmit();
    }
  };

  let buttonLabel = "Assign";
  if (assignAllChanged) {
    buttonLabel = savedAssignAll ? "Unassign All" : "Assign All";
  }

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
          isLoading={isLoading}
          disabled={isSelectorDisabled}
          isError={isError}
          placeholder={dynamicPlaceholder}
        />
      </div>
      <Button onClick={handleActionClick} disabled={isButtonDisabled} className="min-w-28">
        {isActionRunning ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <>{buttonLabel}</>}
      </Button>
    </div>
  );
};
