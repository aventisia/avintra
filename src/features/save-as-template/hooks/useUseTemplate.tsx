import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { applyTemplate } from "../apis/save-as-template-apis";
import { UseTemplateDTO } from "../dtos/use-template-dto";

export const useUseTemplateMutation = () => {
  const { data: modelData, refetch } = useFetchModel();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelId = queryParams.get("pid") || modelData?.data.id || "";
  const { setStepState } = useLabelDataStore(
    useShallow((state) => ({
      setStepState: state.setStepState,
    })),
  );
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (originalData: UseTemplateDTO) => {
      //   // ✅ Modify the data before calling the API
      //   const { createdBy, ...rest } = originalData;

      return applyTemplate({
        ...originalData,
        refId: modelId,
      });
    },
    onError: (error) => {
      toast.error(
        error.toString() || "Failed to use this template. Please try again.",
      );
    },
    onSuccess: (data) => {
      const params = new URLSearchParams(location.search);
      params.set("ml", data.data.type.toLowerCase());
      navigate(`${location.pathname}?${params.toString()}`);
      setStepState(1);
      refetch();
    },
  });
};
