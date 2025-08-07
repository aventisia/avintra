import { ITables } from "@/features/information-extractor/dtos/info-extractor-test-dto";
import { useFileListStore } from "@/features/multi-format-viewer/store/file-list-store";
import { useExtractedDataStore } from "@/store/extract-via-llm-store";

import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { updateInferenceModelTestFormData } from "../apis/inference-mode-test-apis";
import { inferenceModelTestFormZodSchema } from "../constants/inference-model-test-zod-schema";
import { InferenceModelSetupDTO } from "../dtos/inference-model-setup-dto";
import { useFetchTestFormData } from "./useFetchTestFormData";

export const useInferenceModelTestForm = () => {
  const { extractedData } = useExtractedDataStore(
    useShallow((state) => ({
      extractedData: state.extractedData,
    })),
  );
  const { selectedFile } = useFileListStore(
    useShallow((state) => ({
      selectedFile: state.selectedFile,
    })),
  );
  const { data: fieldDataValues } = useFetchTestFormData();
  const form = useForm<z.infer<typeof inferenceModelTestFormZodSchema>>({
    resolver: zodResolver(inferenceModelTestFormZodSchema),
    defaultValues: {
      id: "",
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

  // 1. Initialize Field Names
  const initializeFieldNames = useCallback(async () => {
    const data = queryClient.getQueryData<{
      data: InferenceModelSetupDTO;
    }>(["INFERENCE_SETUP_FORM_DATA"]);
    if (!data || !data.data) return;

    const {
      classification,
      extraction,
      questionAnswer,
      sentimentAnalytics,
      summarization,
    } = data.data;

    form.reset({
      ...form.getValues(),
      classification: classification
        ? (classification?.setupObject?.categories ?? [])
        : null,
      extraction: extraction
        ? {
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
          }
        : null,
      questionAnswer: questionAnswer
        ? (questionAnswer?.setupObject.questionAnswers?.map((quesAns) => ({
            question: quesAns?.name ?? "",
            answer: "",
            confidenceScore: "",
          })) ?? [{}])
        : null,
      sentimentAnalytics: sentimentAnalytics
        ? (sentimentAnalytics?.setupObject.categories ?? [])
        : null,
      summarization: summarization
        ? {
            summary: "",
          }
        : null,
    });
  }, [form, queryClient]);

  // 2. Load TEST_FORM
  const populateFieldValues = useCallback(() => {
    if (!fieldDataValues || !selectedFile) return;

    const matchingExtractedData = fieldDataValues.data.find(
      (item) => item.docId === selectedFile.id,
    );

    // Update QnA Fields
    const existingQnAFields = form.getValues("questionAnswer") ?? [];
    console.log("matching", matchingExtractedData?.questionAnswer);
    const updateQnAFields = existingQnAFields.map((field) => {
      console.log("field question", field.question);
      const match =
        matchingExtractedData?.questionAnswer &&
        matchingExtractedData?.questionAnswer.find((item) => {
          return item.question === field.question;
        });
      return { ...field, answer: match?.answer ?? field.answer ?? "" };
    });
    console.log("updateQnaField", updateQnAFields);

    // Update Extraction Fields and Tables
    const existingExtractionFields = form.getValues("extraction.fields") ?? [];
    const existingExtractionTables = form.getValues("extraction.tables") ?? [];

    const updatedExtractionFields = existingExtractionFields.map((field) => {
      const match =
        matchingExtractedData?.extraction &&
        matchingExtractedData?.extraction.fields.find(
          (item) => item.name === field.name,
        );

      return {
        ...field,
        value: match?.value ?? field.value ?? "",
        confidenceScore: match?.confidenceScore ?? field.confidenceScore ?? "",
      };
    });

    const updatedExtractionTables = existingExtractionTables.map((table) => {
      const matchedTable = matchingExtractedData?.extraction?.tables?.find(
        (t) => t.name === table.name,
      );

      const updatedHeaders = table.headers.map((header) => {
        const matchedHeader = matchedTable?.headers?.find(
          (h) => h.name === header.name,
        );

        return {
          ...header,
          values: matchedHeader?.values ?? header.values ?? [],
        };
      });

      return {
        ...table,
        headers: updatedHeaders,
      };
    });

    // Update Classification Fields
    const existingClassificationFields = form.getValues("classification") ?? [];
    const updatedClassificationFields = existingClassificationFields.map(
      (category) => {
        const matchedCategory = matchingExtractedData?.classification?.find(
          (item) => item.name === category.name,
        );

        const updatedSubCategories =
          category.subCategories?.map((subCat) => {
            const matchedSubCat = matchedCategory?.subCategories?.find(
              (item) => item.name === subCat.name,
            );

            const updatedSubSubCategories =
              subCat.subSubCategories?.map((subSubCat) => {
                const matchedSubSubCat = matchedSubCat?.subSubCategories?.find(
                  (item) => item.name === subSubCat.name,
                );

                return {
                  ...subSubCat,
                  value: matchedSubSubCat?.value ?? subSubCat.value ?? "false",
                  confidenceScore:
                    matchedSubSubCat?.confidenceScore ??
                    subSubCat.confidenceScore ??
                    "",
                };
              }) ?? subCat.subSubCategories;

            return {
              ...subCat,
              value: matchedSubCat?.value ?? subCat.value ?? "false",
              confidenceScore:
                matchedSubCat?.confidenceScore ?? subCat.confidenceScore ?? "",
              subSubCategories: updatedSubSubCategories,
            };
          }) ?? category.subCategories;

        return {
          ...category,
          value: matchedCategory?.value ?? category.value ?? "false",
          confidenceScore:
            matchedCategory?.confidenceScore ?? category.confidenceScore ?? "",
          subCategories: updatedSubCategories,
        };
      },
    );

    // Update Sentiment Analytics Fields
    const existingSentimentAnalyticsFields =
      form.getValues("sentimentAnalytics") ?? [];
    const updatedSentimentAnalyticsFields =
      existingSentimentAnalyticsFields.map((category) => {
        const matchedCategory = matchingExtractedData?.sentimentAnalytics?.find(
          (item) => item.name === category.name,
        );

        const updatedSubCategories =
          category.subCategories?.map((subCat) => {
            const matchedSubCat = matchedCategory?.subCategories?.find(
              (item) => item.name === subCat.name,
            );

            const updatedSubSubCategories =
              subCat.subSubCategories?.map((subSubCat) => {
                const matchedSubSubCat = matchedSubCat?.subSubCategories?.find(
                  (item) => item.name === subSubCat.name,
                );

                return {
                  ...subSubCat,
                  value: matchedSubSubCat?.value ?? subSubCat.value ?? "false",
                  confidenceScore:
                    matchedSubSubCat?.confidenceScore ??
                    subSubCat.confidenceScore ??
                    "",
                };
              }) ?? subCat.subSubCategories;

            return {
              ...subCat,
              value: matchedSubCat?.value ?? subCat.value ?? "false",
              confidenceScore:
                matchedSubCat?.confidenceScore ?? subCat.confidenceScore ?? "",
              subSubCategories: updatedSubSubCategories,
            };
          }) ?? category.subCategories;

        return {
          ...category,
          value: matchedCategory?.value ?? category.value ?? "false",
          confidenceScore:
            matchedCategory?.confidenceScore ?? category.confidenceScore ?? "",
          subCategories: updatedSubCategories,
        };
      });

    if (matchingExtractedData) {
      form.reset({
        id: matchingExtractedData.id ?? "",
        submitForFineTuning: matchingExtractedData.submitForFineTuning ?? false,
        extraction: matchingExtractedData?.extraction
          ? {
              fields:
                updatedExtractionFields ?? form.getValues("extraction.fields"),
              tables:
                updatedExtractionTables ?? form.getValues("extraction.tables"),
            }
          : form.getValues("extraction"),
        summarization:
          matchingExtractedData?.summarization ??
          form.getValues("summarization"),
        questionAnswer: matchingExtractedData.questionAnswer
          ? updateQnAFields
          : form.getValues("questionAnswer"),
        classification: matchingExtractedData?.classification
          ? updatedClassificationFields
          : form.getValues("classification"),
        sentimentAnalytics: matchingExtractedData?.sentimentAnalytics
          ? updatedSentimentAnalyticsFields
          : form.getValues("sentimentAnalytics"),
      });
    }
  }, [form, selectedFile, fieldDataValues]);

  useEffect(() => {
    const setupForm = async () => {
      try {
        await initializeFieldNames();
        populateFieldValues();
      } catch (error) {
        toast.error(error?.toString());
      }
    };

    setupForm();
  }, [initializeFieldNames, populateFieldValues]);

  // 3. Load Executed data, when execute button is clicked
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
        ? extractedData?.classification
        : form.getValues("classification"),
      sentimentAnalytics: extractedData?.sentimentAnalytics
        ? extractedData?.sentimentAnalytics
        : form.getValues("sentimentAnalytics"),
      summarization: extractedData?.summarization
        ? { summary: extractedData.summarization.summary }
        : form.getValues().summarization,
      questionAnswer: extractedData?.questionAnswer
        ? extractedData?.questionAnswer
        : form.getValues("questionAnswer"),
      extraction: extractedData?.extraction
        ? {
            fields:
              extractedData?.extraction?.fields &&
              extractedData?.extraction?.fields.length > 0
                ? extractedData?.extraction?.fields
                : form.getValues("extraction.fields"),
            tables: normalizedTables,
          }
        : form.getValues("extraction"),
    });
  }, [extractedData, form]);

  // 4. Mutation to save/update the test form data in backend.
  const { mutateAsync: updateExtractedFormData, isPending: isUpdatePending } =
    useMutation({
      mutationFn: updateInferenceModelTestFormData,
      onSuccess: () => {
        toast.success("Data successfully updated.");
      },
      onError: () => {
        toast.error("Failed to update data.");
      },
    });

  return {
    form,
    isSubmitting,
    isDirty,
    errors,
    control,
    updateExtractedFormData,
    isUpdatePending,
    initializeFieldNames,
  };
};
