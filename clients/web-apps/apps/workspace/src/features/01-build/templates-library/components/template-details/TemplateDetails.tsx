import { LoadingSpinner } from "@avplatform/ui";

import { useFetchTemplateDetails } from "../../hooks/useFetchTemplateDetails";
import { PromptTemplateContent } from "./PromptTemplateContent";
import { TemplateHeader } from "./TemplateHeader";
import TemplateMarkdown from "./TemplateMarkdown";
import { TemplateMetaAside } from "./TemplateMetaAside";

export function TemplateDetail() {
  const { data, isLoading } = useFetchTemplateDetails();

  return (
    <div className="py-6">
      {isLoading ? (
        <div className="flex h-[90vh] w-full items-center justify-center">
          <LoadingSpinner className="h-10 w-10 text-primary" />
        </div>
      ) : (
        data && (
          <div className="space-y-6">
            <TemplateHeader template={data?.data} />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="min-w-0 lg:col-span-8">
                {data.data.type == "Prompt" ? (
                  <PromptTemplateContent template={data.data} />
                ) : (
                  <TemplateMarkdown content={data?.data?.instruction || ""} />
                )}
              </div>
              <div className="lg:col-span-4">
                <TemplateMetaAside template={data?.data} />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
