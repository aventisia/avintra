The **Agent Risk Registry** page is where you assess, review, and govern the AI agents published in your workspace. It gives you a single view of each agent's composite risk tier, lifecycle status, and any open issues, so your team can keep AI usage aligned with your risk and compliance policies.

## Purpose

Use this page to:

- See the **composite risk tier** of every published agent at a glance.
- **Assess** an agent through a guided six-step wizard.
- Track an agent's **lifecycle status** from assessment through to approval and monitoring.
- Log and manage **issues** (risks, defects, or exceptions) tied to a specific agent.

## The registry table

The page opens with the Agent Risk Registry table. It lists agents with these columns:

- **Agent Name** — the published agent. Click the name (with its version badge, e.g. `v3`) to open that agent's risk assessment wizard.
- **Composite Risk Tier** — the overall risk level (**Low**, **Medium**, or **High**) computed from the agent's risk sub-scores.
- **Status** — the lifecycle status of the agent's assessment (see below).
- **Open Issues** — the number of open issues attached to the agent.
- **Reviewed On** — the date the assessment was last reviewed.
- **Approved On** — the date the assessment was approved.

Each row also has an **Issues** action (the alert icon) that opens that agent's issues register.

> A banner appears at the top when assessments are **awaiting your approval**, with a **Review** link to jump straight to the first pending item.

## Risk tiers

A tier is a **composite** of four driving sub-scores (each rated 1–5):

- **Scope** — how broad the agent's reach is.
- **Data sensitivity** — the sensitivity of the data the agent touches.
- **Dependency complexity** — how complex the agent's dependencies are.
- **Supervisory impact** — the degree of human oversight required.

The composite tier is the **maximum** of these four sub-scores — a low score on one factor never dilutes a high score on another (there is no averaging):

- **Low** — eligible for standard review.
- **Medium** — eligible for delegated review, subject to periodic reporting.
- **High** — requires elevated review and approval, subject to enhanced monitoring.

## Lifecycle statuses

Each agent's assessment moves through a lifecycle:

- **Not Assessed** — no assessment has been started yet.
- **In Assessment** — the assessment is being filled in.
- **Submitted** — the assessment has been submitted for review.
- **In Review** — the assessment is under review.
- **Approved** — the assessment is approved.
- **Approved w/ Exceptions** — approved with exceptions recorded.
- **Monitored** — the agent is live and being monitored.
- **Action Required** — an action is needed on the agent.
- **Retired** — the agent/assessment has been retired.

## Assessing an agent (the wizard)

Clicking an **Agent Name** opens a guided **Agent Risk Registry wizard** with six steps, shown in a stepper on the left:

1. **Agent Identity** — the agent's baseline identity.
2. **Risk Tiering** — set the four sub-scores to compute the composite tier and review the tier rationale.
3. **Risks & Mitigations** — record risks and their mitigations in the risk register. Each risk's severity is derived from its **likelihood × impact** using a 5×5 matrix (**Critical**, **High**, **Medium**, or **Low**).
4. **AI Models Used** — the AI models the agent depends on.
5. **Third-Party Tools Used** — the external tools the agent uses.
6. **Validation & Approval** — final validation, review dates, and approval.

You can move through the steps with the footer navigation. The wizard validates the mandatory fields for the current step, and validates **all** mandatory fields across every section before you finalize the last step. Work in progress is preserved in memory, so if you navigate away and return to the agent, the form keeps its data.

## Issues

The **Issues** view is a register of open items for a selected agent. Each issue tracks:

- **Status** — `Open`, `Investigating`, `Resolved`, or `Won't Fix`.
- **Category** — `Model Output`, `Data`, `Security`, `Compliance`, `Operational`, or `Other`.
- **Severity** — computed from the issue's likelihood and impact.

Use this register to log concerns during assessment and follow them through to resolution.
