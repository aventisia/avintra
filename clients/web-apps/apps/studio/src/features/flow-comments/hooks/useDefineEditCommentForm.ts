import { useUserSessionStore } from "@avplatform/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { flowCommentZodSchema } from "../constants/flow-comment-zod-schema";
import { FlowCommentDto } from "../dtos/flow-comment-dto";
import { useFlowCommentsStore } from "../stores/flow-comments-store";

/**
 * Custom hook for defining a form to edit flow comment.
 */
export const useDefineEditCommentForm = () => {
  // Get store state and actions
  const { flowId, fcQueryKey, flowCommentId, toggleEditFormDirty } =
    useFlowCommentsStore(
      useShallow((state) => ({
        flowId: state.flowId,
        fcQueryKey: state.fcQueryKey,
        flowCommentId: state.flowCommentId,
        toggleEditFormDirty: state.toggleEditFormDirty,
      })),
    );

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  const form = useForm<z.infer<typeof flowCommentZodSchema>>({
    resolver: zodResolver(flowCommentZodSchema),
    defaultValues: {
      id: "",
      comment: "",
      flowId: "",
      userFullName: "",
      userName: "",
      avatarSrc: "",
      initials: "",
      createdOn: new Date(),
      isEdited: false,
    },
  });

  // Desctructure form's methods
  const {
    formState: { isDirty },
  } = form;

  // Fetch data when flowCommentId changes
  useEffect(() => {
    // Get list from query client
    const flowCommentsData = queryClient.getQueryData<{
      data: FlowCommentDto[];
    }>(fcQueryKey);

    // Filter list by id
    const flowCommentData = flowCommentsData?.data.find(
      (item) => item.id === flowCommentId,
    );

    // Set data to form
    form.reset({
      id: flowCommentId,
      comment: flowCommentData?.comment ?? "",
      // Read (view) only fields
      flowId: flowId,
      userFullName:
        flowCommentData?.userFullName ??
        userSession?.firstName + " " + userSession?.lastName,
      userName: flowCommentData?.userName ?? userSession?.email,
      avatarSrc: flowCommentData?.avatarSrc ?? userSession?.avatarSrc ?? "",
      initials: flowCommentData?.initials ?? userSession?.userInitials,
      createdOn: flowCommentData?.createdOn
        ? new Date(flowCommentData?.createdOn)
        : new Date(),
      isEdited: flowCommentData?.isEdited ?? false,
    });
  }, [flowCommentId, flowId, form, queryClient, fcQueryKey, userSession]);

  // Save the form dirty state
  useEffect(() => {
    toggleEditFormDirty(isDirty);
  }, [isDirty, toggleEditFormDirty]);

  // Return form
  return { form };
};
