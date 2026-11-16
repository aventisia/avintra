import { Badge } from "@avplatform/ui/badge";

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 px-3.5 py-2.5 text-[13px]">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="text-ink">{children}</dd>
  </div>
);

const ConnectedIntegrationDialogContent = ({ description }: { description: string }) => (
  <div className="space-y-4">
    <p className="text-[13px] leading-5 text-ink-2">{description}</p>
    <dl className="divide-y divide-line rounded-md bg-sunken/80 ring-1 ring-line">
      <DetailRow label="Connection status">
        <Badge variant="completed">Connected</Badge>
      </DetailRow>
      <DetailRow label="Last sync">14/02/2025</DetailRow>
      <DetailRow label="Date connected">14/07/2024</DetailRow>
      <DetailRow label="Agents connected">
        <span className="text-primary underline">10</span>
      </DetailRow>
    </dl>
  </div>
);

export default ConnectedIntegrationDialogContent;
