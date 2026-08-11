import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";

import { useSearchMultiSelect } from "../../hooks/useSearchMultiSelect";
import { MultiSelector } from "./MultiSelector";

export const SearchAgents: React.FC = () => {
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
  } = useSearchMultiSelect();

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
        placeholder="Search Agents..."
      />

      <Button
        onClick={handleSubmit}
        disabled={selectedItems?.length === 0 || isSubmitting}
        className="min-w-28"
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
