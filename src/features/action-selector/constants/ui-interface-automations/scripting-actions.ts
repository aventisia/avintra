import { NodeDataType } from "@/types/node-data-type";

export const scriptingActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "runDOSCommand",
    label: "Run DOS command",
    description:
      "Run a DOS command or console application in invisible mode and retrieves its output upon completion",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "runVBScript",
    label: "Run VBScript",
    description:
      "Executes some custom VBScript code and retrieves its output into a variable",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "runJavaScript",
    label: "Run JavaScript",
    description:
      "Executes some custom JavaScript code and retrieves its output into a variable",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "runPowerShellScript",
    label: "Run PowerShell script",
    description:
      "Executes some custom PowerShell script and retrieves its output into a variable",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "runPythonScript",
    label: "Run Python script",
    description:
      "Executes some custom Python script and retrieves its output into a variable",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "runDotNetScript",
    label: "Run .NET script",
    description:
      "Executes some custom .NET script and retrieves its output into a variable",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
