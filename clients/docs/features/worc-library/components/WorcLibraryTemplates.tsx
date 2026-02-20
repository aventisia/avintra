"use client";
import { Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

import { TemplateCard } from "./TemplateCard";
import { TemplatePagination } from "./TemplatePagination";
import { TemplateCardSkeleton } from "./TemplateCardSkelton";
import { useFetch } from "../hooks/useFetch";
import { getAgentTemplates } from "../apis/wroc-templates-apis";

const WorcLibraryTemplates = ({
  selectedCategory,
  searchQuery,
}: {
  selectedCategory: string;
  searchQuery: string;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const { data: agentData = [], loading } = useFetch(() => getAgentTemplates());

  const AI_MODEL_TYPES = [
    "AIProject",
    "Inferencing",
    "Conversation",
    "Generative",
  ];
  // Combine and filter templates based on selected category
  const items = useMemo(() => {
    const templates = agentData ?? [];
    const normalizedQuery = searchQuery?.trim().toLowerCase();

    const matchesCategory = (type: string) => {
      if (selectedCategory === "All templates") return true;

      if (selectedCategory === "AI Model") {
        return AI_MODEL_TYPES.includes(type);
      }

      return type.includes(selectedCategory);
    };

    const matchesSearch = (template: (typeof templates)[number]) => {
      if (!normalizedQuery) return true;

      const searchText = [
        template.name,
        template.tags?.join(" "),
        template.type === "AIProject" ? "AIProject AIModel" : template.type,
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(normalizedQuery);
    };

    return templates
      .filter((template) => matchesCategory(template.type))
      .filter(matchesSearch);
  }, [agentData, searchQuery, selectedCategory]);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(items?.length / itemsPerPage);

  // Get current page items slice
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items?.slice(start, start + itemsPerPage);
  }, [currentPage, items, itemsPerPage]);

  // Reset to first page on category change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Show skeletons while loading
  if (loading) {
    return (
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <TemplateCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-2 pb-4">
      {/* Template Cards Grid */}
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {currentItems && currentItems?.length > 0 ? (
          currentItems?.map((item) => (
            <TemplateCard key={item.id} template={item} />
          ))
        ) : (
          // Empty state when no templates found
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 py-6 sm:py-8 md:py-10 text-center px-4">
            <div className="mb-3 sm:mb-4 text-gray-400">
              <Search className="mx-auto h-10 w-10 sm:h-12 sm:w-12" />
            </div>
            <h3 className="mb-1.5 sm:mb-2 text-base sm:text-lg font-medium text-gray-900 dark:text-gray-400">
              No templates found
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {currentItems?.length > 0 && (
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
