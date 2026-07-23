import parse from "html-react-parser";

import { sanitizeHtml } from "@/features/05-tenant-admin/support-tickets-table/utils/htmlSanitizer";

import AttachmentsSection from "./AttachmentSection";
import WorkflowTimeline from "./WorkflowTimeline";

export const EmailWorkItem = () => {
  const htmlString = `<div style=" padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;"><p style="margin: 0 0 16px 0; font-size: 12px;">Please review, verify or approve the following details:</p><ol style="margin: 0; padding-left: 16px; "><li style="margin-bottom: 8px;"><a href="#contact-persons" style="color: #9b87f5; text-decoration: underline; font-size: 12px;">Contact Persons</a></li><li style="margin-bottom: 8px;"><a href="#documents" style="color: #9b87f5; text-decoration: underline; font-size: 12px;">Documents</a></li><li style="margin-bottom: 8px;"><a href="#trade-partners" style="color: #9b87f5; text-decoration: underline; font-size: 12px;">Trade Partners</a></li></ol></div>`;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="w-full max-w-4xl rounded-lg border bg-accent p-2 text-sm">
        {parse(sanitizeHtml(htmlString))}
      </div>
      <AttachmentsSection />
      <WorkflowTimeline />
    </div>
  );
};
