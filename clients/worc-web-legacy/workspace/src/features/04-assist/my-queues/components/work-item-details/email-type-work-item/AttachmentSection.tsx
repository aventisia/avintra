import { buttonVariants } from "@aventisia/ui/buttons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@aventisia/ui/dropdown-menu";
import { cn } from "@aventisia/ui/lib";
// import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  Download,
  Trash2,
  Eye,
} from "lucide-react";
// --- Types ---

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "xlsx" | "ai" | "img";
}

// --- Sample Data ---

const ATTACHMENTS: Attachment[] = [
  { id: "1", name: "Invoice.pdf", size: "1.2 MB", type: "pdf" },
  { id: "2", name: "Financial_Report_Q1.xlsx", size: "2.4 MB", type: "xlsx" },
  { id: "3", name: "Brand_Logo_Design.ai", size: "12.5 MB", type: "ai" },
  { id: "4", name: "Receipt_001.pdf", size: "800 KB", type: "pdf" },
  { id: "5", name: "Site_Mockup_v2.png", size: "4.2 MB", type: "img" },
  { id: "6", name: "Terms_of_Service.pdf", size: "1.5 MB", type: "pdf" },
];

// --- Helper for Icons & Colors ---

const FileIcon = ({ type }: { type: Attachment["type"] }) => {
  const baseStyles =
    "flex h-8 w-8 items-center justify-center rounded-lg border";

  switch (type) {
    case "pdf":
      return (
        <div
          className={cn(baseStyles, "border-red-100 bg-red-50 text-red-600")}
        >
          <FileText className="h-5 w-5" />
          <span className="sr-only">PDF</span>
        </div>
      );
    case "xlsx":
      return (
        <div
          className={cn(
            baseStyles,
            "border-green-100 bg-green-50 text-green-600",
          )}
        >
          <FileSpreadsheet className="h-5 w-5" />
          <span className="sr-only">Excel</span>
        </div>
      );
    case "ai":
      return (
        <div
          className={cn(
            baseStyles,
            "border-orange-100 bg-orange-50 text-orange-600",
          )}
        >
          <FileImage className="h-5 w-5" />
          <span className="sr-only">AI File</span>
        </div>
      );
    default:
      return (
        <div
          className={cn(baseStyles, "border-gray-100 bg-gray-50 text-gray-600")}
        >
          <FileImage className="h-5 w-5" />
          <span className="sr-only">Image</span>
        </div>
      );
  }
};

// --- Main Component ---

const AttachmentsSection = () => {
  return (
    <div className="w-full max-w-4xl space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold">Attachments</h3>
        <span className="text-xs text-muted-foreground">
          {ATTACHMENTS.length} files
        </span>
      </div>

      {/* <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-gray-50/30"> */}
      <div className="grid grid-cols-3 w-full flex-wrap gap-3">
        {" "}
        {ATTACHMENTS.map((file) => (
          <div
            key={file.id}
            className="group relative flex h-16 col-span-1 flex-none items-center gap-2 rounded-xl border bg-background p-2"
          >
            {/* Icon */}
            <FileIcon type={file.type} />

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">{file.size}</p>
            </div>

            {/* Action Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon7" }),
                  "hover:bg-slate-200",
                  "data-[state=open]:bg-slate-200 data-[state=open]:opacity-100",
                )}
              >
                <EllipsisHorizontalIcon className="h-4 w-4 text-[--icon-color]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" /> Preview
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" /> Download
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
      {/* <ScrollBar orientation="horizontal" />
      </ScrollArea> */}
    </div>
  );
};

export default AttachmentsSection;
