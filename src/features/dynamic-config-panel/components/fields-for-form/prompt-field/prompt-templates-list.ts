export const promptTemplatesList = [
  {
    id: window.crypto.randomUUID(),
    label: "Extraction",
    value: "ExtractionPrompt",
    description:
      "Identifies and pulls structured data from unstructured sources like documents or images",
  },
  {
    id: window.crypto.randomUUID(),
    label: "Classification",
    value: "ClassificationPrompt",
    description:
      "Analyzes input data such as text, images, or documents and assigns it to predefined categories or labels based on its content",
  },
  {
    id: window.crypto.randomUUID(),
    label: "Summarization",
    value: "SummarizationPrompt",
    description:
      "Condenses lengthy text or documents into concise summaries, capturing the essential information while preserving the original context and meaning",
  },
  {
    id: window.crypto.randomUUID(),
    label: "Sentiment Analytics",
    value: "SentimentAnalyticsPrompt",
    description:
      "Evaluates text to determine the underlying emotional tone - positive, negative, or neutral - helping uncover customer opinions, feedback trends, and behavioral insights",
  },
  {
    id: window.crypto.randomUUID(),
    label: "Questions and Answers",
    value: "QuestionAnswerPrompt",
    description:
      "Enables precise answers based on the content of documents, images, or data sources",
  },
];
