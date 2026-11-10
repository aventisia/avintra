import {
  type ChatModelAdapter,
  type ThreadAssistantMessagePart,
  type ThreadMessage,
} from "@assistant-ui/react";
import {
  type NormalizedChatFrame,
  createContentPartsBuilder,
  humanizeToolLabel,
} from "@avplatform/assistant-chat";

const MARKDOWN_REPLY = `Here's a quick plan for an **invoice-intake agent**:

1. **Watch** the shared inbox for new invoices.
2. **Extract** vendor, amount and due date with the document reader.
3. **Route** anything over $10,000 to a finance approver.

| Step | Tool | Typical time |
| --- | --- | ---: |
| Watch inbox | Email trigger | instant |
| Extract fields | \`extract_file_text\` | ~4 s |
| Approve | Approval queue | minutes |

> Approvals stay in the queue until someone acts, so nothing is paid twice.

Want me to [open the Flow builder](#) and start the draft?`;

const CODE_REPLY = `This webhook handler validates the signature before queuing the job:

\`\`\`ts
export async function handleWebhook(request: Request) {
  const signature = request.headers.get("x-signature");
  if (!signature || !(await isValidSignature(request, signature))) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = await request.json();
  await queue.enqueue("invoice.received", payload);
  return new Response(null, { status: 202 });
}
\`\`\`

Return \`202\` so the sender doesn't retry while the job is still running.`;

const LONG_REPLY = Array.from(
  { length: 8 },
  (_, index) =>
    `### Step ${index + 1}\n\nAgents work best when each step has one clear job, a defined input, and an output the next step can trust. Keep prompts short, give tools precise names, and log every decision so a reviewer can follow the run later without guessing what happened.`,
).join("\n\n");

const AGENT_REPLY = `Two of the three invoices are overdue. Here's the script I'd schedule to flag them each morning:

\`\`\`python
from datetime import date

def overdue(invoices: list[dict]) -> list[dict]:
    return [i for i in invoices if i["due"] < date.today() and not i["paid"]]
\`\`\`

It posts this payload to the finance channel:

\`\`\`json
{ "vendor": "Globex", "amount": 12400, "daysOverdue": 6 }
\`\`\`

I couldn't read **Finance 2026**: share the sheet with the Google connection and I'll reconcile the totals.`;

const toDeltas = (type: "reasoning" | "delta", text: string): NormalizedChatFrame[] =>
  (text.match(/[\s\S]{1,8}/g) ?? []).map((output) => ({ type, output }));

const AGENT_FRAMES: NormalizedChatFrame[] = [
  ...toDeltas(
    "reasoning",
    "The user wants overdue invoices. Search the invoices label first, then check the finance sheet for payment status.",
  ),
  { type: "skill", output: { name: "Invoice triage" } },
  {
    type: "tool_call",
    output: {
      tool_call_id: "lab-search",
      name: "gmail_search_messages",
      args: { query: "label:invoices newer_than:30d", max_results: 10 },
    },
  },
  {
    type: "tool_call",
    output: { tool_call_id: "lab-search", content: "3 messages: Acme, Globex, Initech" },
  },
  {
    type: "tool_call",
    output: {
      tool_call_id: "lab-sheet",
      name: "google_sheets_read_range",
      args: { spreadsheet: "Finance 2026", range: "A1:F40" },
    },
  },
  {
    type: "tool_call",
    output: {
      tool_call_id: "lab-sheet",
      content: "403: The spreadsheet isn't shared with this connection.",
      status: "error",
    },
  },
  ...toDeltas("delta", AGENT_REPLY),
];

const APPROVAL_FRAMES: NormalizedChatFrame[] = [
  ...toDeltas("reasoning", "Both actions leave the workspace, so each needs the user's approval."),
  {
    type: "approval_required",
    output: {
      tool_call_id: "lab-email",
      name: "gmail_send_email",
      args: { to: "ap@globex.com", subject: "Invoice INV-2291 is 6 days overdue" },
    },
  },
  {
    type: "approval_required",
    output: {
      tool_call_id: "lab-slack",
      name: "slack_post_message",
      args: { channel: "#finance", text: "Globex INV-2291 ($12,400) is overdue." },
    },
  },
];

const pickReply = (prompt: string) => {
  if (/code|webhook/i.test(prompt)) return CODE_REPLY;
  if (/long|scroll/i.test(prompt)) return LONG_REPLY;
  return MARKDOWN_REPLY;
};

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

const playFrames = async function* (frames: NormalizedChatFrame[], signal: AbortSignal) {
  const builder = createContentPartsBuilder();
  for (const frame of frames) {
    builder.apply(frame);
    yield builder.parts.map((part) => ({ ...part })) as ThreadAssistantMessagePart[];
    await wait(frame.type === "tool_call" || frame.type === "skill" ? 1100 : 20, signal);
  }
};

const summarizeDecisions = (content: ThreadMessage["content"]) => {
  const approved = content.flatMap((part) =>
    part.type === "tool-call" && part.approval?.approved ? [humanizeToolLabel(part.toolName)] : [],
  );
  if (approved.length === 0) return "Okay, I didn't send anything. The invoice is still overdue.";
  return `Done. ${approved.join(" and ")} ran, and I'll check for a reply tomorrow.`;
};

/**
 * Dev-only model adapter that streams canned replies. "agent" streams reasoning
 * and tool steps, "approve" pauses on two approvals, and "error" fails.
 */
export const chatLabAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal, unstable_getMessage }) {
    const resumed = unstable_getMessage?.().content ?? [];
    if (
      resumed.some((part) => part.type === "tool-call" && part.approval?.approved !== undefined)
    ) {
      for await (const content of playFrames(
        toDeltas("delta", summarizeDecisions(resumed)),
        abortSignal,
      ))
        yield { content };
      return;
    }

    const lastPart = messages.at(-1)?.content.find((part) => part.type === "text");
    const prompt = lastPart?.type === "text" ? lastPart.text : "";

    await wait(900, abortSignal);
    if (/error/i.test(prompt))
      throw new Error("The model provider timed out. Try again in a moment.");

    if (/agent|tool|approv/i.test(prompt)) {
      const isApproval = /approv/i.test(prompt);
      let content: ThreadAssistantMessagePart[] = [];
      for await (content of playFrames(isApproval ? APPROVAL_FRAMES : AGENT_FRAMES, abortSignal))
        yield { content };
      if (isApproval) yield { content, status: { type: "requires-action", reason: "tool-calls" } };
      return;
    }

    let text = "";
    for (const chunk of pickReply(prompt).match(/[\s\S]{1,8}/g) ?? []) {
      text += chunk;
      yield { content: [{ type: "text", text }] };
      await wait(16, abortSignal);
    }
  },
};
