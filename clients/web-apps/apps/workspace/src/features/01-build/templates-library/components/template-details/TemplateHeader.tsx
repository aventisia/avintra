import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { MetaLine } from "@avplatform/ui/meta-line";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { formatDate } from "@avplatform/ui/utils";
import { CopyIcon } from "@phosphor-icons/react";

import { pluralize } from "@/utils/pluralize.util";

import { ProjectTemplateTypesEnum } from "../../constants/template-types-enum";
import { UseTemplateDTO } from "../../dtos/use-template-dto";
import { useCloneTemplateMutation } from "../../hooks/useCloneTemplateMutation";
import { getTemplateTypeLabel } from "../../utils/template-attributes.util";
import { TemplateMark } from "../TemplateMark";
import { DeleteTemplateButton } from "./DeleteTemplateButton";

/**
 * Template page banner: the type tile, name, description, details, tags and the Clone and
 * Delete actions.
 */
export function TemplateHeader({ template }: { template: UseTemplateDTO }) {
  useDocumentTitle(`${template.name} - Library`);

  const { mutate: cloneTemplate, isPending } = useCloneTemplateMutation();
  const userRoles = useUserSessionStore((state) => state.userSession?.userRoles);

  const canDeleteTemplate =
    (userRoles?.includes("SA") && template.accessType === "Public") ||
    (userRoles?.includes("TA") && template.accessType === "TenantLevel");
  const canClone = template.type !== ProjectTemplateTypesEnum.Prompt;
  const isApproved = template.status === "Approved";
  const usageCount = template.usageCount ?? 0;
  const tags = template.tags?.filter((tag) => tag.toLowerCase() !== template.type?.toLowerCase());

  return (
    <section className="rounded-lg bg-surface px-5 py-4 ring-1 ring-line">
      <div className="flex items-start gap-4">
        <TemplateMark type={template.type} size="xl" />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-mono text-label uppercase text-muted-foreground">
            {getTemplateTypeLabel(template.type) || "Template"} template
          </p>
          <h2 className="truncate text-title text-ink">{template.name}</h2>
          {template.description && (
            <p className="mt-0.5 line-clamp-2 max-w-3xl text-[13px] leading-5 text-ink-2">
              {template.description}
            </p>
          )}
          <MetaLine
            className="mt-2 text-[12px] text-muted-foreground"
            items={[
              canClone && `${usageCount.toLocaleString()} ${pluralize(usageCount, "clone")}`,
              template.createdBy && `Created by ${template.createdBy}`,
              template.lastModifiedOn && `Updated ${formatDate(template.lastModifiedOn)}`,
            ]}
          />
          {!!tags?.length && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-sm bg-sunken px-1.5 py-0.5 text-[11.5px] text-ink-2 ring-1 ring-inset ring-line"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {canClone && (
            <Button
              className="gap-1.5"
              disabled={!isApproved || isPending}
              aria-busy={isPending}
              title={isApproved ? undefined : "Only approved templates can be cloned"}
              onClick={() => cloneTemplate(template)}
            >
              {isPending ? (
                <LoadingSpinner className="size-3.5" />
              ) : (
                <CopyIcon className="size-3.5" />
              )}
              {isPending ? "Cloning..." : "Clone template"}
            </Button>
          )}
          {canDeleteTemplate && <DeleteTemplateButton template={template} />}
        </div>
      </div>
    </section>
  );
}
