import { useState } from "react";

import { Button } from "@avplatform/ui/buttons";
import { TextareaField } from "@avplatform/ui/form";
import { useToolWizardStore } from "../../stores/tool-wizard.store";

/**
 * Step 1 — Ingest OpenAPI spec via file upload or text paste.
 */
export const StepIngestSpec = () => {
  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const { specText, setSpecText, setSpecFile } = useToolWizardStore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSpecFile(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={activeTab === "file" ? "default" : "outline"} onClick={() => setActiveTab("file")}>
          Upload file
        </Button>
        <Button variant={activeTab === "text" ? "default" : "outline"} onClick={() => setActiveTab("text")}>
          Paste spec
        </Button>
      </div>

      {activeTab === "file" ? (
        <input
          type="file"
          accept=".json,.yaml,.yml"
          onChange={handleFileChange}
          className="block w-full text-sm"
        />
      ) : (
        <TextareaField
          name="specText"
          label="OpenAPI Spec"
          value={specText}
          onChange={(value) => setSpecText(typeof value === "string" ? value : "")}
          placeholder="Paste JSON or YAML OpenAPI spec here..."
          rows={12}
        />
      )}
    </div>
  );
};
