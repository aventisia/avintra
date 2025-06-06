import { useSearchParams } from "react-router-dom";
import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";
import { useMemo } from "react";
import { FileViewerDto } from "@/features/multi-format-viewer/dtos/file-list-dtos";
import { useFileListStore } from "@/features/multi-format-viewer/store/file-list-store";
import { useShallow } from "zustand/react/shallow";

export const useValidateFidQueryParam = () => {
  const [searchParams] = useSearchParams();
  const { data: fileListData, isLoading, error: fetchError } = useFetchUploadedFiles();
  const { setSelectedFile } = useFileListStore(
      useShallow((state) => ({
        setSelectedFile: state.setSelectedFile,
      })),
    );

  const result = useMemo(() => {
    const fid = searchParams.get("fid");

    // Missing fid
    if (!fid) {
      return {
        isValid: false,
        isLoading,
      };
    }

    // File list not loaded yet
    if (isLoading || fetchError) {
      return {
        isValid: false,
        isLoading,
      };
    }

    const files = fileListData?.data || [];

    // Check if fid matches a docId in any of the files
    const matchedFile = files.find((file: FileViewerDto) => file.id === fid);

    if (!matchedFile) {
      return {
        isValid: false,
        isLoading: false,
      };
    }

    setSelectedFile(matchedFile);

    return {
      isValid: true,
      isLoading: false,
    };
  }, [searchParams, fileListData, isLoading, fetchError, setSelectedFile]);

  return result;
};
