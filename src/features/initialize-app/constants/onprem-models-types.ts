import icon1 from "../components/template/assets/file_1.svg";

export const onPremModelTypes = [
  {
    id: window.crypto.randomUUID(),
    name: "Inferencing Model",
    type: "inferencing",
    model: "Gemma 3",
    description:
      "The Inferencing Model is designed to enable decision-making logic within agents.",
    icon: icon1,
  },
  {
    id: window.crypto.randomUUID(),
    name: "Conversational Model",
    type: "conversational",
    model: "Gemma 3",
    description:
      "How an AI agent manages dialogue with users storing the context, message history, user intents.",
    icon: icon1,
  },
  {
    id: window.crypto.randomUUID(),
    name: "Generative Model",
    type: "generative",
    model: "Gemma 3",
    description:
      "An AI agent to produce original content based on prompts, inputs, or context.",
    icon: icon1,
  },
];
