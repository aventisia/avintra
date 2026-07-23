import { Input } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { X } from "lucide-react";

interface SearchInputProps {
  globalFilter: string; // Type for the search input value
  setGlobalFilter: (value: string) => void; // Type for the setter function
}

export const SearchDataTable = ({ globalFilter, setGlobalFilter }: SearchInputProps) => {
  return (
    <div className="relative">
      {/* Search Input */}
      <Input
        type="text"
        fieldSize="sm"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)} // Update the global filter
        placeholder="Search data..."
        className="w-52"
      />

      {/* Clear Button */}
      {globalFilter && (
        <Button
          size="sm"
          variant="link"
          onClick={() => setGlobalFilter("")} // Clear the input
          className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer border-none bg-transparent text-gray-400 hover:text-red-500"
        >
          {/* Use the Lucide "X" icon */}
          <X size={20} />
        </Button>
      )}
    </div>
  );
};
