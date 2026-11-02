import { EmptyState } from "@avplatform/ui";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useFetchProjectTemplates } from "../hooks/useFetchProjectTemplates";
import { TemplateCard } from "./TemplateCard";
import { TemplateCardSkeleton } from "./TemplateCardSkelton";
import { TemplatePagination } from "./TemplatePagination";

const LibraryTemplates = ({
  selectedCategory,
  searchQuery,
}: {
  selectedCategory: string;
  searchQuery: string;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useDocumentTitle("Library");

  const { data, isLoading } = useFetchProjectTemplates();

  // Combine and filter templates based on selected category
  const items = useMemo(() => {
    const templates = data?.data ?? [];

    const checkCategory = (templateType: string) => {
      if (selectedCategory === "All templates") return true;
      if (selectedCategory === "Automation agent") return ["Agent"].includes(templateType);
      if (selectedCategory === "Chat agent") return ["ChatAgent"].includes(templateType);
      if (selectedCategory === "Voice agent") return ["VoiceAgent"].includes(templateType);
      return templateType.includes(selectedCategory);
    };

    return templates
      .filter((template) => checkCategory(template.type))
      ?.filter((template) => {
        const searchText = template.name + template?.tags.toString() + template?.type;
        return searchQuery?.trim()
          ? searchText?.toLowerCase().includes(searchQuery.toLowerCase().trim())
          : true;
      });
  }, [data?.data, searchQuery, selectedCategory]);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Get current page items slice
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [currentPage, items, itemsPerPage]);

  // Reset to first page on category change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Show skeletons while loading
  if (isLoading) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <TemplateCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-2 pb-4">
      {/* Template Cards Grid */}
      <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {currentItems.length > 0 ? (
          currentItems.map((item) => <TemplateCard key={item.id} template={item} />)
        ) : (
          // Empty state when no templates found
          <EmptyState
            Icon={Search}
            primaryMessage="No templates found"
            secondaryMessage="Try adjusting your search or filter criteria"
            className="col-span-2 py-6 md:col-span-3 lg:col-span-4"
          />
        )}
      </div>

      {/* Pagination controls */}
      {currentItems.length > 0 && (
        <TemplatePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1); // Reset to first page on page size change
          }}
        />
      )}
    </div>
  );
};

export default LibraryTemplates;
