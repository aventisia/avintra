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
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-foreground">Add agents</p>
      <div className="flex items-start gap-2">
        <MultiSelector
          searchResults={searchData?.data || []}
          selectedItems={selectedItems}
          onItemSelect={handleItemSelect}
          onItemRemove={handleItemRemove}
          onSearchChange={setSearchTerm}
          searchQuery={searchTerm}
          isLoading={isLoading}
          isError={isError}
          placeholder="Search agents by name..."
        />

        <Button
          onClick={handleSubmit}
          disabled={selectedItems?.length === 0 || isSubmitting}
          className="min-w-28 shrink-0"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" /> Assigning
            </>
          ) : selectedItems?.length > 0 ? (
            <>Assign ({selectedItems.length})</>
          ) : (
            <>Assign</>
          )}
        </Button>
      </div>
    </div>
  );
};
