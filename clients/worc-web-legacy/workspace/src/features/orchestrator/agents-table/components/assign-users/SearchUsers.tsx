import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";

import { useSearchUserMultiSelect } from "../../hooks/user/useSearchUserMultiSelect";
import { MultiSelector } from "./MultiSelector";

// import { SelectType } from "./SelectType";

export const SearchUsers: React.FC = () => {
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
    // selectedValue,
    // setSelectedValue,
  } = useSearchUserMultiSelect();

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
        isError={isError}
        placeholder="Assign Users..."
        maxHeight="300px"
      />
      <Button
        onClick={handleSubmit}
        disabled={selectedItems?.length === 0 || isSubmitting}
        className="min-w-20"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4" /> Assigning
          </>
        ) : (
          <>Assign</>
        )}
      </Button>
    </div>
  );
};
