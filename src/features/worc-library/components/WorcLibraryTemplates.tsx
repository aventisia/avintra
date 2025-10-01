import { Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

import { useFetchAgentTemplates } from "../hooks/useFetchAgentTemplates";
import { useFetchModelTemplates } from "../hooks/useFetchModelTemplates";

import { TemplateCard } from "./TemplateCard";
import { TemplateCardSkeleton } from "./TemplateCardSkelton";
import { TemplatePagination } from "./TemplatePagination";

const WorcLibraryTemplates = ({
  selectedCategory,
}: {
  selectedCategory: string;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const { data: agentData, isLoading: isAgentDataLoading } =
    useFetchAgentTemplates();
  const { data: modelData, isLoading: isModelDataLoading } =
    useFetchModelTemplates();

  // Combine and filter templates based on selected category
  const items = useMemo(() => {
    const agentTemplates = agentData?.data ?? [];
    const modelTemplates = modelData?.data ?? [];

    return [...agentTemplates, ...modelTemplates].filter((template) =>
      selectedCategory === "All templates"
        ? true
        : selectedCategory === "AI Model"
          ? ["Inferencing", "Conversation", "Generative"].includes(
              template.type,
            )
          : template.type.includes(selectedCategory),
    );
  }, [agentData?.data, modelData?.data, selectedCategory]);

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
  if (isAgentDataLoading || isModelDataLoading) {
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
      <div className="mt-2 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <TemplateCard key={item.id} template={item} />
          ))
        ) : (
          // Empty state when no templates found
          <div className="col-span-3 py-6 text-center">
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
