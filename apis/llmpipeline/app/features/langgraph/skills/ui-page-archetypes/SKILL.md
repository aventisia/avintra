---
name: ui-page-archetypes
description: Reference compositions for UI builder pages built on the runtime kit - work list with detail sheet, KPI dashboard, multi-step form, kanban board, inbox, record detail, and settings.
providers: []
license:
  name: MIT
  url: https://opensource.org/licenses/MIT
  terms: ""
references:
  - title: ui-page-archetypes Skill Source
    url: ./
    type: source
tags:
  - design
  - ui
  - templates
---

# UI Page Archetypes

Applied when the UI builder drafts a new interface. Most internal pages are one of the
archetypes below. Pick the closest one (the plan names it), keep its structure, and adapt the
domain, fields, and actions to the request. Each reference is complete, builds cleanly, and
passes the accessibility checks; the sample constants stand in for data. When a queue is
connected, replace them with `Avintra.useQueue` / `Avintra.useQueueQuery` results as the data
instructions describe.

## Work list with detail sheet (review, triage, approvals)

Searchable, filterable table; clicking a row opens a sheet with the record and its actions.

```jsx
const INVOICES = [
  { id: "inv-1042", status: "Pending", createdOn: "2026-10-18T09:12:00Z", data: { vendor: "Acme Supplies", amount: 4820, dueDate: "2026-10-30", owner: "Dana Lee" } },
  { id: "inv-1043", status: "InProgress", createdOn: "2026-10-17T14:03:00Z", data: { vendor: "Globex Logistics", amount: 12990, dueDate: "2026-10-25", owner: "Sam Ortiz" } },
];

export default function InvoiceQueue() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [selected, setSelected] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const rows = INVOICES.filter(
    (row) =>
      (status === "all" || row.status === status) &&
      row.data.vendor.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const approve = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSaving(false);
    setSelected(null);
    UI.toast.success("Invoice approved", `${selected.data.vendor} · ${UI.format.currency(selected.data.amount)}`);
  };

  return (
    <main>
      <UI.Page>
        <UI.PageHeader
          title="Invoice review"
          description="Approve or return supplier invoices before they are paid."
          actions={<UI.Button icon="Download" variant="outline">Export</UI.Button>}
        />
        <UI.DataTable
          caption="Invoices awaiting review"
          rows={rows}
          onRowClick={setSelected}
          emptyTitle="No invoices match"
          emptyDescription="Clear the search or pick another status."
          toolbar={
            <>
              <UI.SearchInput value={query} onValueChange={setQuery} placeholder="Search vendors" />
              <UI.Segmented label="Status" size="sm" value={status} onValueChange={setStatus}
                options={[{ value: "all", label: "All" }, { value: "Pending", label: "Pending" }, { value: "InProgress", label: "In review" }]} />
            </>
          }
          columns={[
            { key: "data.vendor", header: "Vendor", sortable: true },
            { key: "data.owner", header: "Owner" },
            { key: "data.amount", header: "Amount", align: "right", sortable: true, render: (row) => UI.format.currency(row.data.amount) },
            { key: "data.dueDate", header: "Due", sortable: true, render: (row) => UI.format.date(row.data.dueDate) },
            { key: "status", header: "Status", render: (row) => <UI.StatusBadge status={row.status} /> },
          ]}
        />
        <UI.Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
          {selected && (
            <UI.SheetContent
              title={selected.data.vendor}
              description={`Invoice ${selected.id}`}
              footer={
                <>
                  <UI.Button variant="outline" onClick={() => setSelected(null)}>Return to vendor</UI.Button>
                  <UI.Button icon="Check" loading={saving} onClick={approve}>Approve</UI.Button>
                </>
              }
            >
              <UI.DescriptionList
                columns={1}
                items={[
                  { label: "Amount", value: UI.format.currency(selected.data.amount) },
                  { label: "Due", value: UI.format.date(selected.data.dueDate) },
                  { label: "Owner", value: selected.data.owner },
                  { label: "Status", value: <UI.StatusBadge status={selected.status} /> },
                ]}
              />
            </UI.SheetContent>
          )}
        </UI.Sheet>
      </UI.Page>
    </main>
  );
}
```

