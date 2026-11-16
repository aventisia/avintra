/** Compact API reference for the runtime kit, embedded in the framework system prompt. */
export const UI_BUILDER_KIT_REFERENCE = `Runtime kit (globals, no imports): UI, Charts, Icons. Prefer these components over hand-written equivalents; they are accessible, themed, and handle states.
Layout:
- <UI.AppShell brand nav={[{label, value, icon:"LayoutDashboard", badge}]} activeNav onNavigate={v=>...} topbar sidebarFooter>…</UI.AppShell> (only for multi-view apps)
- Multi-view apps: const [view, setView] = UI.useRoute("overview"); pass activeNav={view} onNavigate={setView} and render one view component per route (views live in the URL hash). Declare each view as its own component above the default export.
- <UI.Page width="xl|lg|md|full"> page container; <UI.PageHeader title description actions breadcrumbs={["Ops","Claims"]}/> renders the h1
- <UI.Section title description actions>…</UI.Section> (h2); <UI.Card>, <UI.CardHeader title description icon actions/>, <UI.CardContent>, <UI.CardFooter>
- <UI.StatGrid><UI.Stat label value delta={12.5} deltaLabel="vs last week" invertDelta icon="Clock" tone formula="…" loading/></UI.StatGrid>
- <UI.DescriptionList items={[{label, value}]} columns={2}/>, <UI.Timeline items={[{title, time, description, icon, tone}]}/>, <UI.Stepper steps={["Details","Review"]} current={0}/>
- <UI.Board columns={[{value:"Pending", title:"Pending"}]} items columnOf={item=>item.status} renderCard={item=>…} onMove={(item,to)=>…}/> kanban
Data:
- <UI.DataTable columns={[{key:"data.customer", header:"Customer", sortable:true}, {key:"data.amount", header:"Amount", align:"right", render:r=>UI.format.currency(r.data.amount)}, {key:"status", header:"Status", render:r=><UI.StatusBadge status={r.status}/>}]} rows rowKey="id" loading error onRetry emptyTitle emptyDescription emptyAction pageSize={10} onRowClick selectable onSelectionChange toolbar={<>…filters…</>} caption/>
  keys are dot paths; cells do not wrap unless the column sets wrap:true (use it for long text); sorting, pagination, skeletons, and empty/error states are built in.
- <UI.Badge tone="neutral|primary|success|warning|danger|info" dot icon>…</UI.Badge>, <UI.StatusBadge status="InProgress"/>, <UI.Avatar name src size/>, <UI.Progress value max label tone showValue/>
- UI.format.number(v, decimals) .compact(v) .currency(v, "USD") .percent(fraction) .date(v) .dateTime(v) .relative(v) .duration(ms); UI.getPath(obj, "a.b"); UI.cn(...classes)
Forms (labels are required and rendered for you):
- <UI.Input label hint error icon="Mail" hideLabel …inputProps/>, <UI.Textarea label …/>, <UI.Select label options={["A","B"] or [{value,label}]} value onValueChange placeholder/>
- <UI.Checkbox label description checked onCheckedChange/>, <UI.Switch label checked onCheckedChange/>, <UI.RadioGroup label options value onValueChange orientation/>
- <UI.SearchInput value onValueChange placeholder/>, <UI.Segmented label options value onValueChange size/>, <UI.DateRange value={{from,to}} onValueChange/>, <UI.FormGrid columns={2}>…</UI.FormGrid>
- <UI.Button variant="primary|secondary|outline|ghost|destructive|link" size="sm|md|lg|icon|icon-sm" icon="Plus" iconRight loading aria-label(for icon-only)/>
Overlays:
- <UI.Dialog open onOpenChange><UI.DialogTrigger asChild><UI.Button/></UI.DialogTrigger><UI.DialogContent title description size="sm|md|lg|xl">…<UI.DialogFooter>…</UI.DialogFooter></UI.DialogContent></UI.Dialog>
- <UI.Sheet open onOpenChange><UI.SheetContent title description side="right" footer>…</UI.SheetContent></UI.Sheet> for record details and filters
- <UI.DropdownMenu><UI.DropdownMenuTrigger asChild>…</UI.DropdownMenuTrigger><UI.DropdownMenuContent><UI.DropdownMenuLabel/><UI.DropdownMenuItem icon onSelect destructive/><UI.DropdownMenuSeparator/></UI.DropdownMenuContent></UI.DropdownMenu>
- <UI.Popover>/<UI.PopoverTrigger asChild>/<UI.PopoverContent align>, <UI.Tooltip content="…"><button…/></UI.Tooltip>, <UI.InfoHint formula="…"/>
- <UI.Tabs defaultValue="a"><UI.TabsList><UI.TabsTrigger value="a">…</UI.TabsTrigger></UI.TabsList><UI.TabsContent value="a">…</UI.TabsContent></UI.Tabs>
- <UI.Accordion><UI.AccordionItem value title>…</UI.AccordionItem></UI.Accordion>
Feedback: <UI.Alert tone title action>…</UI.Alert>, <UI.EmptyState icon title description action/>, <UI.Skeleton className="h-4 w-32"/>, <UI.Spinner/>, UI.toast.success("Saved") / .error / .info (no provider needed), <UI.Separator/>, <UI.Kbd>⌘K</UI.Kbd>
Charts (rows straight from query results; colors come from the theme):
- <Charts.BarChart data x="month" y={["approved","rejected"]} stacked horizontal height valueFormat={UI.format.compact} xFormat/>
- <Charts.LineChart data x="day" y="count" area/>, <Charts.AreaChart …/>, <Charts.DonutChart data label="status" value="count" centerLabel="Items"/> (status labels get status colors; colorByStatus overrides), <Charts.Sparkline data={[3,5,4]}/>
  y may be [{key:"a", label:"Approved"}]; dates on x are formatted automatically; loading and empty states are built in.
Icons: any lucide icon by PascalCase name, static only: <Icons.Search size={16} className="text-muted-foreground"/>; components take icon="Name" strings.
Theme tokens (Tailwind v4 utilities): bg-background text-foreground bg-card bg-muted text-muted-foreground bg-primary text-primary-foreground bg-secondary bg-accent border-border border-input ring-ring text-destructive text-success text-warning text-info bg-chart-1…6, with opacity modifiers like bg-primary/10. Any standard Tailwind v4 utility works; avoid hard-coded palette colors for themed surfaces.`;
