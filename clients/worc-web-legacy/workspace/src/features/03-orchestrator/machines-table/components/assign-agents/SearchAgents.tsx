import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";

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
    <div className="flex h-full flex-col justify-between p-2">
      <div className="flex gap-2">
        <MultiSelector
          searchResults={searchData?.data || []}
          selectedItems={selectedItems}
          onItemSelect={handleItemSelect}
          onItemRemove={handleItemRemove}
          onSearchChange={setSearchTerm}
          searchQuery={searchTerm}
          isLoading={isLoading}
          isError={isError}
          placeholder="Search..."
          maxHeight="300px"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {selectedItems.length > 0 && (
              <span>{selectedItems.length} selected</span>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={selectedItems?.length === 0 || isSubmitting}
            className="px-6"
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
      </div>
    </div>
  );
};
