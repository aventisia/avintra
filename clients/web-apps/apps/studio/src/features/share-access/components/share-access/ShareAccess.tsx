import { Checkbox, LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";

import { useSearchMultiSelect } from "../../hooks/useSearchMultiSelect";
import { MultiSelector } from "./MultiSelector";
import { SelectType } from "./SelectType";

export const SearchMultiSelect: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    selectedItems,
    handleItemSelect,
    handleItemRemove,
    selectedValue,
    setSelectedValue,
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
          placeholder="Search for people to share with..."
          maxHeight="300px"
        />
        <SelectType value={selectedValue} onChange={setSelectedValue} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm">
          <Checkbox checked disabled={selectedItems.length === 0} /> Notify people
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {selectedItems.length > 0 && <span>{selectedItems.length} people selected</span>}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={selectedItems?.length === 0 || isSubmitting}
            className="px-6"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" /> Sharing
              </>
            ) : (
              <>Share Access</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
