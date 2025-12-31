import { updateProjectMetaData } from "@/apis/project-apis";
import { ProjectMetaDataDto } from "@/dtos/project-meta-data-dto";
import { LLMsEnum } from "@/enums/llms-enum";
import { useFetchProjectMetaData } from "@/hooks/useFetchProjectMetaData";

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

export function LLMSelector() {
  //Get set model data
  const [modelData, setModelData] = useState<ProjectMetaDataDto>();

  //To disable Selection on llm update
  const [isUpdating, setIsUpdating] = useState(false);

  //Fetch model data
  const { data, refetch } = useFetchProjectMetaData();

  //Create array for llm list
  const llmList = enumToArray(LLMsEnum);

  //Set model data
  useEffect(() => {
    if (data?.data) setModelData(data?.data);
  }, [data?.data]);

  // Mutation for lmm update using PUT
  const llmMutation = useMutation({
    mutationFn: updateProjectMetaData,
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
            } as ProjectMetaDataDto);
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
