import {
  RecordPanel,
  RecordSheetLoading,
  RecordSheetUnavailable,
} from "@avplatform/ui/record-sheet";
import { BooksIcon, CaretRightIcon } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";

import MarkdownViewer from "@/components/MarkdownViewer";

import { LIBRARY_HEADING } from "../../constants/library.constant";
import { ProjectTemplateTypesEnum } from "../../constants/template-types-enum";
import { useFetchTemplateDetails } from "../../hooks/useFetchTemplateDetails";
import { useTemplateLinks } from "../../hooks/useTemplateLinks.hook";
import { parseTemplateSchema } from "../../utils/template-attributes.util";
import { TemplateHeader } from "./TemplateHeader";
import { TemplateMetaAside } from "./TemplateMetaAside";

/**
 * One template's page: a "Library › template" trail, the hero, the instructions or prompt, and
 * the template's details beside them.
 */
export function TemplateDetail() {
  const { libraryLink } = useTemplateLinks();
  const { data, isLoading } = useFetchTemplateDetails();
  const template = data?.data;
  const isPrompt = template?.type === ProjectTemplateTypesEnum.Prompt;
  const body = isPrompt ? parseTemplateSchema(template?.schema)?.prompt : template?.instruction;

  return (
    <div className="space-y-4 pb-4 pt-[17px]">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1">
        <NavLink
          to={libraryLink}
          className="rounded-md px-1.5 py-0.5 text-lg font-medium text-muted-foreground outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
        >
          {LIBRARY_HEADING}
        </NavLink>
        {template && (
          <>
            <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate px-1.5 text-lg font-medium text-ink">{template.name}</span>
          </>
        )}
      </nav>

      {isLoading ? (
        <RecordSheetLoading label="Loading template..." />
      ) : !template ? (
        <RecordSheetUnavailable Icon={BooksIcon} recordLabel="Template" />
      ) : (
        <>
          <TemplateHeader template={template} />
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <RecordPanel className="min-w-0 bg-surface px-6 py-5 lg:col-span-8">
              {!body ? (
                <p className="text-body-sm text-muted-foreground">
                  This template has no {isPrompt ? "prompt" : "instructions"}.
                </p>
              ) : isPrompt ? (
                <p className="whitespace-pre-wrap text-body-sm leading-6 text-ink">{body}</p>
              ) : (
                <MarkdownViewer textValue={body} />
              )}
            </RecordPanel>
            <div className="lg:col-span-4">
              <TemplateMetaAside template={template} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
