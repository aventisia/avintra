import { updateExtractedData } from "@/apis/extracted-data-api";
import { useFileListStore } from "@/features/multi-format-viewer/store/file-list-store";
import { useExtractedDataStore } from "@/store/extract-via-llm-store";

import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { questionAnswerTestFormZodSchema } from "../constants/question-answer-test-form-zod-schema";
import { AiPersonaSetupDTO } from "../dtos/ai-persona-setup-dto";
import { useFetchTestFormData } from "./useFetchTestFormData";

export const useQuestionAnswersTestForm = () => {
  const { data: fieldDataValues } = useFetchTestFormData();

  const form = useForm<z.infer<typeof questionAnswerTestFormZodSchema>>({
    resolver: zodResolver(questionAnswerTestFormZodSchema),
    defaultValues: {
      questionAnswers: [],
      submitForFineTuning: false,
    },
  });

  const { control } = form;
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

  const { fields: questionAnswerFields } = useFieldArray({
    control,
    name: "questionAnswers",
  });

  const queryClient = useQueryClient();

  // Function to initialize empty field names using setup form data
  const initializeFieldNames = useCallback(async () => {
    const data = queryClient.getQueryData<{ data: AiPersonaSetupDTO }>([
      "QUESTION_ANSWER_SETUP_FORM_DATA",
    ]);
    const setupFormData = data?.data.setupObject;
    console.log(setupFormData);

    // const questionAnswers = setupFormData?.instructions?.map((quesAns) => ({
    //   question: quesAns?.name ?? "",
    //   answer: "",
    // })) ?? [{}];

    // form.reset({ questionAnswers });
  }, [form, queryClient]);

  // Function to populate field values
  const populateFieldValues = useCallback(() => {
    if (!fieldDataValues || !selectedFile) return;

    const matchingExtractedData = fieldDataValues.data.find(
      (item) => item.docId === selectedFile.id,
    );

    if (
      matchingExtractedData &&
      Array.isArray(matchingExtractedData.extractedData)
    ) {
      const existingFields = form.getValues("questionAnswers") ?? [];

      const updatedFields = existingFields.map((field) => {
        const match = matchingExtractedData.extractedData.find(
          (item) =>
            item.question.trim().toLowerCase() ===
            (field.question ?? "").trim().toLowerCase(),
        );

        return {
          ...field,
          answer: match?.answer ?? field.answer ?? "",
        };
      });

      form.reset({
        questionAnswers: updatedFields,
        submitForFineTuning: matchingExtractedData.submitForFineTuning ?? false,
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

  useEffect(() => {
    const finalExtractedData = extractedData.extractedData ?? [];

    if (!Array.isArray(finalExtractedData) || finalExtractedData.length === 0)
      return;

    const currentFields = form.getValues("questionAnswers");

    const updatedFields = currentFields.map((field) => {
      const match = finalExtractedData.find(
        (item) => item.question.trim() === (field.question ?? "").trim(),
      );

      return {
        ...field,
        answer: match?.answer ?? "",
      };
    });

    form.reset({ questionAnswers: updatedFields, submitForFineTuning: false });
  }, [extractedData, form]);

  const { mutateAsync: updateExtractedFormData, isPending: isUpdatePending } =
    useMutation({
      mutationFn: updateExtractedData,
      onSuccess: () => {
        toast.success("Data successfully updated.");
      },
      onError: () => {
        toast.error("Failed to update data.");
      },
    });

  return {
    form,
    questionAnswerFields,
    updateExtractedFormData,
    isUpdatePending,
    initializeFieldNames,
  };
};
