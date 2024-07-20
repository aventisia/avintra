import {
  useFlowCommentsStore,
  flowCommentZodSchema,
} from "@/features/flow-comments";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { useUserSessionStore } from "@/react-toolkit/stores";

/**
 * Custom hook for defining a form to create flow comment.
 */
export const useDefineCreateCommentForm = () => {
  // Get store state and actions
  const { flowId } = useFlowCommentsStore(
    useShallow((state) => ({
      flowId: state.flowId,
    })),
  );

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Define form with zod schema
  const form = useForm<z.infer<typeof flowCommentZodSchema>>({
    resolver: zodResolver(flowCommentZodSchema),
  });

  // Set or reset form data
  useEffect(() => {
    form.reset({
      id: window.crypto.randomUUID(),
      comment: "",
      // Read (view) only fields
      flowId: flowId,
      userFullName: userSession?.firstName + " " + userSession?.lastName,
      userName: userSession?.email,
      avatarSrc: userSession?.avatarSrc ?? "",
      initials: userSession?.userInitials,
      createdOn: new Date(),
      isEdited: false,
    });
  }, [flowId, form, userSession]);

  // Return form and methods
  return { form };
};
