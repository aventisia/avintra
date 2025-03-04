import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import html2canvas from "html2canvas";
import { ScrollArea, ScrollBar } from "@/react-toolkit/ui/scroll-area";
import { usePdfViewerStore } from "../stores/pdf-previewer-store";
import { useShallow } from "zustand/react/shallow";
import ControlPanel from "./ControlPannel";
import PaginatedSelect from "@/features/pdf-previewer/components/PaginationSelect";

import { useFetchDataFields } from "@/features/data-fields/hooks/useFetchDataFields";
import { DataFieldsDto } from "@/features/data-fields/dtos/data-fields-dtos";
import { useFetchUploadedFiles } from "../hooks/useFetchFiles";
import { useDownloadPdf } from "../hooks/useDownloadPdf";
import { usePdfListStore } from "../stores/pdf-list-store";
import { PdfViewerDto } from "../dtos/file-list-dtos";
import PdfLoaderTemplate from "./PdfLoaderTemplate";
import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import { AnnotationDataDto } from "@/features/label-data/dtos/annotation-data-dtos";
import { useFetchAnnotationData } from "@/features/label-data/hooks/useFetchAnnotationData";
import { uploadFile } from "@/features/file-uploader/apis/file-upload-apis";
import { toast } from "sonner";
import { useUpdateAnnotation } from "@/features/label-data/hooks/useUpdateAnnotation";
import FieldSelectionPopover from "./FieldSelectionPopover";
import AnnotationBox from "./AnnotationBox";
import { usePdfWidth } from "../hooks/usePdfWidth";

pdfjs.GlobalWorkerOptions.workerSrc = "assets/pdf.worker.min.js";

export interface DocumentLoadSuccess {
  numPages: number;
}

export interface Annotation {
  fieldId: string;
  pageNumber: number;
  fieldName?: string;
  value?: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  imgPath?: string | undefined;
}

export interface ExtractedData {
  [key: string]: { value: string };
}

