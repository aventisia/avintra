import {
  dataAndStatsProps,
  documentTypeProps,
  industryProps,
  outputLengthProps,
  outputStructureProps,
  purposeOfArticleProps,
  targetAudienceProps,
  toneAndStyleProps,
  topicProps,
} from "@/features/generative-model/constants/generative-model-field-props.ts/thought-leadership-field-props";
import { generativeModelInputZodSchema } from "@/features/generative-model/constants/model-input-zod-schema";
import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";
import { SelectField } from "@/shared/select-field/SelectField";

import { Separator } from "@aventisia/ui";
import { AutosizeTextareaField } from "@aventisia/ui/form";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import LLMConfiguration from "../../llm-configuration/components/LLMConfiguration";
import DocumentsTable from "../model-input-documents/DocumentsTable";
import ThoughtLeadershipLinks from "./ThoughtLeadershipLinks";

type FormSchema = z.infer<typeof generativeModelInputZodSchema>;

type ThoughtLeadershipProps = {
  form: UseFormReturn<FormSchema>;
};

const ThoughtLeadership = ({ form }: ThoughtLeadershipProps) => {
  const { data: fileList } = useFetchUploadedFiles("setup");

  useEffect(() => {
    form.setValue("thoughtLeadership", {
      documentType: "",
      topic: "",
      industry: "",
      purposeOfArticle: "",
      toneAndStyle: "",
      targetAudience: "",
      dataAndStats: "",
      links: [{ id: "", link: "" }],
      documents:
        fileList && fileList.data.length > 0
          ? fileList.data.map(({ id, name, path }) => {
              return { id: id ?? "", name, filePath: path ?? "" };
            })
          : null,
      outputLength: "",
      outputStructure: "",
      configurationType: "OnPrem",
      llm: "gemma",
      nodePrompt: "",
      temperature: 0.2,
    });
  }, [form, fileList]);

  return (
    <div className="space-y-4">
      <SelectField {...documentTypeProps} />
      <AutosizeTextareaField {...topicProps} />
      <AutosizeTextareaField {...industryProps} />
      <div className="grid grid-cols-2 gap-2 items-center ">
        <SelectField {...purposeOfArticleProps} />
        <SelectField {...toneAndStyleProps} />
      </div>
      <AutosizeTextareaField {...targetAudienceProps} />
      <SelectField {...dataAndStatsProps} />
      <Separator />

      {/* Link */}
      <ThoughtLeadershipLinks form={form} />
      <Separator />
      {/* Documents */}
      <DocumentsTable form={form} taskType="thoughtLeadership" />

      <AutosizeTextareaField {...outputLengthProps} />
      <AutosizeTextareaField {...outputStructureProps} />

      <Separator />
      <LLMConfiguration form={form} taskType="thoughtLeadership" />
    </div>
  );
};

export default ThoughtLeadership;
