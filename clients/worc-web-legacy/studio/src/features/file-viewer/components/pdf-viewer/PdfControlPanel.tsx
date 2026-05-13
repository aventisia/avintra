import { Input, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  RotateCwIcon,
} from "lucide-react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { usePdfViewerStore } from "../../stores/pdf-previewer-store";

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
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon7" onClick={props.goToPreviousPage}>
        <ChevronLeftIcon
          className={`cursor-pointer ${props.firstPageClass} h-4 w-4 `}
        />
      </Button>
      <div className="mx-1 flex items-center gap-1 space-x-1 text-sm">
        <Input
          name="pageNumber"
          type="number"
          min={1}
          max={props.numPages || 1}
          className="h-6 w-8 rounded-md border bg-transparent px-0 text-center"
          value={props.pageNumber}
          onChange={props.onPageChange}
          // readOnly
        />
        of {props.numPages}
      </div>
      <Button variant="ghost" size="icon7" onClick={props.goToNextPage}>
        <ChevronRightIcon
          className={`cursor-pointer ${props.lastPageClass} h-4 w-4 `}
        />
      </Button>
    </div>
  );
};

interface PageRotateProps {
  rotatePageLeft: () => void;
  rotatePageRight: () => void;
}

const PageRotate = ({ rotatePageLeft, rotatePageRight }: PageRotateProps) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon7"
        className="bg-transparent"
        onClick={rotatePageRight}
      >
        <RotateCcwIcon className={`h-4 w-4 cursor-pointer  `} />
      </Button>

      <Button
        variant="ghost"
        size="icon7"
        className="bg-transparent"
        onClick={rotatePageLeft}
      >
        <RotateCwIcon className={`h-4 w-4 cursor-pointer  `} />
      </Button>
    </div>
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
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon7" onClick={props.zoomOut}>
        <PlusIcon className={`h-4 w-4 cursor-pointer ${props.zoomOutClass}`} />
      </Button>
      <Button variant="ghost" size="icon7" onClick={props.zoomIn}>
        <MinusIcon className={`h-4 w-4 cursor-pointer ${props.zoomOutClass}`} />
      </Button>
    </div>
  );
};

const PdfControlPanel = () => {
  const {
    numPages,
    pageNumber,
    rotate,
    scale,
    setPageNumber,
    setRotate,
    setScale,
  } = usePdfViewerStore(
    useShallow((state) => ({
      numPages: state.numPages,
      pageNumber: state.pageNumber,
      scale: state.scale,
      rotate: state.rotate,
      setPageNumber: state.setPageNumber,
      setRotate: state.setRotate,
      setScale: state.setScale,
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

  const rotatePageLeft = () => {
    setRotate(rotate + 90);
  };

  const rotatePageRight = () => {
    setRotate(rotate - 90);
  };

  const isMinZoom = scale < 0.2;
  const isMaxZoom = scale >= 2.0;

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
    <div className="flex items-center gap-1">
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
      <Separator orientation="vertical" className="h-5" />
      <ZoomControl
        toFixed={(scale * 100).toFixed()}
        zoomOutClass={zoomOutClass}
        zoomInClass={zoomInClass}
        zoomOut={zoomOut}
        zoomIn={zoomIn}
      />
      <Separator orientation="vertical" className="h-5" />
      
      <PageRotate
        rotatePageLeft={rotatePageLeft}
        rotatePageRight={rotatePageRight}
      />
    </div>
  );
};

export default PdfControlPanel;