export const PdfPreviewer: React.FC = () => {
  //Feild select popover state
  const [isOpen, setIsOpen] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const [fieldTypes, setFieldTypes] = useState<DataFieldsDto[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [pendingAnnotation, setPendingAnnotation] = useState<Annotation | null>(
    null,
  );
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(
    null,
  );
  const { currAnnotationObj } = useAnnotationDataStore(
    useShallow((state) => ({
      currAnnotationObj: state.currAnnotationObj,
      setAnnotationObject: state.setAnnotationObject,
      annotationDataQueryKey: state.annotationDataQueryKey,
      clearCurrAnnotation: state.clearCurrAnnotation,
      setCurrImg: state.setCurrImg,
      currImg: state.currImg,
    })),
  );

  const { selectedPdf, pdfUrl, setSelectedPdf } = usePdfListStore(
    useShallow((state) => ({
      selectedPdf: state.selectedPdf,
      pdfUrl: state.pdfUrl,
      setSelectedPdf: state.setSelectedPdf,
    })),
  );

  const { pageNumber, scale, rotate, setPageNumber, setNumPages, numPages } =
    usePdfViewerStore(
      useShallow((state) => ({
        pageNumber: state.pageNumber,
        scale: state.scale,
        rotate: state.rotate,
        setPageNumber: state.setPageNumber,
        setNumPages: state.setNumPages,
        numPages: state.numPages,
      })),
    );

  const canvasRef = useRef<HTMLDivElement>(null);

  // Create a ref for the invisible trigger button
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const { data } = useFetchDataFields();

  const { data: pdfList, isLoading: isLoadingList } = useFetchUploadedFiles();

  const { data: annotationData, refetch } = useFetchAnnotationData();

  const currAnnotationData = annotationData?.data as
    | AnnotationDataDto[]
    | undefined;

  const { mutate: downloadPdf } = useDownloadPdf();

  const { mutate: updateAnnotation } = useUpdateAnnotation();

  const { width } = usePdfWidth(canvasRef);

  const handlePdfSelect = (newPdf: PdfViewerDto) => {
    setSelectedPdf(newPdf);
    downloadPdf(newPdf.path || "");
    setAnnotations([]);
    setPageNumber(1); // Reset page number when switching PDFs
  };

  // Load initial PDF
  useEffect(() => {
    if (selectedPdf && !pdfUrl) {
      downloadPdf(selectedPdf.path || "");
    }
  }, [selectedPdf, pdfUrl, downloadPdf]);

  useEffect(() => {
    if (data?.data) setFieldTypes(data?.data);
  }, [data?.data]);

  useEffect(() => {
    const obj = JSON.parse(currAnnotationObj || "{}");
    const ann = Object.values(obj) as unknown as Annotation[];
    setAnnotations(ann);
  }, [currAnnotationObj]);

  const onDocumentLoadSuccess = ({ numPages }: DocumentLoadSuccess) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x: x / scale, y: y / scale });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const width = currentX / scale - startPos.x;
    const height = currentY / scale - startPos.y;

    setCurrentAnnotation({
      fieldId: Date.now().toString(),
      pageNumber,
      position: {
        x: startPos.x,
        y: startPos.y,
        width,
        height,
      },
    });
  };

  const handleMouseUp = async () => {
    if (
      currentAnnotation &&
      currentAnnotation?.position.height < 8 &&
      currentAnnotation?.position.width < 8
    )
      return;
    //Trigger the popover to open relative to annotation
    if (triggerRef.current && currentAnnotation && canvasRef.current) {
      triggerRef.current.style.position = "absolute";
      triggerRef.current.style.left = `${currentAnnotation?.position.x * scale}px `;
      triggerRef.current.style.top = `${currentAnnotation?.position.y * scale + currentAnnotation?.position.height}px`;

      setIsOpen(true);
    }

    if (currentAnnotation) {
      // If there's already a pending annotation, remove it first
      setPendingAnnotation({
        ...currentAnnotation,
      });

      // Clear any existing annotations to prevent visual overlap
      const fieldToUpdate = fieldTypes.find((field) =>
        annotations.some(
          (ann) =>
            ann.fieldId === field?.id &&
            isOverlapping(currentAnnotation.position, ann.position),
        ),
      );

      if (fieldToUpdate) {
        // Remove the existing annotation of that type
        setAnnotations(
          annotations.filter((ann) => ann.fieldId !== fieldToUpdate.id),
        );
      }
    }

    setIsDrawing(false);
    setCurrentAnnotation(null);
  };

  // Helper function to check if two annotation areas overlap
  const isOverlapping = (
    pos1: { x: number; y: number; width: number; height: number },
    pos2: { x: number; y: number; width: number; height: number },
  ) => {
    return !(
      pos2.x > pos1.x + pos1.width ||
      pos2.x + pos2.width < pos1.x ||
      pos2.y > pos1.y + pos1.height ||
      pos2.y + pos2.height < pos1.y
    );
  };

  const assignTypeToAnnotation = async (field: DataFieldsDto) => {
    if (pendingAnnotation && field.id && canvasRef.current) {
      // const confidence = calculateConfidence(pendingAnnotation.content, typeId);
      const newAnnotation: Annotation = {
        ...pendingAnnotation,
        fieldId: field.id,
        fieldName: field.name,
        // confidence
      };

      // Remove existing annotation of the same type
      const filteredAnnotations = annotations.filter(
        (ann) => ann.fieldId !== field.id,
      );

      const canvas = await html2canvas(canvasRef.current, {
        x: newAnnotation?.position.x * scale + 1,
        y: newAnnotation?.position.y * scale + 1,
        width: newAnnotation?.position.width * scale - 2,
        height: newAnnotation?.position.height * scale - 2,
        backgroundColor: null,
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
          },
          "image/png",
          0.95,
        );
      }).then();

      // Create a File from the Blob
      const imgFile = new File(
        [blob],
        `${newAnnotation.fieldId}-${selectedPdf?.name}.png`,
        { type: "image/png" },
      );

      try {
        const response = await uploadFile(imgFile);

        const currData = currAnnotationData?.find(
          (item) => item.uploadedDocId === selectedPdf?.id,
        );

        if (response) {
          const currImg = response.data?.data[0]?.path || "";

          updateAnnotation({
            id: currData?.id,
            uploadedDocId: selectedPdf?.id || "",
            mlModelId: selectedPdf?.mlModelId,
            annotationObject: JSON.stringify({
              ...JSON.parse(currData?.annotationObject || "{}"),
              [field.name]: {
                ...newAnnotation,
                imgPath: currImg,
                value: currImg,
              },
            }),
          });
          refetch();
        }
      } catch (error) {
        toast.error(error?.toString());
        throw error;
      }
      // Add the new annotation
      const newAnnotations = [...filteredAnnotations, newAnnotation];
      setAnnotations(newAnnotations);
      setPendingAnnotation(null);
    }
  };

  if (isLoadingList) {
    return <PdfLoaderTemplate />;
  }

  if (!pdfList?.data?.length) {
    return <div className="p-4 text-center">No PDFs available</div>;
  }

  return (
    <div className="w-2/3 max-w-[65vw] rounded-lg border bg-white shadow">
      <ControlPanel
        scale={scale}
        numPages={numPages ?? 0}
        pageNumber={pageNumber}
        rotate={rotate}
      />
      <ScrollArea
        className={`h-[calc(75vh-3rem)] w-[calc(${width / scale}px)] rounded-lg`}
      >
        <div
          ref={canvasRef}
          style={{ position: "relative", width: "100%" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDrawing(false)}
        >
          <Document
            file={pdfUrl}
            // options={options}
            loading={<PdfLoaderTemplate />}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotate}
              width={width}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
          {annotations.map((annotation) => (
            <AnnotationBox annotation={annotation} fieldTypes={fieldTypes} />
          ))}
          {currentAnnotation && (
            <AnnotationBox
              annotation={currentAnnotation}
              fieldTypes={fieldTypes}
            />
          )}
          {pendingAnnotation && (
            <AnnotationBox
              annotation={pendingAnnotation}
              fieldTypes={fieldTypes}
            />
          )}
          <FieldSelectionPopover
            isOpen={isOpen}
            assignTypeToAnnotation={assignTypeToAnnotation}
            fieldTypes={fieldTypes}
            setCurrentAnnotation={setCurrentAnnotation}
            setIsOpen={setIsOpen}
            triggerRef={triggerRef}
          />

          <ScrollBar orientation="horizontal" />
        </div>
      </ScrollArea>
      <PaginatedSelect
        pdfList={pdfList?.data}
        selectedPdf={selectedPdf || pdfList?.data[0]}
        onPdfSelect={handlePdfSelect}
      />
    </div>
  );
};
