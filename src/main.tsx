import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AlertDialogWrapper } from "@/react-toolkit/ui/alert-dialog/AlertDialogWrapper.tsx";
import { TooltipProvider } from "@/react-toolkit/ui/custom/Tooltip.tsx";
import { ToasterExt } from "@/react-toolkit/ui/custom/ToasterExt.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      {/* Alert dialog wrapper */}
      <AlertDialogWrapper>
        <App />
      </AlertDialogWrapper>

      {/* To show toaster notifications */}
      <ToasterExt />
    </TooltipProvider>
  </StrictMode>,
);
