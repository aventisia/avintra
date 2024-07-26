import "@/react-toolkit/styles/react-perfect-scrollbar.css";
import { ToasterExt } from "@/react-toolkit/ui/custom/ToasterExt.tsx";
import { TooltipProvider } from "@/react-toolkit/ui/custom/Tooltip.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TooltipProvider>
      <App />
      <ToasterExt />
    </TooltipProvider>
  </React.StrictMode>,
);
