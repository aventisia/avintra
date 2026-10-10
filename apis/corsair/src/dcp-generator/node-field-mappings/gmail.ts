/**
 * Gmail node field label/description mapping.
 *
 * Authored once (AI-assisted) and consumed by the Corsair config generator.
 * Field metadata is defined once per field and reused by every Gmail node that
 * uses it (e.g. `userId` and `q` appear in many nodes). Node-level overrides
 * only exist where a node needs different wording, including the node's own
 * (command) label/description.
 *
 * Descriptions are rendered as Markdown (see FieldHelpPopover), so examples are
 * wrapped in tilde code fences and lists are separated from prose by a blank line.
 */
import type { PluginNodeFieldMapping } from "./types.js";

export const gmailNodeFieldMapping: PluginNodeFieldMapping = {
  // --- Shared field definitions (single source across all Gmail nodes) ---
  fields: {
    userId: {
      label: "User",
      description: "Gmail user identifier. Use 'me' to act on the authenticated account.",
    },
    q: {
      label: "Search Query",
      description: `Gmail search query; supports Gmail search operators such as from:, subject:, is:unread, has:attachment and label:.

Reference: https://support.google.com/mail/answer/7190`,
    },
    maxResults: {
      label: "Max Results",
      description: "Maximum number of results to return per page (Gmail default 100, maximum 500).",
    },
    pageToken: {
      label: "Page Token",
      description: "Token used to retrieve the next page of results (returned by a previous call).",
    },
    labelIds: {
      label: "Labels",
      description: "Only return items that match all of the specified label IDs (e.g. INBOX, UNREAD).",
    },
    includeSpamTrash: {
      label: "Include Spam and Trash",
      description: "Include items from SPAM and TRASH in the results.",
    },
    id: {
      label: "ID",
      description: "Unique identifier of the message, thread, label or draft.",
    },
    format: {
      label: "Response Format",
      description: "How much of the resource to return: 'full', 'metadata', 'minimal' or 'raw'.",
    },
    metadataHeaders: {
      label: "Metadata Headers",
      description: "Only include these headers when format is 'metadata' (e.g. Subject, From, To).",
    },
    raw: {
      label: "Raw Message",
      description: `The full email message, encoded in Base64 — not as plain text. Gmail only accepts the encoded form.

How to fill this in: write the email as normal text (see the example below), then encode it to Base64 and paste the result here. You can do this with the "Convert Text to Base64" node and pass its "Base64 String" output into this field.

Rules for the email text you encode:

- Keep every line separated by CRLF (\`\\r\\n\`).
- Use URL-safe Base64: replace '+' with '-', '/' with '_', and remove trailing '=' padding. ("Convert Text to Base64" outputs standard Base64, so make these swaps when they appear.)
- At least one of To, Cc or Bcc is required.
- 'From' is optional; omit it to use the connected Gmail account.
- Plain text only: use 'Content-Type: text/plain' and omit the multipart wrapper.
- HTML or attachments: use 'multipart/mixed' (or 'multipart/alternative' for text + HTML) with a boundary, and base64-encode each binary part.

Example email with common headers and an attachment (encode this, then pass the result as 'raw'):

~~~
From: {{from}}
To: {{to}}
Cc: {{cc}}
Bcc: {{bcc}}
Reply-To: {{replyTo}}
Subject: {{subject}}
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="BOUNDARY"

--BOUNDARY
Content-Type: text/plain; charset="UTF-8"
Content-Transfer-Encoding: 7bit

{{body}}

--BOUNDARY
Content-Type: application/octet-stream; name="attachment.pdf"
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="attachment.pdf"

{{attachmentBase64}}

--BOUNDARY--
~~~

Reference: https://developers.google.com/workspace/gmail/api/guides/sending#send-messages`,
    },
    threadId: {
      label: "Thread ID",
      description: "ID of the Gmail thread to associate the message or draft with.",
    },
    addLabelIds: {
      label: "Add Labels",
      description: "Label IDs to add to the message or thread (system or user labels).",
    },
    removeLabelIds: {
      label: "Remove Labels",
      description: "Label IDs to remove from the message or thread (system or user labels).",
    },
    ids: {
      label: "Message IDs",
      description: "IDs of the messages to modify in bulk (maximum 1000 IDs per request).",
    },
    label: {
      label: "Label",
      description: `The label object to create or update.

Example:

~~~json
{
  "name": "{{labelName}}",
  "messageListVisibility": "show",
  "labelListVisibility": "labelShow",
  "color": { "textColor": "#ffffff", "backgroundColor": "#000000" }
}
~~~

Reference: https://developers.google.com/workspace/gmail/api/guides/labels`,
    },
    draft: {
      label: "Draft",
      description: `The draft object to create or update (wraps a message).

Example:

~~~json
{
  "message": { "raw": "<base64url-encoded RFC 2822 email>" }
}
~~~

The nested message.raw follows the same rules as the 'raw' message field.

Reference: https://developers.google.com/workspace/gmail/api/guides/drafts`,
    },
    message: {
      label: "Message",
      description: `Optional message body used when sending without a draft ID. Same rules and format as the 'raw' message field; leave empty when sending an existing draft by its ID.

Reference: https://developers.google.com/workspace/gmail/api/guides/sending#send-messages`,
    },
  },

  // --- Node-level overrides ---
  // Only where Corsair's own text is poor (e.g. bracketed mojibake) or a node
  // needs field wording different from the shared definition.
  nodeOverrides: {
    "Corsair/Gmail/ThreadsGetConnector": {
      // threads.get does not support the 'raw' format (unlike messages.get/drafts.get).
      fields: {
        format: {
          label: "Response Format",
          description:
            "How much of each message in the thread to return: 'full', 'metadata' or 'minimal'. ('raw' is not supported for threads.)",
        },
      },
    },
    "Corsair/Gmail/MessagesDeleteConnector": {
      description: "Permanently delete a message. This cannot be undone.",
    },
    "Corsair/Gmail/LabelsDeleteConnector": {
      description: "Delete a label. This cannot be undone.",
    },
    "Corsair/Gmail/DraftsDeleteConnector": {
      description: "Delete a draft. This cannot be undone.",
    },
    "Corsair/Gmail/ThreadsDeleteConnector": {
      description: "Permanently delete a thread. This cannot be undone.",
    },
  },
};