## KPI dashboard (monitoring, management overview)

Header range filter, KPI tiles with deltas and formulas, a wide trend chart beside a breakdown.

```jsx
const KPIS = { received: 1284, resolved: 1102, avgHours: 5.4, breaches: 12 };
const TREND = [
  { day: "2026-10-13", received: 180, resolved: 162 }, { day: "2026-10-14", received: 204, resolved: 190 },
  { day: "2026-10-15", received: 176, resolved: 171 }, { day: "2026-10-16", received: 221, resolved: 198 },
];
const BY_CHANNEL = [{ channel: "Email", total: 612 }, { channel: "Portal", total: 401 }, { channel: "Phone", total: 271 }];

export default function SupportOverview() {
  const [range, setRange] = React.useState("30d");
  const resolutionRate = KPIS.resolved / KPIS.received;
  return (
    <main>
      <UI.Page>
        <UI.PageHeader
          title="Support overview"
          description="Volume, speed, and SLA health for the last 30 days."
          actions={<UI.Segmented label="Date range" value={range} onValueChange={setRange}
            options={[{ value: "7d", label: "7 days" }, { value: "30d", label: "30 days" }, { value: "90d", label: "90 days" }]} />}
        />
        <UI.StatGrid>
          <UI.Stat label="Tickets received" value={UI.format.number(KPIS.received)} icon="Inbox" delta={6.3} deltaLabel="vs previous period" formula="Count of tickets created in the selected range" />
          <UI.Stat label="Resolution rate" value={UI.format.percent(resolutionRate)} icon="CheckCircle2" tone="success" formula="Resolved tickets ÷ tickets received" />
          <UI.Stat label="Avg. first response" value={`${UI.format.number(KPIS.avgHours, 1)} h`} icon="Clock" tone="info" delta={-8} invertDelta deltaLabel="faster" />
          <UI.Stat label="SLA breaches" value={KPIS.breaches} icon="AlertTriangle" tone="warning" />
        </UI.StatGrid>
        <div className="grid gap-4 lg:grid-cols-3">
          <UI.Card className="lg:col-span-2">
            <UI.CardHeader title="Received vs resolved" description="Daily ticket flow" actions={<UI.InfoHint formula="Tickets per calendar day by created date and resolved date" />} />
            <UI.CardContent>
              <Charts.AreaChart data={TREND} x="day" y={[{ key: "received", label: "Received" }, { key: "resolved", label: "Resolved" }]} />
            </UI.CardContent>
          </UI.Card>
          <UI.Card>
            <UI.CardHeader title="By channel" />
            <UI.CardContent>
              <Charts.DonutChart data={BY_CHANNEL} label="channel" value="total" centerLabel="Tickets" />
            </UI.CardContent>
          </UI.Card>
        </div>
      </UI.Page>
    </main>
  );
}
```

## Multi-step form (intake, requests, onboarding)

Stepper, per-step validation with inline errors, a review step, and submit feedback.

