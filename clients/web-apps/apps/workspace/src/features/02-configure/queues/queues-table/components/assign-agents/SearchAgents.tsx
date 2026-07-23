import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";

import { useSearchMultiSelect } from "../../hooks/useSearchMultiSelect";
import { SelectType } from "../assign-users/SelectType";
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
    selectedValue,
    setSelectedValue,
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
        <SelectType value={selectedValue} onChange={setSelectedValue} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {selectedItems.length > 0 && <span>{selectedItems.length} selected</span>}
          </div>

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
      </div>
    </div>
  );
};
