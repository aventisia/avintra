import { type ChatModelAdapter } from "@assistant-ui/react";

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

/** Dev-only model adapter that streams canned replies; a prompt containing "error" fails. */
export const chatLabAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    const lastPart = messages.at(-1)?.content.find((part) => part.type === "text");
    const prompt = lastPart?.type === "text" ? lastPart.text : "";

    await wait(900, abortSignal);
    if (/error/i.test(prompt))
      throw new Error("The model provider timed out. Try again in a moment.");

    let text = "";
    for (const chunk of pickReply(prompt).match(/[\s\S]{1,8}/g) ?? []) {
      text += chunk;
      yield { content: [{ type: "text", text }] };
      await wait(16, abortSignal);
    }
  },
};
