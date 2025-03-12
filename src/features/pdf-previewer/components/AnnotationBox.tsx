import { Annotation } from "./PdfPreviewer";
import { getTailwindColor } from "../utils";
import { DataFieldsDto } from "@/features/data-fields/dtos/data-fields-dtos";
import { usePdfViewerStore } from "../stores/pdf-previewer-store";
import { useShallow } from "zustand/react/shallow";

interface AnnotationBoxProps {
  annotation: Annotation;
  dataFields: DataFieldsDto[];
}

const AnnotationBox = ({ annotation, dataFields }: AnnotationBoxProps) => {
  const { pageNumber, scale } = usePdfViewerStore(
    useShallow((state) => ({
      pageNumber: state.pageNumber,
      scale: state.scale,
    })),
  );

  if (annotation.pageNumber !== pageNumber) return;

  const dataField = annotation.fieldId
    ? dataFields.find((f) => f.id === annotation.fieldId)
    : null;

  const colors = dataField?.color || "gray";
  return (
    <div
      key={annotation.fieldId}
      className="!bg-opacity-10"
      style={{
        position: "absolute",
        left: annotation.position.x * scale,
        top: annotation.position.y * scale,
        width: annotation.position.width * scale,
        height: annotation.position.height * scale,
        border: `1px solid ${getTailwindColor(colors, 500)}`,
        backgroundColor:
          colors == "gray" ? "none" : getTailwindColor(colors, 500),
        opacity: 0.2,
        pointerEvents: "none",
      }}
    />
  );
};

export default AnnotationBox;
