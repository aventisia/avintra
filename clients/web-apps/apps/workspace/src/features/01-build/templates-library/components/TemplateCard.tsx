import { HighlightedText } from "@avplatform/ui/highlighted-text";
import { MetaLine } from "@avplatform/ui/meta-line";
import { CopyIcon } from "@phosphor-icons/react";
import { Link, type To } from "react-router-dom";

import { PersonAvatar } from "@/components/PersonAvatar";

import { ProjectTemplateTypesEnum } from "../constants/template-types-enum";
import { AvPlatformTemplatesDto } from "../dtos/avplatform-templates-dtos";
import { getTemplateAccessLabel, getTemplateTypeLabel } from "../utils/template-attributes.util";
import { TemplateIntegrations } from "./TemplateIntegrations";
import { TemplateMark } from "./TemplateMark";

type TemplateCardProps = {
  template: AvPlatformTemplatesDto;
  to: To;
  searchText: string;
};

const META_CLASS_NAME = "inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground";

/**
 * Library grid card, laid out like the Agents grid card: the type tile, name, type and access,
 * description, and a footer with the integrations used, the author and the clone count.
 */
export const TemplateCard = ({ template, to, searchText }: TemplateCardProps) => (
  <Link
    to={to}
    className="group flex flex-col rounded-md border border-line bg-surface outline-none transition-colors duration-150 hover:border-line-strong focus-visible:ring-2 focus-visible:ring-focus"
  >
    <div className="flex items-start gap-3 p-4 pb-0">
      <TemplateMark type={template.type} size="lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          title={template.name}
          className="truncate text-body font-semibold text-ink transition-colors group-hover:text-primary-text"
        >
          <HighlightedText text={template.name} query={searchText} />
        </span>
        <MetaLine
          className="text-xs text-muted-foreground"
          items={[getTemplateTypeLabel(template.type), getTemplateAccessLabel(template.accessType)]}
        />
      </div>
    </div>

    <p className="mx-4 mb-4 mt-3 line-clamp-2 min-h-10 text-body-sm text-ink-2">
      {template.description || <span className="text-muted-foreground">No description</span>}
    </p>

    <div className="mt-auto flex h-10 items-center gap-3 overflow-hidden border-t border-line px-4">
      <TemplateIntegrations icons={template.icons} limit={5} />
      <span className="ml-auto flex min-w-0 items-center gap-3">
        {template.createdBy && (
          <span className={META_CLASS_NAME} title={`Created by ${template.createdBy}`}>
            <PersonAvatar name={template.createdBy} size="sm" />
            <span className="truncate">{template.createdBy}</span>
          </span>
        )}
        {template.type !== ProjectTemplateTypesEnum.Prompt && (
          <span className={META_CLASS_NAME} title="Times cloned">
            <CopyIcon className="size-3.5 shrink-0" />
            <span className="tabular-nums">{template.usagesCount}</span>
          </span>
        )}
      </span>
    </div>
  </Link>
);
