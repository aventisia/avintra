import "@/react-toolkit/styles/react-perfect-scrollbar.css";
import { AlertDialogWrapper } from "@aventisia/ui/alert-dialog";
import { ToasterExt } from "@/react-toolkit/ui/custom/ToasterExt.tsx";
import { TooltipProvider } from "@aventisia/ui/tooltip";
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
