import { submitFiles } from "@/features/file-uploader-viewer/apis/file-upload-apis";
import FileUploader from "@/features/file-uploader-viewer/components/FileUploader";
import { useFileStore } from "@/features/file-uploader-viewer/stores/file-uploader-store";
import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";
import { useFileListStore } from "@/features/multi-format-viewer/store/file-list-store";

import { LoadingSpinner, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@aventisia/ui/dialog";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { ScrollArea } from "@aventisia/ui/scroll";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aventisia/ui/select";
import { toast } from "@aventisia/ui/sonner";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  FileTextIcon,
  ImageIcon,
} from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { FileViewerDto } from "../../multi-format-viewer/dtos/file-list-dtos";
import { useDeleteVersionResource } from "../hooks/useDeleteVersionResource";
import { useToggleFileUploadDialogStore } from "../stores/toggle-file-uploader-dialog-store";
//import pdfIcon from "/pdf-svgrepo-com.svg";

interface PdfPaginatedSelectProps {
  pdfList: FileViewerDto[];
  selectedPdf: FileViewerDto;
  onPdfSelect: (pdf: FileViewerDto) => void;
}

const PaginatedSelect: React.FC<PdfPaginatedSelectProps> = ({
  pdfList,
  selectedPdf,
  onPdfSelect,
}) => {
  const { setSelectedPdf } = useFileListStore(
    useShallow((state) => ({
      setSelectedPdf: state.setSelectedFile,
    })),
  );

  const currentIndex = pdfList.findIndex((pdf) => pdf.id === selectedPdf.id);

  const handleFirst = () => onPdfSelect(pdfList[0]);
  const handleLast = () => onPdfSelect(pdfList[pdfList.length - 1]);
  const handlePrev = () => onPdfSelect(pdfList[currentIndex - 1]);
  const handleNext = () => onPdfSelect(pdfList[currentIndex + 1]);

  const { showFileUploadDialog, setShowFileUploadDialog } =
    useToggleFileUploadDialogStore();
  const { refetch } = useFetchUploadedFiles("viewer");
  const { filesToUpload, clearFiles } = useFileStore(
    useShallow((state) => ({
      filesToUpload: state.filesToUpload,
      clearFiles: state.clearFiles,
    })),
  );
  const [fileInsertLoading, setFileInsertLoading] = useState(false);

  const handleInsertFiles = async () => {
    if (filesToUpload.length > 0) {
      setFileInsertLoading(true);
      try {
        await submitFiles(filesToUpload);
        setShowFileUploadDialog(false);
        refetch();
      } catch (error) {
        console.error("Error fetching data or mutating:", error);
      }
      clearFiles();
      // refetchList();
      setFileInsertLoading(false);
    } else {
      toast.error("Please upload a file before submitting.");
    }
  };

  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const { mutate: deleteVersionResourceMutate, isPending } =
    useDeleteVersionResource();

  const deleteFileHandler = () => {
    if (selectedPdf.id) {
      showDefaultAlertDialog({
        confirmActionFn: () =>
          deleteVersionResourceMutate(selectedPdf.id || "", {
            onSuccess: () => {
              refetch().then((fileList) => {
                const list = fileList?.data?.data || [];

                if (list.length === 0) {
                  setSelectedPdf(null);
                }

                if (pdfList.length > 1) {
                  const currentIdx = pdfList.findIndex(
                    (pdf) => pdf.id === selectedPdf.id,
                  );
                  const newPdfList = pdfList.filter(
                    (pdf) => pdf.id !== selectedPdf.id,
                  );
                  // Show previous file if possible, otherwise fallback to first
                  const prevIdx = Math.max(currentIdx - 1, 0);
                  onPdfSelect(newPdfList[prevIdx]);
                }
              });
            },
          }),
        alertType: "delete-record",
        additionalText: "file",
      });
    } else {
      toast.error("Selected file does not have a valid ID.");
    }
  };

  // Render file icon based on extension
  const renderFileIcon = (extension: string) => {
    switch (extension.toUpperCase()) {
      // case "PDF":
      //   return <img src={pdfIcon} alt="pdf icon" className="h-4 w-4" />;
      case "JPEG":
      case "JPG":
      case "PNG":
      case "WEBP":
      case "BMP":
      case "TIF":
      case "TIFF":
        return <ImageIcon className="h-4 w-4 text-blue-400" />;
      default:
        return <FileTextIcon className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <>
      <div className="flex w-full rounded-b-lg border-t bg-white px-3 items-center py-2">
        <Button
          variant={"caution"}
          size="sm"
          className="group gap-1"
          onClick={deleteFileHandler}
          disabled={isPending}
        >
          {isPending ? (
            <LoadingSpinner className="h-4 w-4" />
          ) : (
            <TrashIcon className="size-4 mb-[2px] text-destructive group-focus:text-white group-hover:text-white" />
          )}
          Delete
        </Button>
        <div className="flex items-center justify-center gap-1.5 w-full">
          <Button
            variant="outline"
            size="icon7"
            onClick={handleFirst}
            disabled={currentIndex === 0}
          >
            <ChevronsLeftIcon className="h-5 w-5 stroke-[1.5]" />
          </Button>
          <Button
            variant="outline"
            size="icon7"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeftIcon className="h-5 w-5 stroke-[1.5]" />
          </Button>
          <Select
            value={selectedPdf.id}
            onValueChange={(id) => {
              const pdf = pdfList.find((p) => p.id === id);
              if (pdf) onPdfSelect(pdf);
            }}
          >
            <SelectTrigger size="sm" className="w-96 gap-2 truncate">
              <SelectValue placeholder="Select File" />
            </SelectTrigger>
            <SelectContent>
              {pdfList.map((pdf) => (
                <SelectItem key={pdf.id} value={pdf.id || ""}>
                  <div className="flex gap-2">
                    {renderFileIcon(pdf.extension || "")}
                    <p>{pdf.name}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon7"
            onClick={handleNext}
            disabled={currentIndex === pdfList.length - 1}
          >
            <ChevronRightIcon className="h-5 w-5 stroke-[1.5]" />
          </Button>
          <Button
            variant="outline"
            size="icon7"
            onClick={handleLast}
            disabled={currentIndex === pdfList.length - 1}
          >
            <ChevronsRightIcon className="h-5 w-5 stroke-[1.5]" />
          </Button>
        </div>
        <Button
          variant={"ghost"}
          size="sm"
          className="text-primary"
          onClick={() => setShowFileUploadDialog(true)}
        >
          Manage Files
        </Button>
      </div>

      {/* Temporary fix to handle manage files */}
      <Dialog
        open={showFileUploadDialog}
        onOpenChange={setShowFileUploadDialog}
      >
        <DialogContent className="max-w-[50vw]">
          <DialogDefaultHeader heading="Upload Files" />
          <Separator />
          <div className="p-4 gap-4 flex flex-col">
            <ScrollArea className="!max-h-[calc(80vh)]">
              <FileUploader />
            </ScrollArea>
            {filesToUpload.length > 0 && (
              <Button
                size="xs"
                type="button"
                className="self-end w-20"
                onClick={handleInsertFiles}
              >
                {fileInsertLoading ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  "Save"
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaginatedSelect;
