import "@/react-toolkit/styles/slide-animation.css";
import { AlertDialogWrapper } from "@/react-toolkit/ui/alert-dialog/AlertDialogWrapper.tsx";
import { ToasterExt } from "@/react-toolkit/ui/custom/ToasterExt.tsx";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TooltipProvider>
      {/* Alert dialog wrapper */}
      <AlertDialogWrapper>
        <App />
      </AlertDialogWrapper>

      {/* To show toaster notifications */}
      <ToasterExt />
    </TooltipProvider>
  </React.StrictMode>,
);
