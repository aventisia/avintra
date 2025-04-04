import { NodeDataType } from "@/types/node-data-type";

export const browserAutomationActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "extractDataFromWebPage",
    label: "Extract data from web page",
    description:
      "Extract data from specific parts of a web page in the form of single values, lists, rows, or tables",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getDetailsOfWebPage",
    label: "Get details of web page",
    description:
      "Get a property of a web page, such as its title or its source text",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getDetailsOfElementOnWebPage",
    label: "Get details of element on web page",
    description: "Get the value of an element's attribute on a web page",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "takeScreenshotOfWebPage",
    label: "Take screenshot of web page",
    description:
      "Take a screenshot of the web page (or an element of the web page) currently displayed in the browser and save the image into a file or to the clipboard",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "focusTextFieldOnWebPage",
    label: "Focus text field on web page",
    description:
      "Set the focus on an input element of a web page and scroll it into view",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "populateTextFieldOnWebPage",
    label: "Populate text field on web page",
    description: "Fill a text field in a web page with the specified text",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setCheckBoxStateOnWebPage",
    label: "Set check box state on web page",
    description: "Check or uncheck a check box in a web form",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "selectRadioButtonOnWebPage",
    label: "Select radio button on web page",
    description: "Select a radio button on the web page",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setDropdownListValueOnWebPage",
    label: "Set drop-down list value on web page",
    description:
      "Set or clear the selected options for a drop-down list in a web form",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "pressButtonOnWebPage",
    label: "Press button on web page",
    description: "Press a web page button",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "ifWebPageContains",
    label: "If web page contains",
    description:
      "Mark the beginning of a conditional block of actions, depending on whether a specific piece of text or element exists in a web page",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "waitForWebPageContent",
    label: "Wait for web page content",
    description:
      "Suspend the flow until a specific piece of text or web page element appears or disappears from a web page",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "launchNewChrome",
    label: "Launch new Chrome",
    description:
      "Launch a new instance or attach to a running instance of Chrome for automating websites and web applications",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "launchNewMicrosoftEdge",
    label: "Launch new Microsoft Edge",
    description:
      "Launch a new instance or attach to a running instance of Microsoft Edge for automating websites and web applications",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "createNewTab",
    label: "Create new tab",
    description:
      "Create a new tab and navigate to the given URL (supported in Microsoft Edge, Chrome, and Firefox)",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "goToWebPage",
    label: "Go to web page",
    description: "Navigate the web browser to a new page",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  // To be Done later
  // {
  //   type: "activityNode",
  //   name: "clickLinkOnWebPage",
  //   label: "Click link on web page",
  //   description: "Click on a link or any other element of a web page",
  //   img: `${import.meta.env.BASE_URL}function.png`,
  // },
  {
    type: "activityNode",
    name: "clickDownloadLinkOnWebPage",
    label: "Click download link on web page",
    description:
      "Click on a link in a web page that results in downloading a file",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "runJavascriptFunctionOnWebPage",
    label: "Run JavaScript function on web page",
    description:
      "Run a JavaScript function on the web page and get the returned result",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "hoverMouseOverElementOnWebPage",
    label: "Hover mouse over element on web page",
    description: "Hover the mouse over an element of a web page",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "closeWebBrowser",
    label: "Close web browser",
    description: "Close a web browser window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
