import { useFetchProjectMetaData } from "@/hooks/useFetchProjectMetaData";

import { LoadingSpinner, Separator } from "@aventisia/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@aventisia/ui/accordion";
import { Button } from "@aventisia/ui/buttons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@aventisia/ui/dropdown-menu";
import { AutosizeTextareaField, Form } from "@aventisia/ui/form";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { ScrollArea } from "@aventisia/ui/scroll";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import { businessContextFieldProps } from "../constants/inference-model-field-props";
import { inferenceModelFormZodSchema } from "../constants/inference-model-zod-schema";
import { inferenceTaskComponentMap } from "../constants/inference-tasks-component";
import { tasksList } from "../constants/tasks-list";
import { InferenceModelSetupDTO } from "../dtos/inference-model-setup-dto";
import { useInferenceModelSetupForm } from "../hooks/useInferenceModelSetupForm";

const InferenceModelSetupForm = () => {
  const {
    form,
    isSubmitting,
    isUpdatePending,
    updateFormData,
    refineFormData,
  } = useInferenceModelSetupForm();
  const { data: modelData, isLoading } = useFetchProjectMetaData();
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  useEffect(() => {
    const values = form.getValues();
    const taskKeys = Object.keys(values) as (keyof typeof values)[];
    const tasks = taskKeys.filter(
      (key) =>
        tasksList.some((task) => task.value === key) && values[key] !== null,
    ) as string[];

    setSelectedTasks(tasks);
  }, [form]);

  const handleSelectTask = (taskName: string) => {
    if (!selectedTasks.includes(taskName)) {
      setSelectedTasks([...selectedTasks, taskName]);

      if (taskName === "classification") {
        form.setValue("classification", {
          id: window.crypto.randomUUID(),
          name: "Classification",
          setupObject: {
            categories: [{ name: "", instructions: "", subCategories: [] }],
            allowMultipleClasses: false,
          },
          isByokEnabled: false,
          provider: "openai",
          model:
            import.meta.env.MODE !== "production"
              ? "gpt-4o-mini"
              : "gpt-4o-mini",
          isJsonOutput: true,
          maxOutputToken: 50,
          topP: 1,
          nodePrompt: `You are a reliable text classification assistant. Your task is to analyse the given input text and accurately classify it into the predefined categories based on its content, tone, and intent.\nIf “multiple classification mode” is True, you may return more than one applicable category label. Otherwise, return only the single most appropriate category\nSelect the category (or categories) strictly based on the information present in the input. Do not infer or guess beyond the given content.`,
          temperature: 0.2,
        });
      } else if (taskName === "summarization") {
        form.setValue("summarization", {
          id: window.crypto.randomUUID(),
          name: "Summarization",
          setupObject: {
            summarizationMethod: "stuff",
            totalMaximumWords: 0,
            totalMinimumWords: 0,
          },
          isByokEnabled: false,
          provider: "openai",
          model:
            import.meta.env.MODE !== "production"
              ? "gpt-4o-mini"
              : "gpt-4o-mini",
          isJsonOutput: true,
          maxOutputToken: 50,
          topP: 1,
          nodePrompt: `You are an expert summarisation assistant. Your task is to read the provided content and generate a clear, concise, and accurate summary that captures the key ideas, main points, and critical information, while removing redundant or unimportant details.\nFocus on preserving the original intent and tone of the content. The summary should be easily understandable and suitable for someone who has not read the full text.\nIf the content is structured (like emails, reports, meeting transcripts, articles), maintain the logical flow and structure in the summary.\nBe objective, factual, and avoid adding personal opinions or interpretations.`,
          temperature: 0.2,
        });
      } else if (taskName === "sentimentAnalytics") {
        form.setValue("sentimentAnalytics", {
          id: window.crypto.randomUUID(),
          name: "SentimentAnalytics",
          setupObject: {
            categories: [{ name: "", instructions: "", subCategories: [] }],
          },
          isByokEnabled: false,
          provider: "openai",
          model:
            import.meta.env.MODE !== "production"
              ? "gpt-4o-mini"
              : "gpt-4o-mini",
          isJsonOutput: true,
          maxOutputToken: 50,
          topP: 1,
          nodePrompt: `You are a sentiment analysis assistant. Your task is to evaluate the emotional tone of the provided text and classify its overall sentiment into one of the predefined categories.\nAnalyse the text based on the language, tone, and implied emotion, not just the presence of specific keywords.\nReturn only the sentiment label as the output. If the sentiment is ambiguous or mixed, return "Neutral".`,
          temperature: 0.2,
        });
      } else if (taskName === "questionAnswer") {
        form.setValue("questionAnswer", {
          id: window.crypto.randomUUID(),
          name: "QuestionAnswer",
          setupObject: {
            questionAnswers: [{ name: "", instructions: "" }],
          },
          isByokEnabled: false,
          provider: "openai",
          model:
            import.meta.env.MODE !== "production"
              ? "gpt-4o-mini"
              : "gpt-4o-mini",
          isJsonOutput: true,
          maxOutputToken: 50,
          topP: 1,
          nodePrompt: `You are an assistant that extracts information from documents. You will receive: \n1. The text content of a document.\n2. A list of questions with instructions on how to answer them.\n\nYour task is to carefully read the document and answer each question based ONLY on the document text.\n- Always follow the instructions for formatting each answer.\n- If an answer is not explicitly available in the document, respond with: "Not found in document".\n- Do not add extra information or assumptions.\n- Keep answers concise and accurate.`,
          temperature: 0.2,
        });
      } else if (taskName === "extraction") {
        form.setValue("extraction", {
          id: window.crypto.randomUUID(),
          name: "Extraction",
          setupObject: {
            fields: [{ name: "", type: "", instructions: "" }],
            tables: null,
          },
          isByokEnabled: false,
          provider: "openai",
          model:
            import.meta.env.MODE !== "production"
              ? "gpt-4o-mini"
              : "gpt-4o-mini",
          isJsonOutput: true,
          maxOutputToken: 50,
          topP: 1,
          nodePrompt: `You are a highly accurate information extraction assistant. Your task is to carefully analyse the provided text and extract specific pieces of information based on predefined fields or entities.\nOnly extract relevant, factual data as it appears in the input. Do not infer, assume, or create information that is not explicitly present in the text.\nReturn the output with clearly labeled fields as per the extraction schema.\nIf a field is not present in the input, return null or "" without making assumptions.\nEnsure the extracted data is clean, free from noise, and maintains the original context.`,
          temperature: 0.2,
        });
      }
    }
  };

  function submitHandler(
    formData: z.infer<typeof inferenceModelFormZodSchema>,
  ) {
    const refinedFormData = refineFormData(formData);
    if (!refinedFormData) {
      // Duplicate found and toast already shown in refineFormData
      return;
    }

    updateFormData(refinedFormData as InferenceModelSetupDTO);
  }

  const handleDeleteModel = (type: string) => {
    setSelectedTasks((tasks) => tasks.filter((item) => item !== type));

    // Reset the corresponding form field to null
    if (
      type === "classification" ||
      type === "summarization" ||
      type === "sentimentAnalytics" ||
      type === "questionAnswer" ||
      type === "extraction"
    ) {
      form.setValue(
        type as keyof typeof inferenceModelFormZodSchema._type,
        null,
      );
    }
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting || isLoading || modelData?.data.isPublished}
    >
      <ScrollArea className="mt-4 flex-grow h-[calc(100vh-14.2rem)]">
        <FormProvider {...form}>
          <div className="px-4 space-y-4">
            <AutosizeTextareaField {...businessContextFieldProps} />

            {selectedTasks.map((taskKey) => {
              const taskConfig = inferenceTaskComponentMap[taskKey];
              if (!taskConfig) return null;

              const { label, component: Component } = taskConfig;

              return (
                <Accordion
                  key={taskKey}
                  type="single"
                  collapsible
                  className="w-full bg-slate-100 rounded-lg shadow-sm"
                  defaultValue={taskKey}
                >
                  <AccordionItem
                    value={taskKey}
                    className="border-none text-base"
                  >
                    <AccordionTrigger className="text-base px-4 py-2 flex justify-between items-center">
                      <div className="flex items-center w-full justify-between">
                        <span>{label}</span>
                        <span
                          className="px-2 py-4"
                          onClick={(e) => {
                            e.preventDefault();
                            showDefaultAlertDialog({
                              confirmActionFn: () => {
                                handleDeleteModel(taskKey);
                              },
                              alertType: "delete-record",
                              additionalText: `task`,
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance px-1">
                      <Component form={form} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            })}
          </div>
        </FormProvider>

        {/* Dialog to select models */}
        {selectedTasks.length < tasksList.length && (
          <div className="px-4 mt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-dashed py-6 gap-1 text-md font-normal"
                >
                  <Plus size={18} />
                  Add Tasks
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="p-1"
                align="start"
                style={{
                  minWidth: "var(--radix-dropdown-menu-trigger-width)",
                }}
              >
                <DropdownMenuGroup>
                  {tasksList
                    .filter((task) => !selectedTasks.includes(task.value)) // <-- remove selected tasks
                    .map((item, index, filtered) => (
                      <div key={item.id}>
                        <DropdownMenuItem
                          onClick={() => handleSelectTask(item.value)}
                          className="flex-col justify-start text-left items-start gap-1 py-3 cursor-pointer"
                        >
                          <h2 className="text-md">{item.label}</h2>
                          <p className="text-sm text-muted-foreground font-normal truncate w-full">
                            {item.description}
                          </p>
                        </DropdownMenuItem>
                        {index < filtered.length - 1 && <Separator />}
                      </div>
                    ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </ScrollArea>
      <Separator className="my-0 h-[0.5px] w-full" />
      <div className="flex items-center justify-end gap-2 px-4 py-1 pb-4">
        <Button
          size="xs"
          type="submit"
          disabled={isSubmitting}
          className="w-16"
        >
          {isSubmitting || isUpdatePending ? (
            <LoadingSpinner className="h-4 w-4" />
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default InferenceModelSetupForm;
