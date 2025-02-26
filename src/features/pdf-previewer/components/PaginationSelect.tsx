import { Button } from "@/react-toolkit/ui/buttons/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/react-toolkit/ui/select";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import pdfIcon from "/pdf-svgrepo-com.svg";
import { PdfViewerDto } from "../dtos/file-list-dtos";

interface PdfPaginatedSelectProps {
  pdfList: PdfViewerDto[];
  selectedPdf: PdfViewerDto;
  onPdfSelect: (pdf: PdfViewerDto) => void;
}

const PaginatedSelect: React.FC<PdfPaginatedSelectProps> = ({
  pdfList,
  selectedPdf,
  onPdfSelect,
}) => {
  const currentIndex = pdfList.findIndex((pdf) => pdf.id === selectedPdf.id);

  const handleFirst = () => onPdfSelect(pdfList[0]);
  const handleLast = () => onPdfSelect(pdfList[pdfList.length - 1]);
  const handlePrev = () => onPdfSelect(pdfList[currentIndex - 1]);
  const handleNext = () => onPdfSelect(pdfList[currentIndex + 1]);

  return (
    <div className="flex w-full flex-col gap-4 rounded-b-lg border-t bg-white px-2 py-1">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="icon7"
          onClick={handleFirst}
          disabled={currentIndex === 0}
        >
          <ChevronsLeft />
        </Button>

        <Button
          variant="outline"
          size="icon7"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft />
        </Button>

        <Select
          value={selectedPdf.id}
          onValueChange={(id) => {
            const pdf = pdfList.find((p) => p.id === id);
            if (pdf) onPdfSelect(pdf);
          }}
        >
          <SelectTrigger size="sm" className="max-w-sm">
            <SelectValue placeholder="Select File" />
          </SelectTrigger>
          <SelectContent>
            {pdfList.map((pdf) => (
              <SelectItem key={pdf.id} value={pdf.id || ""}>
                <div className="flex gap-2">
                  <img src={pdfIcon} alt="pdf icon" className="h-4 w-4" />
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
          <ChevronRight />
        </Button>

        <Button
          variant="outline"
          size="icon7"
          onClick={handleLast}
          disabled={currentIndex === pdfList.length - 1}
        >
          <ChevronsRight />
        </Button>
      </div>

      <div className="hidden text-center text-sm text-gray-500">
        Option {currentIndex + 1} of {pdfList.length}
      </div>
    </div>
  );
};

export default PaginatedSelect;
