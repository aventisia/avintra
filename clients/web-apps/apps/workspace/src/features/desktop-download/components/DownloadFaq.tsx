import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@avplatform/ui/accordion";

const QUESTIONS = [
  {
    id: "difference",
    question: "How is the Runner app different from the Desktop app?",
    answer:
      "The Desktop app is the builder you use to create, edit and test agents. The Runner app is a Windows service with no window that runs published agents in the background, so they keep running when the builder is closed.",
  },
  {
    id: "both",
    question: "Do I need both apps?",
    answer:
      "No. Install the Desktop app on the machines where people build agents, and the Runner app on the machines that should run published agents unattended.",
  },
  {
    id: "api-key",
    question: "Where do I get an API key?",
    answer:
      "Someone with the Orchestrator manager role can create one under Operations › API keys. Give it the Machine authentication permission.",
  },
  {
    id: "platforms",
    question: "When will macOS and Linux be supported?",
    answer:
      "We are testing macOS and Linux builds now. They will appear on this page as soon as they are ready.",
  },
];

export const DownloadFaq = () => (
  <section className="grid gap-6 border-t border-line pt-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
    <div>
      <h2 className="text-heading text-ink">Questions</h2>
      <p className="mt-1.5 text-body-sm text-muted-foreground">
        The things people usually ask before installing.
      </p>
    </div>
    <Accordion type="single" collapsible className="divide-y divide-line border-y border-line">
      {QUESTIONS.map(({ id, question, answer }) => (
        <AccordionItem key={id} value={id}>
          <AccordionTrigger className="text-body-sm font-medium text-ink">
            {question}
          </AccordionTrigger>
          <AccordionContent className="text-body-sm text-muted-foreground">
            {answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </section>
);
