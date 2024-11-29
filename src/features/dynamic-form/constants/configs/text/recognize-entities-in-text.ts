import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const recognizeEntitiesInTextFieldList: IDynamicFieldSchema[] = [
  {
    name: "textToRecognizeFrom",
    type: "textarea",
    label: "Text to recognize from",
    description: "The text to recognize entities from",
    defaultValue: "",
  },
  {
    name: "entityType",
    type: "select",
    label: "Entity type",
    description:
      "The type of entity to recognize (e.g., Date time, Email, URL etc.)",
    selectOptions: [
      { label: "Date time", value: "dateTime" },
      { label: "Dimension", value: "dimension" },
      { label: "Temperature", value: "temperature" },
      { label: "Currency", value: "currency" },
      { label: "Number range", value: "numberRange" },
      { label: "Number", value: "number" },
      { label: "Ordinal", value: "ordinal" },
      { label: "Percentage", value: "percentage" },
      { label: "Phone number", value: "phoneNumber" },
      { label: "Email", value: "email" },
      { label: "IP address", value: "IPAddress" },
      { label: "Mention", value: "mention" },
      { label: "Hashtag", value: "hashtag" },
      { label: "URL", value: "URL" },
      { label: "GUID", value: "GUID" },
      { label: "Quoted text", value: "quotedText" },
    ],
    defaultValue: "dateTime",
  },
  {
    name: "languages",
    type: "select",
    label: "Languages",
    description: "TSpecify the language of the text",
    selectOptions: [
      { label: "English", value: "english" },
      { label: "Chinese (Simplified)", value: "chinese" },
      { label: "Spanish", value: "spanish" },
      { label: "Spanish (Mexico)", value: "spanishMexico" },
      { label: "Portuguese", value: "portuguese" },
      { label: "French", value: "french" },
      { label: "German", value: "german" },
      { label: "Italian", value: "italian" },
      { label: "Japanese", value: "japanese" },
      { label: "Dutch", value: "dutch" },
      { label: "Korean", value: "korean" },
      { label: "Swedish", value: "swedish" },
      { label: "Turkish", value: "turkish" },
      { label: "Hindi", value: "hindi" },
    ],
    defaultValue: "english",
  },
  //   output
  {
    name: "recognizeEntitiesInText",
    type: "switch",
    label: "recognizeEntitiesInText",
    description: "The recognized entities",
    defaultValue: true,
  },
];

const recognizeEntitiesInTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["textToRecognizeFrom"], ["entityType"], ["languages"]],
  },
  {
    title: "Output",
    formFieldKeys: [["recognizeEntitiesInText"]],
  },
];
const recognizeEntitiesInTextFieldsToWatch: string[] = [];

const recognizeEntitiesInText: ActivityConfig = {
  fieldList: recognizeEntitiesInTextFieldList,
  fieldCategories: recognizeEntitiesInTextFieldCategories,
  fieldsToWatch: recognizeEntitiesInTextFieldsToWatch,
};

export default recognizeEntitiesInText;
