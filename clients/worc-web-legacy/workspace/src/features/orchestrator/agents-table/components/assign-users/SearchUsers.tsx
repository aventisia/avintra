import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";

import { useAssignUserMutation } from "../../hooks/user/useAssignUserMutation";
import { useSearchUserMultiSelect } from "../../hooks/user/useSearchUserMultiSelect";
import { MultiSelector } from "./MultiSelector";

// import { SelectType } from "./SelectType";

export const SearchUsers = ({ assignAll }: { assignAll: boolean }) => {
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
    // selectedValue,
    // setSelectedValue,
  } = useSearchUserMultiSelect();

  const { mutate: assignToAllUsers } = useAssignUserMutation();

  const handleAssignAll = () => {
    assignToAllUsers({ flowVersionId, isAssignedToAllUsers: !!assignAll });
  };

  return (
    <div className="flex gap-2 p-4">
      <MultiSelector
        searchResults={searchData?.data || []}
        selectedItems={selectedItems}
        onItemSelect={handleItemSelect}
        onItemRemove={handleItemRemove}
        onSearchChange={setSearchTerm}
        searchQuery={searchTerm}
        isLoading={isLoading}
        disabled={!!assignAll}
        isError={isError}
        placeholder="Assign Users..."
        maxHeight="300px"
      />
      <Button
        onClick={() => {
          if (assignAll) {
            handleAssignAll();
          } else {
            handleSubmit();
          }
        }}
        disabled={!assignAll && (selectedItems?.length === 0 || isSubmitting)}
        className="min-w-20"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4" />
          </>
        ) : (
          <>Assign</>
        )}
      </Button>
    </div>
  );
};
