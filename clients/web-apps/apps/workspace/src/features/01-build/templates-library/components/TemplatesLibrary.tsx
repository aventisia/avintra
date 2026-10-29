import { Input } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { useDebounce } from "@avplatform/ui/hooks/useDebounce";
import { cn } from "@avplatform/ui/lib";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { HelpButton } from "@/components/help/HelpButton";

import LibraryTemplates from "./LibraryTemplates";
import { TemplateDetail } from "./template-details/TemplateDetails";

const TemplateLibrary = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery);

  const templateID = searchParams.get("t") || "";

  // State to track the currently selected template category filter
  const [selectedCategory, setSelectedCategory] = useState("All templates");

  // List of available template categories for filtering
  const categories = ["All templates", "Automation agent", "Chat agent", "Block", "Prompt"];

  if (templateID) return <TemplateDetail />;
  else
    return (
      <div>
        {/* Header section with title and subtitle */}
        <div className="">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mx-auto mb-6 max-w-3xl text-center">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-title text-ink">Avintra library</h2>
                <HelpButton guideId="library" />
              </div>
              <p className="mt-2 text-body text-muted-foreground">
                The Avintra Library brings together a rich catalog of ready-to-use automations and
                AI blueprints, empowering teams to build faster, work smarter, and scale without
                starting from scratch.
              </p>
            </div>

            {/* Search Bar for filtering templates */}
            <div className="relative mx-auto mb-8 max-w-2xl">
              <Input
                className="rounded-md pe-9 ps-3.5 text-[0.86rem]"
                placeholder="Search..."
                type="text"
                // Uncomment and implement search functionality as needed
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon10"
                className="absolute inset-y-0 end-0 rounded-none rounded-e-md focus-visible:ring-[3px]"
                aria-label="Search"
              >
                <SearchIcon size={18} aria-hidden="true" />
              </Button>
            </div>

            {/* Category Filters to select templates by category */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant="outline"
                  className={cn("rounded-md border-line text-ink-2", {
                    "border-primary bg-selected text-primary-text": selectedCategory === category,
                  })}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Displays templates filtered by the selected category */}
        <LibraryTemplates selectedCategory={selectedCategory} searchQuery={debouncedSearch} />
      </div>
    );
};

export default TemplateLibrary;
