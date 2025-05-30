import { updateModel } from "@/features/model-library-table/apis/model-library-table-apis";
import { ModelLibraryTableDto } from "@/features/model-library-table/dtos/model-library-table-dto";
import { ModelLLMEnum } from "@/features/model-library-table/enums/model-llm-enum";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aventisia/ui/select";
import { toast } from "@aventisia/ui/sonner";
import { enumToArray } from "@aventisia/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useFetchModel } from "../../features/label-data/hooks/useFetchModel";

export function LLMSelector() {
  //Get set model data
  const [modelData, setModelData] = useState<ModelLibraryTableDto>();

  //To disable Selection on llm update
  const [isUpdating, setIsUpdating] = useState(false);

  //Fetch model data
  const { data, refetch } = useFetchModel();

  //Create array for llm list
  const llmList = enumToArray(ModelLLMEnum);

  //Set model data
  useEffect(() => {
    if (data?.data) setModelData(data?.data);
  }, [data?.data]);

  // Mutation for lmm update using PUT
  const llmMutation = useMutation({
    mutationFn: updateModel,
    onSuccess: () => {
      refetch();
      setIsUpdating(false);
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.toString());
    },
  });

  return (
    <>
      <Select
        disabled={isUpdating}
        value={modelData?.llm}
        onValueChange={(val) => {
          setIsUpdating(true);
          if (val)
            llmMutation.mutate({
              ...modelData,
              llm: val,
            } as ModelLibraryTableDto);
        }}
      >
        <SelectTrigger
          className="h-6 w-auto gap-1 rounded-xl border-none bg-white/10 px-3 py-1.5 font-medium text-white"
          size="sm"
        >
          <SelectValue placeholder="Select LLM" />
        </SelectTrigger>
        <SelectContent>
          {llmList.map((item, idx) => (
            <SelectItem value={item.label} key={`${item}-${idx}`}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