```jsx
const STEPS = ["Requester", "Request", "Review"];

export default function AccessRequest() {
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({ name: "", email: "", system: "", reason: "", urgent: false });
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);
  const set = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));

  const validate = () => {
    const next = {};
    if (step === 0 && !form.name.trim()) next.name = "Enter the requester's full name.";
    if (step === 0 && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid work email.";
    if (step === 1 && !form.system) next.system = "Choose the system to access.";
    if (step === 1 && form.reason.trim().length < 10) next.reason = "Describe the business reason in a sentence or two.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitting(false);
    UI.toast.success("Request submitted", "IT will review it within one business day.");
    setStep(0);
  };

  return (
    <main>
      <UI.Page width="md">
        <UI.PageHeader title="Request system access" description="Takes about two minutes. IT reviews requests every business day." />
        <UI.Card>
          <UI.CardContent className="space-y-6 pt-5">
            <UI.Stepper steps={STEPS} current={step} />
            {step === 0 && (
              <UI.FormGrid>
                <UI.Input label="Full name" required value={form.name} onChange={(event) => set("name")(event.target.value)} error={errors.name} />
                <UI.Input label="Work email" type="email" required icon="Mail" placeholder="name@company.com" value={form.email} onChange={(event) => set("email")(event.target.value)} error={errors.email} />
              </UI.FormGrid>
            )}
            {step === 1 && (
              <div className="space-y-4">
                <UI.Select label="System" required placeholder="Choose a system" options={["Salesforce", "SAP Finance", "Workday", "Jira"]} value={form.system} onValueChange={set("system")} error={errors.system} />
                <UI.Textarea label="Business reason" required value={form.reason} onChange={(event) => set("reason")(event.target.value)} error={errors.reason} hint="Mention the project or task that needs this access." />
                <UI.Switch label="Urgent" description="Needed within 24 hours" checked={form.urgent} onCheckedChange={set("urgent")} />
              </div>
            )}
            {step === 2 && (
              <UI.DescriptionList items={[
                { label: "Requester", value: form.name }, { label: "Email", value: form.email },
                { label: "System", value: form.system }, { label: "Urgent", value: form.urgent ? "Yes" : "No" },
                { label: "Reason", value: form.reason },
              ]} />
            )}
          </UI.CardContent>
          <UI.CardFooter className="justify-between">
            <UI.Button variant="ghost" icon="ChevronLeft" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</UI.Button>
            {step < STEPS.length - 1 ? (
              <UI.Button iconRight="ChevronRight" onClick={() => validate() && setStep(step + 1)}>Continue</UI.Button>
            ) : (
              <UI.Button icon="Send" loading={submitting} onClick={submit}>Submit request</UI.Button>
            )}
          </UI.CardFooter>
        </UI.Card>
      </UI.Page>
    </main>
  );
}
```

## Kanban board (pipelines, stage-based work)

Columns per status with drag and drop plus an accessible Move to control.

```jsx
const COLUMNS = [
  { value: "Pending", title: "New" }, { value: "InProgress", title: "In progress" },
  { value: "Approved", title: "Approved" }, { value: "Rejected", title: "Rejected" },
];

export default function OnboardingBoard() {
  const [items, setItems] = React.useState([
    { id: "a1", status: "Pending", data: { company: "Bluebird Bakery", owner: "Mia Chen", value: 4200 } },
    { id: "a2", status: "InProgress", data: { company: "Harbor Freight Co", owner: "Ravi Kumar", value: 18500 } },
  ]);
  const move = (item, status) => {
    setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, status } : entry)));
    UI.toast.info(`${item.data.company} moved to ${COLUMNS.find((column) => column.value === status).title}`);
  };
  return (
    <main>
      <UI.Page width="full">
        <UI.PageHeader title="Merchant onboarding" description="Drag applications between stages or use Move to." />
        <UI.Board
          columns={COLUMNS}
          items={items}
          columnOf={(item) => item.status}
          onMove={move}
          renderCard={(item) => (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-foreground">{item.data.company}</p>
                <span className="text-xs text-muted-foreground tabular-nums">{UI.format.currency(item.data.value, "USD", 0)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <UI.Avatar name={item.data.owner} size="sm" />
                {item.data.owner}
              </div>
            </>
          )}
        />
      </UI.Page>
    </main>
  );
}
```

## Other archetypes

- **Inbox / master-detail:** `grid lg:grid-cols-[22rem_1fr]` with a scrollable list of
  `UI.Card` rows on the left (selected row `ring-2 ring-primary`) and the record with actions on
  the right; on small screens show the detail in a `UI.Sheet`.
- **Record detail:** `UI.PageHeader` with status badge and actions, `UI.Tabs` for Overview /
  Activity / Documents, `UI.DescriptionList` in a card, `UI.Timeline` for history.
- **Settings:** `UI.Page width="md"`, one `UI.Card` per group with `UI.Switch` and form fields,
  and a sticky footer save bar that appears only when something changed.
- **Multi-view app:** `const [view, setView] = UI.useRoute("overview")`, then
  `<UI.AppShell nav={...} activeNav={view} onNavigate={setView}>` rendering one view component per
  route (`{view === "claims" && <ClaimsView />}`). Declare each view as its own component above the
  default export and share data hooks at the top level so switching views does not refetch.
