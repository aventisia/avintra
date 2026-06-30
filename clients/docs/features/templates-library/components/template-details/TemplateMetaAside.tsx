import { DotSeparator, Separator } from "@/app/_components/ui";
import { Button } from "@/app/_components/ui/buttons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/cards";

import { UseTemplateDTO } from "../../dtos/use-template-dto";

import { FileTypeIcon } from "./FileTypeIcon";
import { PromptTemplateSchema } from "../../types/prompt-template-schema-type";
import NewAgentIcon from "./NewAgentIcon";
import { dateFormatter } from "@/utils";
import { transformTemplateType } from "../../utils/transform-template-type";

export function TemplateMetaAside({ template }: { template: UseTemplateDTO }) {
  const parsedPromptSchema: PromptTemplateSchema | null = (() => {
    try {
      return template?.schema
        ? (JSON.parse(template.schema) as PromptTemplateSchema)
        : null;
    } catch {
      return null;
    }
  })();

  return (
    <aside className="space-y-3 sm:space-y-4">
      <Card className="border-border">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <span className="text-muted-foreground">Type</span>
            <span className="col-span-2 break-words">
              {transformTemplateType(template?.type)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <span className="text-muted-foreground">Version</span>
            <span className="col-span-2 break-words">
              {template?.schemaVersion}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <span className="text-muted-foreground">Created</span>
            <span className="col-span-2 break-words">
              {dateFormatter(template?.createdOn || new Date())}{" "}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <span className="text-muted-foreground">Updated</span>
            <span className="col-span-2 break-words">
              {dateFormatter(template?.lastModifiedOn || new Date())}{" "}
            </span>
          </div>
          <Separator className="my-2 sm:my-3" />
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {template.icons?.length ? (
              template.icons
                ?.filter((icon) => icon !== "/function.png")
                ?.map((icon, idx) => (
                  <div
                    key={icon || idx}
                    className="rounded-lg bg-accent p-1.5 sm:p-2"
                  >
                    <img
                      src={icon}
                      alt="icon"
                      className="h-5 w-5 sm:h-6 sm:w-6 !border-0"
                    />
                  </div>
                ))
            ) : (
              // Fallback icon
              <div className="rounded-lg bg-accent p-1.5 sm:p-2">
                <NewAgentIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {parsedPromptSchema && parsedPromptSchema.modelConfig ? (
        <Card className="border-border">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">
              Prompt Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Provider</span>
                <span className="col-span-2">
                  {parsedPromptSchema.modelConfig.provider || "-"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Model</span>
                <span className="col-span-2">
                  {parsedPromptSchema.modelConfig.model || "-"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Temperature</span>
                <span className="col-span-2">
                  {parsedPromptSchema.modelConfig.temperature ?? "-"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Top P</span>
                <span className="col-span-2">
                  {parsedPromptSchema.modelConfig.top_p ?? "-"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">JSON Output</span>
                <span className="col-span-2">
                  {parsedPromptSchema.modelConfig.is_json_output
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
      {Array.isArray(parsedPromptSchema?.toolsConfig) &&
      parsedPromptSchema.toolsConfig.length > 0 ? (
        <Card className="border-border">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
            {parsedPromptSchema.toolsConfig.map((tool, idx) => (
              <div key={`${tool.tool}-${idx}`}>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground capitalize">
                    {tool.tool}
                  </span>

                  <span className="col-span-2 break-words">
                    {tool.actions.length > 0
                      ? tool.actions.map((action) => action.action).join(", ")
                      : "-"}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {(template?.resources ?? []).length !== 0 ? (
        <Card className="border-border">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Resources</CardTitle>
          </CardHeader>
          <CardContent className="text-xs sm:text-sm">
            <ul className="space-y-2 sm:space-y-3">
              {template.resources!.map((item) => (
                <li
                  key={item.path}
                  className="flex items-start gap-1.5 sm:gap-2"
                >
                  <FileTypeIcon
                    fileType={item.extension}
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <Button
                      // onClick={() => {
                      //   downloadFile(item);
                      // }}
                      variant={"link"}
                      className="text-wrap text-start h-auto p-0 text-xs sm:text-sm justify-start"
                    >
                      <span className="break-words">{item.name}</span>
                    </Button>

                    {item.size ? (
                      <div className="flex items-center text-2xs sm:text-xs text-muted-foreground flex-wrap">
                        <span className="break-all">{item.size}</span>
                        {/* <span>{formatFileSize(item.size)}</span> */}
                        <DotSeparator className="mx-1" />
                        <span>{item.extension ?? "PDF"}</span>
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
