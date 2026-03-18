import NewAgentIcon from "@/components/NewAgentIcon";

import { DotSeparator, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@aventisia/ui/cards";
import { dateFormatter } from "@aventisia/ui/utils";
import { Calendar, FileBoxIcon } from "lucide-react";

import { ProjectTemplateTypesEnum } from "../../constants/template-types-enum";
import { UseTemplateDTO } from "../../dtos/use-template-dto";
import { useDownloadFile } from "../../hooks/useFileDownload";
import { formatFileSize } from "../../utils";
import { FileTypeIcon } from "./FileTypeIcon";

export function TemplateMetaAside({ template }: { template: UseTemplateDTO }) {
  const { mutate: downloadFile } = useDownloadFile();

  const basePath = import.meta.env.VITE_WORC_PATH;

  return (
    <aside className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-muted-foreground">Type</span>
            <span className="col-span-2">
              {template?.type?.replace(
                ProjectTemplateTypesEnum.AIProject,
                "AI Model",
              )}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-muted-foreground">Version</span>
            <span className="col-span-2">{template?.schemaVersion}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" /> Created
            </span>
            <span className="col-span-2">
              {dateFormatter(template?.createdOn || new Date())}{" "}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" /> Updated
            </span>
            <span className="col-span-2">
              {dateFormatter(template?.lastModifiedOn || new Date())}{" "}
            </span>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {template?.icons?.length ? (
              template?.icons
                ?.filter((icon) => icon !== "/function.png")
                .map((icon, idx) => (
                  <div key={icon || idx} className="rounded-lg bg-accent p-2">
                    <img src={basePath + icon} alt="icon" className="h-6 w-6" />
                  </div>
                ))
            ) : (
              // Fallback icon
              <div className="rounded-lg bg-accent p-2">
                {template?.type == ProjectTemplateTypesEnum.AIProject ? (
                  <FileBoxIcon className="h-6 w-6" />
                ) : (
                  <NewAgentIcon className="h-6 w-6" />
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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
