import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const openTerminalSessionFieldList: IDynamicFieldSchema[] = [
  {
    name: "provider",
    type: "select",
    label: "Provider",
    description: "The terminal emulation to use",
    selectOptions: [
      { label: "Micro focus reflection", value: "micro focus reflection" },
      { label: "HLLAPI", value: "hLLAPI" },
    ],
    defaultValue: "micro focus reflection",
  },
  {
    name: "hLLAPIDllPath",
    type: "text",
    label: "HLLAPI DLL path",
    description:
      "	The HLLAPI DLL of the provider. RocketSoftware BlueZone default name: 'ehlapi64.dll'. IBM Personal Communications default name: 'EHLAPI32.dll'. MicroFocus Rumba default path: 'System/ehlapi32.Dll'. Cybelesoft zScope default name: 'zHllap32.dll'. Any other provider that offers an HLLAPI DLL in its installation folder.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "provider", value: "hLLAPI" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "installationPath",
    type: "text",
    label: "Installation path",
    description:
      "The installation path of the provider's application on the user's file system",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "provider", value: "micro focus reflection" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "configuration",
    type: "select",
    label: "Configuration",
    description:
      "Choose 'Existing profile' to select a file containing a preconfigured terminal emulation connection. Choose 'Specify connection' to specify the type of the connection, the host address and the port.",
    selectOptions: [
      { label: "Existing profile", value: "existing profile" },
      { label: "Specify Connection", value: "specify connection" }
    ],
    defaultValue: "existing profile",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "provider", value: "micro focus reflection" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "sessionName",
    type: "text",
    label: "Session name",
    description:
      "The session name to connect to. The HLLAPI short name, and it's a unique identifier for the host session. It can be found in the Terminal emulator's configuration settings.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "provider", value: "hLLAPI" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "hostType",
    type: "select",
    label: "Host type",
    description: "The host type of the connection",
    selectOptions: [
      { label: "IBM 3270", value: "iBM 3270" },
      { label: "IBM 5250", value: "iBM 5250" },
    ],
    defaultValue: "iBM 3270",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "provider", value: "micro focus reflection" },
              { key: "configuration", value: "specify connection" },
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "profile",
    type: "text",
    label: "Profile",
    description: "The file that contains the preconfigured connection",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "provider", value: "micro focus reflection" },
              { key: "configuration", value: "existing profile" },
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "hostAddress",
    type: "text",
    label: "Host address",
    description: "The host's address to connect to",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "provider", value: "micro focus reflection" },
              { key: "configuration", value: "specify connection" },
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "port",
    type: "text",
    label: "Port",
    description: "The port to be used for this connection",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "provider", value: "micro focus reflection" },
              { key: "configuration", value: "specify connection" },
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "attachToRunningSession",
    type: "switch",
    label: "Attach to running session",
    description:
      "Specifies whether to attach to a currently open/running terminal session",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "provider", value: "micro focus reflection" },
            ],
          },
        ],
        initialState: true,
      },
    },
  },
  // output
  {
    name: "o_terminalSessionOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The specific terminal session for use with later terminal emulation commands",
    defaultValue: "TerminalSession",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_terminalSessionSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_terminalSessionSwitch",
    type: "output-switch-field",
    label: "TerminalSession",
    defaultValue: true,
  },
];

const openTerminalSessionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["provider"],
      ["hLLAPIDllPath"],
      ["installationPath"],
      ["configuration"],
      ["sessionName"],
      ["hostType"],
      ["profile"],
      ["hostAddress"],
      ["port"],
      ["attachToRunningSession"]
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_terminalSessionOutput", "o_terminalSessionSwitch"]],
  },
];
const openTerminalSession: ActivityConfig = {
  fieldList: openTerminalSessionFieldList,
  fieldCategories: openTerminalSessionFieldCategories,
  fieldsToWatch: ["provider", "configuration", "o_terminalSessionOutput", "o_terminalSessionSwitch"],
};

export default openTerminalSession;
