import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { FileViewerDto } from "@/features/multi-format-viewer/dtos/file-list-dtos";
import { useFileListStore } from "@/features/multi-format-viewer/store/pdf-list-store";
import PaginatedSelect from "@/features/pdf-previewer/components/PaginationSelect";
import { useDownloadPdf } from "@/features/pdf-previewer/hooks/useDownloadPdf";
import { useFetchUploadedFiles } from "@/features/pdf-previewer/hooks/useFetchFiles";

import { ScrollArea } from "@aventisia/ui/scroll";
// import { ScrollArea } from "@aventisia/ui/scroll";
// import { ScrollArea, ScrollBar } from "@aventisia/ui/scroll";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";
import { useShallow } from "zustand/react/shallow";

import ControlPanel from "./ControlPanel";
import ImageLoaderTemplate from "./ImageLoaderTemplate";
import SmartImage from "./SmartImage";

const ImageViewer = () => {
  const { data: fileList, isLoading } = useFetchUploadedFiles();
  const { selectedFile, setSelectedFile, fileUrl } = useFileListStore(
    useShallow((state) => ({
      selectedFile: state.selectedFile,
      fileUrl: state.fileUrl,
      setSelectedFile: state.setSelectedFile,
    })),
  );
  const imageRef = useRef<ReactZoomPanPinchRef>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const { mutate: downloadPdf } = useDownloadPdf();
  // Get model data store state and actions
  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );

  // Load initial PDF
  useEffect(() => {
    if (selectedFile) {
      downloadPdf(selectedFile.path || "");
    }
  }, [selectedFile, downloadPdf, modelId]);

  const handlePdfSelect = (newFile: FileViewerDto) => {
    downloadPdf(newFile.path || "");
    setSelectedFile(newFile);
  };

  const zoomInHandler = () => {
    if (imageRef) {
      imageRef.current?.zoomIn();
      setZoomLevel((prevZoom) => {
        return prevZoom < 200 ? prevZoom + 20 : prevZoom;
      });
    }
  };
  const zoomOutHandler = () => {
    if (imageRef) {
      imageRef.current?.zoomOut();
      setZoomLevel((prevZoom) => {
        return prevZoom > 100 ? prevZoom - 20 : prevZoom;
      });
    }
  };
  const resetTransformHandler = () => {
    if (imageRef) {
      imageRef.current?.resetTransform();
      setRotation(0);
    }
  };

  const rotateClockwiseHandler = useCallback(() => {
    setRotation((rotation) => {
      const newRotation = (rotation + 90) % 360;
      return newRotation;
    });
  }, [setRotation]);

  const rotateAnticlockwiseHandler = useCallback(() => {
    setRotation((rotation) => {
      const newRotation = (rotation - 90) % 360;
      return newRotation;
    });
  }, [setRotation]);

  if (isLoading) {
    return <ImageLoaderTemplate />;
  }

  if (!fileList?.data?.length) {
    return <div className="p-4 text-center">Cannot load Image!!</div>;
  }

  return (
    // <div className="col-span-2 grid grid-rows-[auto_calc(100vh-11.2rem)_auto]  overflow-hidden rounded-lg border bg-white shadow">
    <div className="overflow-hidden rounded-lg border bg-white shadow">
      <ControlPanel
        zoomLevel={zoomLevel}
        zoomInHandler={zoomInHandler}
        zoomOutHandler={zoomOutHandler}
        resetTransformHandler={resetTransformHandler}
        rotateClockwiseHandler={rotateClockwiseHandler}
        rotateAnticlockwiseHandler={rotateAnticlockwiseHandler}
      />
      <ScrollArea className="h-[calc(100vh-11.2rem)] w-full p-2">
        {/* <div className="p-2"> */}
        <div className="w-full h-full">
          <TransformWrapper ref={imageRef} wheel={{ disabled: true }}>
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "100%", height: "100%" }}
            >
              <SmartImage
                src={fileUrl || ""}
                type={selectedFile?.extension}
                alt={selectedFile?.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  transform: `rotate(${rotation}deg)`,
                }}
              />
            </TransformComponent>
          </TransformWrapper>
        </div>
        {/* </div> */}
      </ScrollArea>
      <PaginatedSelect
        pdfList={fileList?.data}
        selectedPdf={selectedFile || fileList?.data[0]}
        onPdfSelect={handlePdfSelect}
      />
    </div>
  );
};

export default ImageViewer;
