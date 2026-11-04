import { useSearchMultiSelect } from "../../hooks/useSearchMultiSelect";
import { MultiSelector } from "./MultiSelector";

export const AssignMachineSearch = ({
  search,
}: {
  search: ReturnType<typeof useSearchMultiSelect>;
}) => (
  <div className="min-h-[18rem]">
    <MultiSelector
      searchResults={search.searchData?.data || []}
      selectedItems={search.selectedItems}
      onItemSelect={search.handleItemSelect}
      onItemRemove={search.handleItemRemove}
      onSearchChange={search.setSearchTerm}
      searchQuery={search.searchTerm}
      isLoading={search.isLoading}
      isError={search.isError}
      placeholder="Search machines…"
      maxHeight="300px"
    />
  </div>
);
