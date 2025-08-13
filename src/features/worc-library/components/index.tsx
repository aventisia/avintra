import { Input } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Search } from "lucide-react";
import { useState } from "react";

import TemplateDialog from "./TemplateDialog";
import WorcLibraryTemplates from "./WorcLibraryTemplates";

const WorcLibrary = () => {
  // State to track the currently selected template category filter
  const [selectedCategory, setSelectedCategory] = useState("All templates");

  // List of available template categories for filtering
  const categories = [
    "All templates",
    "AI Model",
    "Agent",
    "Inferencing",
    "Conversation",
    "Generative",
    "Block",
  ];

  return (
    <>
      <div>
        {/* Header section with title and subtitle */}
        <div className="">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mx-auto mb-8 max-w-3xl text-center">
              <h1 className="text-[4rem] font-semibold text-[#1E1B4B]">
                Worc <span className="text-primary">Library</span>
              </h1>
              <h2 className="text-muted-foreground">
                The Library of Worc brings together a rich catalog of
                ready-to-use automations and AI blueprints, empowering teams to
                build faster, smarter, and at scale — no need to start from
                scratch.
              </h2>
            </div>

            {/* Search Bar for filtering templates */}
            <div className="relative mx-auto mb-8 max-w-2xl">
              <Input
                type="text"
                placeholder="Search..."
                // Uncomment and implement search functionality as needed
                // value={searchQuery}
                // onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full px-4 py-3"
              />
              <Button
                size={"icon8"}
                className="absolute right-2 top-1/2 -translate-y-1/2 transform rounded-full text-white transition-colors hover:bg-blue-700"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Category Filters to select templates by category */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  className="rounded-full px-4 py-2 text-sm font-medium"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Dialog component for template interactions */}
        <TemplateDialog />

        {/* Displays templates filtered by the selected category */}
        <WorcLibraryTemplates selectedCategory={selectedCategory} />
      </div>
    </>
  );
};

export default WorcLibrary;
