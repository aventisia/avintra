// import { updateExtractedData } from "@/apis/extracted-data-api";
// import { useFileListStore } from "@/features/multi-format-viewer/store/file-list-store";
// import { useExtractedDataStore } from "@/store/extract-via-llm-store";

// import { toast } from "@aventisia/ui/sonner";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useCallback, useEffect } from "react";
// import { useFieldArray, useForm } from "react-hook-form";
// import { z } from "zod";
// import { useShallow } from "zustand/react/shallow";

// import { classificationModelTestFormZodSchema } from "../constants/classification-model-test-form-zod-schema";
// import { ClassficationModelSetupDTO } from "../dtos/classfication-model-setup-dto";
// import { useFetchTestFormData } from "./useFetchTestFormData";

// export const useClassificationModelTestForm = () => {
//   const { data: fieldDataValues } = useFetchTestFormData();
//   const form = useForm<z.infer<typeof classificationModelTestFormZodSchema>>({
//     resolver: zodResolver(classificationModelTestFormZodSchema),
//     defaultValues: {
//       categories: [],
//       submitForFineTuning: false,
//     },
//   });
//   const { extractedData } = useExtractedDataStore(
//     useShallow((state) => ({
//       extractedData: state.extractedData,
//     })),
//   );
//   const { selectedFile } = useFileListStore(
//     useShallow((state) => ({
//       selectedFile: state.selectedFile,
//     })),
//   );

//   const { control } = form;

//   const { fields: categoryFields } = useFieldArray({
//     control,
//     name: "categories",
//   });
//   const refineFormData = (
//     formData: z.infer<typeof classificationModelTestFormZodSchema>,
//   ) => {
//     return formData;
//   };

//   const queryClient = useQueryClient();

//   const initializeFieldNames = useCallback(async () => {
//     const data = queryClient.getQueryData<{
//       data: ClassficationModelSetupDTO;
//     }>(["CLASSIFICATION_SETUP_FORM_DATA"]);

//     // Extract setupObject from fetched data
//     const setupFormData = data?.data.setupObject;

//     // Only extract `name` field from fieldSetups
//     const categories = setupFormData?.categories?.map((category) => ({
//       name: category?.name ?? "",
//       value: "false",
//     })) ?? [{}];

//     form.reset({
//       categories,
//       submitForFineTuning: false,
//     });
//   }, [form, queryClient]);

//   // Function to populate field values
//   const populateFieldValues = useCallback(() => {
//     if (!fieldDataValues || !selectedFile) return;

//     const matchingExtractedData = fieldDataValues.data.find(
//       (item) => item.docId === selectedFile.id,
//     );

//     if (
//       matchingExtractedData &&
//       Array.isArray(matchingExtractedData.extractedData)
//     ) {
//       const existingFields = form.getValues("categories") ?? [];

//       const updatedFields = existingFields.map((field) => {
//         const match = matchingExtractedData.extractedData.find(
//           (item) =>
//             item.name.trim().toLowerCase() ===
//             (field.name ?? "").trim().toLowerCase(),
//         );

//         return {
//           ...field,
//           value: match?.value ?? field.value ?? "false",
//         };
//       });

//       form.reset({
//         categories: updatedFields,
//         submitForFineTuning: matchingExtractedData.submitForFineTuning ?? false,
//       });
//     }
//   }, [form, selectedFile, fieldDataValues]);

//   useEffect(() => {
//     const setupForm = async () => {
//       try {
//         await initializeFieldNames();
//         populateFieldValues();
//       } catch (error) {
//         toast.error(error?.toString());
//       }
//     };
//     setupForm();
//   }, [initializeFieldNames, populateFieldValues]);

//   useEffect(() => {
//     const finalExtractedData = extractedData.extractedData ?? [];

//     if (!Array.isArray(finalExtractedData) || finalExtractedData.length === 0)
//       return;

//     const currentFields = form.getValues("categories");

//     const updatedFields = currentFields.map((field) => {
//       const match = finalExtractedData.find(
//         (item) => item.name.trim() === (field.name ?? "").trim(),
//       );

//       return {
//         ...field,
//         value: match.value,
//       };
//     });

//     form.reset({ categories: updatedFields, submitForFineTuning: false });
//   }, [extractedData, form]);

//   const { mutateAsync: updateExtractedFormData, isPending: isUpdatePending } =
//     useMutation({
//       mutationFn: updateExtractedData,
//       onError: () => {
//         toast.error("Failed to update data.");
//       },
//     });

//   return {
//     form,
//     categoryFields,
//     refineFormData,
//     updateExtractedFormData,
//     isUpdatePending,
//     initializeFieldNames,
//   };
// };
