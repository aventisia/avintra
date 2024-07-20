import {
  useFlowCommentsStore,
  flowCommentZodSchema,
  FlowCommentDto,
} from "@/features/flow-comments";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUserSessionStore } from "@/react-toolkit/stores";

/**
 * Custom hook for defining a form to edit flow comment.
 */
export const useDefineEditCommentForm = () => {
  // Get store state and actions
  const { flowId, fcQueryKey, flowCommentId } = useFlowCommentsStore(
    useShallow((state) => ({
      flowId: state.flowId,
      fcQueryKey: state.fcQueryKey,
      flowCommentId: state.flowCommentId,
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
  });

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

  // Return form
  return { form };
};
