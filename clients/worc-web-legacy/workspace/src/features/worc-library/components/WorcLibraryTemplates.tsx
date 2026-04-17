import { useDocumentTitle } from "@aventisia/ui/hooks";
import { Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

import { useFetchProjectTemplates } from "../hooks/useFetchProjectTemplates";

import { TemplateCard } from "./TemplateCard";
import { TemplateCardSkeleton } from "./TemplateCardSkelton";
import { TemplatePagination } from "./TemplatePagination";

const WorcLibraryTemplates = ({
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
      if (selectedCategory === "AI Model")
        return ["AIProject", "Inferencing", "Conversation", "Generative"].includes(templateType);
      if (selectedCategory === "Automation Agent")
        return ["Agent"].includes(templateType);
      if (selectedCategory === "Chat Agent")
        return ["ChatAgent"].includes(templateType);
      return templateType.includes(selectedCategory);
    }

    return templates
      .filter((template) => checkCategory(template.type))
      ?.filter((template) => {
        const searchText =
          template.name +
          template?.tags.toString() +
          (template?.type == "AIProject" ? "AIProjectAIModel" : template?.type);

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
          currentItems.map((item) => (
            <TemplateCard key={item.id} template={item} />
          ))
        ) : (
          // Empty state when no templates found
          <div className="col-span-2 py-6 text-center md:col-span-3 lg:col-span-4">
            <div className="mb-4 text-gray-400">
              <Search className="mx-auto h-12 w-12" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No templates found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
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

export default WorcLibraryTemplates;
