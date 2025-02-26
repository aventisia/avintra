import { useEffect } from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { usePdfViewerStore } from "../stores/pdf-previewer-store";
import { Input } from "@/react-toolkit/ui/input";

interface PageControlProps {
  numPages: number | null;
  pageNumber: number;
  firstPageClass: string;
  lastPageClass: string;
  goToFirstPage: () => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  goToLastPage: () => void;
  onPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PageControl = (props: PageControlProps) => {
  return (
    <div className="flex items-center space-x-2">
      <ChevronsLeft
        className={`cursor-pointer ${props.firstPageClass} h-6 w-6`}
        onClick={props.goToFirstPage}
      />
      <ChevronLeft
        className={`cursor-pointer ${props.firstPageClass} h-6 w-6`}
        onClick={props.goToPreviousPage}
      />
      <span className="flex items-center gap-1 space-x-1 text-sm">
        Page
        <Input
          name="pageNumber"
          type="number"
          min={1}
          max={props.numPages || 1}
          className="h-6 w-8 rounded-md border bg-transparent px-0 text-center"
          value={props.pageNumber}
          onChange={props.onPageChange}
          readOnly
        />
        of {props.numPages}
      </span>
      <ChevronRight
        className={`cursor-pointer ${props.lastPageClass} h-6 w-6`}
        onClick={props.goToNextPage}
      />
      <ChevronsRight
        className={`cursor-pointer ${props.lastPageClass} h-6 w-6`}
        onClick={props.goToLastPage}
      />
    </div>
  );
};

interface PageRotateProps {
  rotatePage: () => void;
}

const PageRotate = (props: PageRotateProps) => {
  return (
    <RotateCcw className="h-5 w-5 cursor-pointer" onClick={props.rotatePage} />
  );
};

interface ZoomControlProps {
  toFixed: string;
  zoomOutClass: string;
  zoomInClass: string;
  zoomOut: () => void;
  zoomIn: () => void;
}

const ZoomControl = (props: ZoomControlProps) => {
  return (
    <div className="flex items-center space-x-2">
      <ZoomOut
        className={`h-5 w-5 cursor-pointer ${props.zoomOutClass}`}
        onClick={props.zoomOut}
      />
      <span className="text-sm">{props.toFixed}%</span>
      <ZoomIn
        className={`h-5 w-5 cursor-pointer ${props.zoomInClass}`}
        onClick={props.zoomIn}
      />
    </div>
  );
};

interface ControlPanelProps {
  scale: number;
  numPages: number;
  pageNumber: number;
  rotate: number;
}
const ControlPanel = ({
  numPages,
  pageNumber,
  scale,
  rotate,
}: ControlPanelProps) => {
  const { setPageNumber, setRotate, setScale } = usePdfViewerStore(
    useShallow((state) => ({
      setScale: state.setScale,
      setRotate: state.setRotate,
      setPageNumber: state.setPageNumber,
    })),
  );

  const isFirstPage = pageNumber === 1;
  const isLastPage = pageNumber === numPages;

  const firstPageClass = isFirstPage
    ? "opacity-50 pointer-events-none"
    : "hover:opacity-80";
  const lastPageClass = isLastPage
    ? "opacity-50 pointer-events-none"
    : "hover:opacity-80";

  const goToFirstPage = () => {
    if (!isFirstPage) setPageNumber(1);
  };
  const goToPreviousPage = () => {
    if (!isFirstPage) setPageNumber(pageNumber - 1);
  };
  const goToNextPage = () => {
    if (!isLastPage) setPageNumber(pageNumber + 1);
  };
  const goToLastPage = () => {
    if (!isLastPage && numPages) setPageNumber(numPages);
  };

  const onPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPageNumber(Number(value));
  };

  const rotatePage = () => {
    setRotate(rotate + 90);
  };

  const isMinZoom = scale < 0.2;
  const isMaxZoom = scale >= 5.0;

  const zoomOutClass = isMinZoom
    ? "opacity-50 pointer-events-none"
    : "hover:opacity-80";
  const zoomInClass = isMaxZoom
    ? "opacity-50 pointer-events-none"
    : "hover:opacity-80";

  const zoomOut = () => {
    if (!isMinZoom) setScale(scale - 0.1);
  };

  const zoomIn = () => {
    if (!isMaxZoom) setScale(scale + 0.1);
  };

  useEffect(() => {
    setPageNumber(1);
  }, [setPageNumber]);

  return (
    <div className="mb-2 flex h-12 w-full items-center justify-between rounded-t-lg border-b p-2">
      <PageControl
        numPages={numPages}
        pageNumber={pageNumber}
        firstPageClass={firstPageClass}
        lastPageClass={lastPageClass}
        goToFirstPage={goToFirstPage}
        goToPreviousPage={goToPreviousPage}
        goToNextPage={goToNextPage}
        goToLastPage={goToLastPage}
        onPageChange={onPageChange}
      />
      <PageRotate rotatePage={rotatePage} />
      <ZoomControl
        toFixed={(scale * 100).toFixed()}
        zoomOutClass={zoomOutClass}
        zoomInClass={zoomInClass}
        zoomOut={zoomOut}
        zoomIn={zoomIn}
      />
    </div>
  );
};

export default ControlPanel;
