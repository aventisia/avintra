import { type ChatCommand } from "@avplatform/chat";
import {
  ChartBarIcon,
  FileTextIcon,
  FolderOpenIcon,
  GraphIcon,
  LayoutIcon,
  NotePencilIcon,
  TableIcon,
} from "@phosphor-icons/react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

/** The `/` commands offered in the Home composer. */
export const useHomeChatCommands = () => {
  const navigate = useNavigate();
  return useMemo<ChatCommand[]>(
    () => [
      {
        id: "table",
        description: "Make a CSV table",
        icon: TableIcon,
        prompt: "Make a CSV table of ",
      },
      { id: "chart", description: "Draw a chart", icon: ChartBarIcon, prompt: "Draw a chart of " },
      {
        id: "page",
        description: "Build an HTML page",
        icon: LayoutIcon,
        prompt: "Build an HTML page that ",
      },
      {
        id: "diagram",
        description: "Draw an SVG diagram",
        icon: GraphIcon,
        prompt: "Draw an SVG diagram of ",
      },
      {
        id: "doc",
        description: "Write a Markdown document",
        icon: FileTextIcon,
        prompt: "Write a Markdown document about ",
      },
      {
        id: "new",
        description: "Start a new chat",
        icon: NotePencilIcon,
        run: () => navigate("/"),
      },
      {
        id: "files",
        description: "Open your files",
        icon: FolderOpenIcon,
        run: () => navigate("/assist/artifacts"),
      },
    ],
    [navigate],
  );
};
