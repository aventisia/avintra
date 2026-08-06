import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, TextareaField } from "@avplatform/ui/form";
import { Button } from "@avplatform/ui/buttons";
import { Avatar, AvatarFallback, AvatarImage } from "@avplatform/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TicketCommentDto } from "../../dtos/TicketDto";
import { ticketCommentZodSchema } from "../../constants/ticket-zod-schema";
import { formatDistanceToNow } from "date-fns";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { TicketDetailApiAdapter } from "../../types/ticket-detail-api-adapter.type";

type CommentFormData = z.infer<typeof ticketCommentZodSchema>;

interface CommentThreadProps {
  ticketId: string;
  comments: TicketCommentDto[];
  api: TicketDetailApiAdapter;
  isClosed?: boolean;
}

export const CommentThread = ({ ticketId, comments, api, isClosed = false }: CommentThreadProps) => {
  const queryClient = useQueryClient();
  const userSession = useUserSessionStore((s) => s.userSession);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<CommentFormData>({
    resolver: zodResolver(ticketCommentZodSchema),
    defaultValues: { message: "" },
  });

  const editForm = useForm<CommentFormData>({
    resolver: zodResolver(ticketCommentZodSchema),
    defaultValues: { message: "" },
  });

  const createMutation = useMutation({
    mutationFn: (data: CommentFormData) =>
      api.createComment(ticketId, { ticketId, message: data.message }),
    onSuccess: (res) => {
      if (res.data) {
        toast.success("Comment added");
        form.reset();
        queryClient.invalidateQueries({ queryKey: ["support-ticket-v2", ticketId] });
      } else {
        toast.error(res.message || "Failed to add comment");
      }
    },
    onError: () => toast.error("Failed to add comment"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CommentFormData }) =>
      api.updateComment(ticketId, id, { id, message: data.message }),
    onSuccess: (res) => {
      if (res.data) {
        toast.success("Comment updated");
        setEditingId(null);
        queryClient.invalidateQueries({ queryKey: ["support-ticket-v2", ticketId] });
      } else {
        toast.error(res.message || "Failed to update comment");
      }
    },
    onError: () => toast.error("Failed to update comment"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteComment(ticketId, id),
    onSuccess: (res) => {
      if (res.data) {
        toast.success("Comment deleted");
        queryClient.invalidateQueries({ queryKey: ["support-ticket-v2", ticketId] });
      } else {
        toast.error(res.message || "Failed to delete comment");
      }
    },
    onError: () => toast.error("Failed to delete comment"),
  });

  const onSubmit = (data: CommentFormData) => createMutation.mutate(data);

  const onEditSubmit = (data: CommentFormData) => {
    if (editingId) updateMutation.mutate({ id: editingId, data });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Comments</h2>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 rounded-lg border p-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.avatarSrc} alt={comment.userFullName || "User"} />
              <AvatarFallback>{comment.initials || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.userFullName || comment.userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {comment.createdOn ? formatDistanceToNow(comment.createdOn, { addSuffix: true }) : ""}
                  </span>
                  {comment.isEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
                </div>
                {!isClosed && comment.userName === userSession?.email && (
                  <div className="flex gap-2">
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setEditingId(comment.id || null);
                        editForm.setValue("message", comment.message);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs text-destructive hover:text-destructive/80"
                      onClick={() => deleteMutation.mutate(comment.id || "")}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              {editingId === comment.id ? (
                <Form methods={editForm} onSubmit={editForm.handleSubmit(onEditSubmit)} className="mt-2 space-y-2">
                  <TextareaField name="message" label="" placeholder="Edit your comment..." />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                      Save
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              ) : (
                <p className="mt-1 text-sm">{comment.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isClosed && (
        <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <TextareaField name="message" label="Add a comment" placeholder="Write your comment..." />
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Posting..." : "Post Comment"}
          </Button>
        </Form>
      )}
    </div>
  );
};
