import { ITables } from "@/features/information-extractor/dtos/info-extractor-test-dto";
import { useExtractedDataStore } from "@/store/extract-via-llm-store";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { inferenceModelTestFormZodSchema } from "../constants/inference-model-test-zod-schema";
import { InferenceModelSetupDTO } from "../dtos/inference-model-setup-dto";

export const useInferenceModelTestForm = () => {
  const { extractedData } = useExtractedDataStore(
    useShallow((state) => ({
      extractedData: state.extractedData,
    })),
  );
  const form = useForm<z.infer<typeof inferenceModelTestFormZodSchema>>({
    resolver: zodResolver(inferenceModelTestFormZodSchema),
    defaultValues: {
      id: "",
      name: "",
      submitForFineTuning: false,
      classification: null,
      extraction: null,
      questionAnswer: null,
      sentimentAnalytics: null,
      summarization: null,
    },
  });

  const {
    formState: { isSubmitting, isDirty, errors },
    control,
  } = form;

  const queryClient = useQueryClient();
  useEffect(() => {
    const data = queryClient.getQueryData<{
      data: InferenceModelSetupDTO;
    }>(["INFERENCE_SETUP_FORM_DATA"]);
    if (!data || !data.data) return;

    const { classification, extraction, questionAnswer, sentimentAnalytics } =
      data.data;

    form.reset({
      ...form.getValues(),
      classification: {
        categories: classification?.setupObject?.categories ?? [],
      },
      extraction: {
        fields: extraction?.setupObject.fields ?? [],
        tables:
          extraction?.setupObject.tables?.map((table) => ({
            name: table.name,
            headers:
              table.tableHeaders?.map((item) => ({
                name: item.name,
                values: [""], // or omit if your Zod schema allows
              })) ?? [],
          })) ?? [],
      },
      questionAnswer: {
        questionAnswers: questionAnswer?.setupObject.questionAnswers?.map(
          (quesAns) => ({
            question: quesAns?.name ?? "",
            answer: "",
          }),
        ) ?? [{}],
      },
      sentimentAnalytics: {
        categories: sentimentAnalytics?.setupObject.categories ?? [],
      },
      summarization: {
        summarizedText: "",
      },
    });
  }, [form, queryClient]);

  useEffect(() => {
    const finalExtractedData = extractedData ?? {};

    const isEmptyObject = Object.keys(finalExtractedData).length === 0;
    if (isEmptyObject) return;

    // Ensure every header has at least one value (even if it's an empty string)
    const normalizedTables =
      extractedData?.extraction?.tables?.map((table: ITables) => ({
        ...table,
        headers:
          table.headers?.map((header) => ({
            ...header,
            values:
              Array.isArray(header.values) && header.values.length > 0
                ? header.values
                : [""], // Ensuring at least one row (value)
          })) ?? [],
      })) ?? form.getValues("extraction.tables");

    form.reset({
      ...form.getValues(),
      classification: extractedData?.classification
        ? { categories: extractedData?.classification }
        : form.getValues("classification"),
      sentimentAnalytics: extractedData?.sentimentAnalytics
        ? { categories: extractedData?.sentimentAnalytics }
        : form.getValues("sentimentAnalytics"),
      summarization: extractedData?.summarization
        ? { summarizedText: extractedData.summarization.summary }
        : form.getValues().summarization,
      questionAnswer: extractedData?.questionAnswer
        ? { questionAnswers: extractedData?.questionAnswer }
        : form.getValues("questionAnswer"),
      extraction: extractedData?.extraction
        ? {
            fields:
              extractedData?.extraction?.fields &&
              extractedData?.extraction?.fields.length > 0
                ? extractedData?.extraction?.fields
                : form.getValues("extraction.fields"),
            // tables:
            //   extractedData?.extraction?.tables &&
            //   extractedData?.extraction?.tables.length > 0
            //     ? extractedData?.extraction?.tables
            //     : form.getValues("extraction.tables"),
            tables: normalizedTables,
          }
        : form.getValues("extraction"),
    });
  }, [extractedData, form]);

  return { form, isSubmitting, isDirty, errors, control };
};
