"use client"
import { LoadingSpinner } from "@/app/_components/ui";

import { TemplateHeader } from "./TemplateHeader";
import TemplateMarkdown from "./TemplateMarkdown";
import { TemplateMetaAside } from "./TemplateMetaAside";
import { useFetch } from "../../hooks/useFetch";
import { getAgentTemplateById } from "../../apis/wroc-templates-apis";

export function TemplateDetail({ id }: { id: string }) {

  const { data, loading } = useFetch(() => getAgentTemplateById(id));

  return (
    <div className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      {loading ? (
        <div className="flex h-[70vh] sm:h-[80vh] md:h-[90vh] w-full items-center justify-center">
          <LoadingSpinner className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
        </div>
      ) : (
        data?.data && (
          <div className="space-y-4 sm:space-y-6">
            <TemplateHeader template={data?.data} />

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8  lg:grid-cols-12">
              <div className="min-w-0 lg:col-span-8  mt-5 sm:mt-0">
                <TemplateMarkdown content={data?.data?.instruction} />
              </div>
              <div className="lg:col-span-4 ">
                <TemplateMetaAside template={data?.data} />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
