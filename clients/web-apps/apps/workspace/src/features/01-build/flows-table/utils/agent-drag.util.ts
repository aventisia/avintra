import type { DragEvent } from "react";

import { getResourceAccessActions } from "@/features/resource-user-access/utils/resource-access-actions";

import { AGENT_DRAG_PREVIEW_ID } from "../constants/folder-motion.constant";
import { FlowsTableDto } from "../dtos/flows-table-dto";
import { useAgentDragStore } from "../stores/agent-drag.store";
import { MovableAgent } from "../types/movable-agent.type";

const AGENT_DRAG_MIME_TYPE = "application/x-avplatform-agent";

/**
 * Whether the user may move the agent between folders (owner or editor).
 */
export const canMoveAgent = (flow: FlowsTableDto) =>
  Boolean(flow.id) && Boolean(getResourceAccessActions(flow.accessLevel)?.update);

const hasAgentDragData = (event: DragEvent<HTMLElement>) =>
  Array.from(event.dataTransfer.types).includes(AGENT_DRAG_MIME_TYPE);

const readAgentDragData = (event: DragEvent<HTMLElement>): MovableAgent | null => {
  try {
    const parsed = JSON.parse(event.dataTransfer.getData(AGENT_DRAG_MIME_TYPE)) as MovableAgent;
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
};

const announceDraggedAgent = (agent: MovableAgent | null) => {
  // IMPORTANT NOTE: Chrome cancels a drag when the page re-renders during dragstart, so the store update waits a tick.
  setTimeout(() => useAgentDragStore.getState().setDraggedAgent(agent));
};

const setAgentDragImage = (event: DragEvent<HTMLElement>, agentName: string) => {
  const preview = document.getElementById(AGENT_DRAG_PREVIEW_ID);
  const nameSlot = preview?.querySelector("[data-agent-name]");
  if (!preview || !nameSlot) return;

  nameSlot.textContent = agentName;
  event.dataTransfer.setDragImage(preview, 18, 18);
};

/**
 * Props that make an agent draggable, or nothing when the user cannot edit it.
 */
export const getAgentDragProps = (flow: FlowsTableDto) => {
  if (!canMoveAgent(flow)) return {};

  return {
    draggable: true,
    onDragStart: (event: DragEvent<HTMLElement>) => {
      const draggedAgent: MovableAgent = {
        id: flow.id as string,
        name: flow.name,
        folderId: flow.folderId ?? null,
      };
      event.dataTransfer.setData(AGENT_DRAG_MIME_TYPE, JSON.stringify(draggedAgent));
      event.dataTransfer.effectAllowed = "move";
      setAgentDragImage(event, flow.name);
      announceDraggedAgent(draggedAgent);
    },
    onDragEnd: () => announceDraggedAgent(null),
  };
};

/**
 * Handlers that make an element accept dragged agents only; links, files and text are ignored.
 * The hover highlight is exposed through the `data-drop-active` attribute.
 */
export const getAgentDropHandlers = (
  onDropAgent: (agent: MovableAgent) => void,
  canAccept: (agent: MovableAgent) => boolean = () => true,
) => {
  const isAcceptedDrag = (event: DragEvent<HTMLElement>) => {
    const draggedAgent = useAgentDragStore.getState().draggedAgent;
    return hasAgentDragData(event) && (!draggedAgent || canAccept(draggedAgent));
  };

  return {
    onDragOver: (event: DragEvent<HTMLElement>) => {
      if (!isAcceptedDrag(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      event.currentTarget.dataset.dropActive = "true";
    },
    onDragLeave: (event: DragEvent<HTMLElement>) => {
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
      delete event.currentTarget.dataset.dropActive;
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      if (!isAcceptedDrag(event)) return;
      event.preventDefault();
      delete event.currentTarget.dataset.dropActive;
      announceDraggedAgent(null);

      const draggedAgent = readAgentDragData(event);
      if (draggedAgent && canAccept(draggedAgent)) onDropAgent(draggedAgent);
    },
  };
};
