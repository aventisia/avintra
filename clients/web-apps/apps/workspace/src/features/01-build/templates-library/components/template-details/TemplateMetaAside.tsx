import { MetaLine } from "@avplatform/ui/meta-line";
import {
  RecordFact,
  RecordFactGrid,
  RecordList,
  RecordListItem,
  RecordPanel,
  RecordSection,
  RecordSummary,
} from "@avplatform/ui/record-sheet";
import { formatDate } from "@avplatform/ui/utils";
import {
  CalendarBlankIcon,
  ClockCounterClockwiseIcon,
  DownloadSimpleIcon,
  GitBranchIcon,
  GlobeHemisphereWestIcon,
  SealCheckIcon,
  ShapesIcon,
} from "@phosphor-icons/react";

import { UseTemplateDTO } from "../../dtos/use-template-dto";
import { useDownloadFile } from "../../hooks/useFileDownload";
import { formatFileSize } from "../../utils";
import {
  getTemplateAccessLabel,
  getTemplateIconUrls,
  getTemplateTypeLabel,
  parseTemplateSchema,
} from "../../utils/template-attributes.util";
import { TemplateIntegrations } from "../TemplateIntegrations";
import { FileTypeIcon } from "./FileTypeIcon";

/**
 * Side column of a template page: its details, integrations, prompt settings, tools and
 * downloadable resources.
 */
export function TemplateMetaAside({ template }: { template: UseTemplateDTO }) {
  const { mutate: downloadFile } = useDownloadFile(template.accessType === "Public");
  const schema = parseTemplateSchema(template.schema);
  const modelConfig = schema?.modelConfig;
  const tools = Array.isArray(schema?.toolsConfig) ? schema.toolsConfig : [];
  const integrationCount = getTemplateIconUrls(template.icons).length;
  const resources = template.resources ?? [];

  return (
    <aside className="space-y-6">
      <RecordSection title="Details">
        <RecordSummary>
          <RecordFactGrid>
            <RecordFact
              Icon={ShapesIcon}
              label="Type"
              value={getTemplateTypeLabel(template.type)}
            />
            <RecordFact
              Icon={GlobeHemisphereWestIcon}
              label="Access"
              value={getTemplateAccessLabel(template.accessType)}
            />
            <RecordFact Icon={SealCheckIcon} label="Status" value={template.status} />
            <RecordFact Icon={GitBranchIcon} label="Version" value={template.schemaVersion} />
            <RecordFact
              Icon={CalendarBlankIcon}
              label="Created"
              value={template.createdOn && formatDate(template.createdOn)}
            />
            <RecordFact
              Icon={ClockCounterClockwiseIcon}
              label="Updated"
              value={template.lastModifiedOn && formatDate(template.lastModifiedOn)}
            />
          </RecordFactGrid>
        </RecordSummary>
      </RecordSection>

      {integrationCount > 0 && (
        <RecordSection title="Integrations" count={integrationCount}>
          <RecordPanel>
            <TemplateIntegrations icons={template.icons} size="md" />
          </RecordPanel>
        </RecordSection>
      )}

      {modelConfig && (
        <RecordSection title="Prompt configuration">
          <RecordSummary>
            <RecordFactGrid>
              <RecordFact label="Provider" value={modelConfig.provider} />
              <RecordFact label="Model" value={modelConfig.model} />
              <RecordFact label="Temperature" value={modelConfig.temperature} />
              <RecordFact label="Top P" value={modelConfig.top_p} />
              <RecordFact
                label="JSON output"
                value={modelConfig.is_json_output ? "Enabled" : "Disabled"}
              />
            </RecordFactGrid>
          </RecordSummary>
        </RecordSection>
      )}

      {tools.length > 0 && (
        <RecordSection title="Tools" count={tools.length}>
          <RecordList>
            {tools.map(({ tool, actions }, index) => (
              <RecordListItem key={`${tool}-${index}`} className="items-start">
                <span className="w-24 shrink-0 truncate text-[13px] font-medium capitalize text-ink">
                  {tool}
                </span>
                <span className="min-w-0 break-words text-[12.5px] text-ink-2">
                  {actions.map(({ action }) => action).join(", ") || "No actions"}
                </span>
              </RecordListItem>
            ))}
          </RecordList>
        </RecordSection>
      )}

      {resources.length > 0 && (
        <RecordSection title="Resources" count={resources.length}>
          <RecordList>
            {resources.map((file) => (
              <RecordListItem key={file.path} className="p-0">
                <button
                  type="button"
                  onClick={() => downloadFile(file)}
                  className="group flex w-full min-w-0 items-center gap-3 p-3 text-left outline-none transition hover:bg-hover focus-visible:bg-hover"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-sunken ring-1 ring-inset ring-line">
                    <FileTypeIcon fileType={file.extension} className="size-4 text-ink-2" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink group-hover:text-primary-text">
                      {file.name}
                    </span>
                    <MetaLine
                      className="text-[11.5px] text-muted-foreground"
                      items={[file.size ? formatFileSize(file.size) : null, file.extension]}
                    />
                  </span>
                  <DownloadSimpleIcon className="size-4 shrink-0 text-muted-foreground group-hover:text-ink" />
                </button>
              </RecordListItem>
            ))}
          </RecordList>
        </RecordSection>
      )}
    </aside>
  );
}
