import { ModelSetupDto } from "../dtos/model-setup-dto";

// ✅ Transformer Function
export function transformModelResponse(data: ModelSetupDto) {
  switch (data?.type) {
    case "Summarization":
      return {
        summary: "",
      };

    case "Classification":
    case "SentimentAnalytics":
      return {
        categories: data?.categories
          ? data?.categories.map((c) => ({
              index: +c.index,
              name: c.name,
              value: "",
            }))
          : [],
      };

    case "QuestionAnswer":
      return {
        questionAnswers: data?.questionAnswers
          ? data?.questionAnswers.map((q) => ({
              index: +q.index,
              question: q.name,
              answer: "",
            }))
          : [],
      };

    case "Extraction":
      return {
        fields: data?.fields
          ? data?.fields.map((f) => ({
              index: +f.index,
              name: f.name,
              value: "",
            }))
          : [],
        table: [],
      };

    default:
      return {};
  }
}
