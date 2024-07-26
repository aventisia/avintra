import "@/react-toolkit/styles/react-perfect-scrollbar.css";
import { AlertDialog } from "@/react-toolkit/ui/alert-dialog.tsx";
import { ConfirmActionAlert } from "@/react-toolkit/ui/custom/ConfirmActionAlert.tsx";
import { ToasterExt } from "@/react-toolkit/ui/custom/ToasterExt.tsx";
import { TooltipProvider } from "@/react-toolkit/ui/custom/Tooltip.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TooltipProvider>
      {/* Alert dialog provider */}
      <AlertDialog>
        {/* Main app */}
        <App />

        {/* Custom alert dialog for confirm action */}
        <ConfirmActionAlert />
      </AlertDialog>

      {/* To show toaster notifications */}
      <ToasterExt />
    </TooltipProvider>
  </React.StrictMode>,
);
