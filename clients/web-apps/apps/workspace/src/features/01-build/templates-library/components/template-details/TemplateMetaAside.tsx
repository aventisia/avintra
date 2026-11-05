import { DotSeparator, Separator } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@avplatform/ui/cards";
import { FALLBACK_VALUE } from "@avplatform/ui/constants";
import { formatDate } from "@avplatform/ui/utils";

import NewAgentIcon from "@/components/NewAgentIcon";

import { UseTemplateDTO } from "../../dtos/use-template-dto";
import { useDownloadFile } from "../../hooks/useFileDownload";
import { PromptTemplateSchema } from "../../types/prompt-template-schema-type";
import { formatFileSize } from "../../utils";
import { transformTemplateType } from "../../utils/transform-template-type";
import { FileTypeIcon } from "./FileTypeIcon";

export function TemplateMetaAside({ template }: { template: UseTemplateDTO }) {
  const { mutate: downloadFile } = useDownloadFile(template.accessType == "Public");
  const parsedPromptSchema: PromptTemplateSchema | null = (() => {
    try {
      return template?.schema ? (JSON.parse(template.schema) as PromptTemplateSchema) : null;
    } catch {
      return null;
    }
  })();
  const basePath = import.meta.env.VITE_WORKSPACE_PATH;

  return (
    <aside className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-muted-foreground">Type</span>
            <span className="col-span-2">{transformTemplateType(template?.type)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-muted-foreground">Version</span>
            <span className="col-span-2">{template?.schemaVersion}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-muted-foreground">Created</span>
            <span className="col-span-2">{formatDate(template?.createdOn)} </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-muted-foreground">Updated</span>
            <span className="col-span-2">{formatDate(template?.lastModifiedOn)} </span>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {template?.icons?.length ? (
              template?.icons
                ?.filter((icon) => icon !== "/function.png")
                .map((icon, idx) => (
                  <div key={icon || idx} className="rounded-lg bg-sunken p-2">
                    <img src={basePath + icon} alt="icon" className="h-6 w-6" />
                  </div>
                ))
            ) : (
              // Fallback icon
              <div className="rounded-lg bg-sunken p-2">
                <NewAgentIcon className="h-6 w-6" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {parsedPromptSchema ? (
        <Card>
          <CardHeader>
            <CardTitle>Prompt configuration</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            {parsedPromptSchema.modelConfig ? (
              <>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Provider</span>
                    <span className="col-span-2">
                      {parsedPromptSchema.modelConfig.provider || FALLBACK_VALUE}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Model</span>
                    <span className="col-span-2">
                      {parsedPromptSchema.modelConfig.model || FALLBACK_VALUE}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Temperature</span>
                    <span className="col-span-2">
                      {parsedPromptSchema.modelConfig.temperature ?? FALLBACK_VALUE}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Top P</span>
                    <span className="col-span-2">
                      {parsedPromptSchema.modelConfig.top_p ?? FALLBACK_VALUE}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">JSON output</span>
                    <span className="col-span-2">
                      {parsedPromptSchema.modelConfig.is_json_output ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
      {Array.isArray(parsedPromptSchema?.toolsConfig) &&
      parsedPromptSchema.toolsConfig.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Tools</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            {parsedPromptSchema.toolsConfig.map((tool, idx) => (
              <div key={`${tool.tool}-${idx}`}>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground capitalize">{tool.tool}</span>

                  <span className="col-span-2 break-words">
                    {tool.actions.length > 0
                      ? tool.actions.map((action) => action.action).join(", ")
                      : FALLBACK_VALUE}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {(template?.resources ?? []).length !== 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <ul className="space-y-2">
              {template.resources!.map((item) => (
                <li key={item.path} className="flex items-center gap-1">
                  <FileTypeIcon fileType={item.extension} />
                  <div className="flex flex-col">
                    <Button
                      onClick={() => {
                        downloadFile(item);
                      }}
                      variant={"link"}
                      className="justify-start text-wrap text-start"
                    >
                      <span>{item.name}</span>
                    </Button>

                    {item.size ? (
                      <div className="flex items-center text-2xs text-muted-foreground">
                        <span>{formatFileSize(item.size)}</span>
                        <DotSeparator className="mx-1" />
                        <span>{item.extension}</span>
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </aside>
  );
}
