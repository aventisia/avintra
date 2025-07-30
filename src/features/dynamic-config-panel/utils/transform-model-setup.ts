import { ModelSetupDto } from "@/features/call-model/dtos/model-setup-dto";

export function transformModelResponse(data: ModelSetupDto) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};

  if (data?.summarization?.setupObject) {
    result.summarization = {
      summary: "",
      ...data.summarization.setupObject,
    };
  }

  if (data?.classification?.setupObject?.categories) {
    result.classification = {
      categories: data.classification.setupObject.categories.map((c) => ({
        index: +c.index || 0,
        name: c.name,
        value: "",
      })),
    };
  }

  if (data?.sentimentAnalytics?.setupObject?.categories) {
    result.sentimentAnalytics = {
      categories: data.sentimentAnalytics.setupObject.categories.map((c) => ({
        index: +c.index || 0,
        name: c.name,
        value: "",
      })),
    };
  }

  if (data?.questionAnswer?.setupObject?.questionAnswers) {
    result.questionAnswer = {
      questionAnswers: data.questionAnswer.setupObject.questionAnswers.map(
        (q) => ({
          index: +q.index || 0,
          question: q.name,
          answer: "",
        }),
      ),
    };
  }

  if (data?.extraction?.setupObject?.fields) {
    result.extraction = {
      fields: data.extraction.setupObject.fields.map((f) => ({
        index: +f.index || 0,
        name: f.name,
        value: "",
      })),
      table: [],
    };
  }

  return result;
}
