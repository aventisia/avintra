"use client";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import WorcLibraryTemplates from "./WorcLibraryTemplates";
import { Input } from "@/app/_components/ui";
import { Button } from "@/app/_components/ui/buttons";
import { cn } from "@/lib";
import { useSearchParams } from "next/navigation";
import { TemplateDetail } from "./template-details/TemplateDetails";
import { useDebounce } from "../hooks/useDebounce";

const WorcLibrary = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("t");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery);

  // State to track the currently selected template category filter
  const [selectedCategory, setSelectedCategory] = useState("All templates");

  // List of available template categories for filtering
  const categories = [
    "All templates",
    "AI Model",
    "Agent",
    // "Inferencing",
    // "Conversation",
    // "Generative",
    "Block",
  ];

  if (id) return <TemplateDetail id={id} />;

  // else
  return (
    <div className="py-4 sm:py-6 md:py-8">
      {/* Header section with title and subtitle */}
      <div className="">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
          <div className="mx-auto mb-4 sm:mb-6 max-w-3xl text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:!text-6xl font-semibold tracking-wide mb-2 sm:mb-3">
              Worc <span className="text-primary">Library</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground px-2 sm:px-0">
              The Library of Worc brings together a rich catalog of ready-to-use
              automations and AI blueprints, empowering teams to build faster,
              smarter, and at scale — no need to start from scratch.
            </p>
          </div>

          {/* Search Bar for filtering templates */}
          <div className="relative mx-auto mb-6 sm:mb-8 max-w-2xl px-2 sm:px-0">
            <Input
              className="rounded-lg pe-9 ps-3.5 text-sm sm:text-[0.86rem] "
              placeholder="Search..."
              type="text"
              // Uncomment and implement search functionality as needed
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon10"
              className="absolute inset-y-0 end-1  sm:end-0 rounded-none rounded-e-lg focus-visible:ring-[3px]"
              aria-label="Search">
              <SearchIcon size={18} aria-hidden="true" />
            </Button>
          </div>

          {/* Category Filters to select templates by category */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2 sm:px-0">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant="outline"
                size={"sm"}
                className={cn("rounded-full ring-white whitespace-nowrap", {
                  "border-primary text-primary ring-primary":
                    selectedCategory === category,
                })}>
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Displays templates filtered by the selected category */}
      <WorcLibraryTemplates
        selectedCategory={selectedCategory}
        searchQuery={debouncedSearch}
      />
    </div>
  );
};
export default WorcLibrary;
