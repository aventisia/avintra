<h1 align="center">Avintra</h1>

<p align="center"><strong>Build, run and govern AI agents that do real work in enterprise workflows.</strong></p>

<p align="center">
  AI agents, deterministic workflows and desktop automation in one self-hostable platform,<br>
  with human approvals and a full trace on every run.
</p>

<p align="center">
  <a href="https://www.aventisia.com/avintra/">Website</a> ·
  <a href="https://docs.aventisia.com">Docs</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="https://avintra.aventisia.com/accounts/create-account">Try Avintra Cloud free</a> ·
  <a href="https://github.com/aventisia/avintra/discussions">Discussions</a>
</p>

<p align="center">
  <a href="LICENSE"><img alt="License: Avintra Community License" src="https://img.shields.io/badge/license-Avintra%20Community%20(source--available)-blue"></a>
  <img alt=".NET 8" src="https://img.shields.io/badge/.NET-8-512BD4">
  <a href="https://github.com/aventisia/avintra/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/aventisia/avintra?style=social"></a>
</p>

<!-- Suggested: add a screenshot or short GIF of the Agent Builder canvas here, e.g. docs/assets/agent-builder.png -->

## Why Avintra

- **Agentic or deterministic, per process.** Let the model plan and route for conversational work, or keep a fixed workflow in control and call AI only where judgment is needed, for regulated processes.
- **Reaches legacy systems.** The Runner automates desktop and browser apps that have no API, next to 500+ app integrations and MCP tools.
- **Governed by default.** Human approval steps, a credential vault, role-based access, and a recorded trace of every run: trigger, model, outputs and approvals.
- **Your models, your infrastructure.** Bring your own keys (OpenAI, Anthropic, Google Gemini, OpenRouter, DeepInfra) or run local models with Ollama, and self-host on your own machines.
- **Pay for runtime, not seats.** On [Avintra Cloud](https://www.aventisia.com/pricing/), usage is billed by execution time, with unlimited users and agents. The Community edition is free to self-host.

## How Avintra compares

| | Avintra | n8n | Dify | UiPath | Power Automate |
| --- | :---: | :---: | :---: | :---: | :---: |
| AI agents | ✅ | ✅ | ✅ | ✅ | Via Copilot Studio |
| Deterministic workflows | ✅ | ✅ | ✅ | ✅ | ✅ |
| Desktop and browser automation (RPA) | ✅ | ❌ | ❌ | ✅ | ✅ |
| Free self-hosted edition | ✅ | ✅ | ✅ | ❌ | ❌ |
| Bring your own models, incl. local | ✅ | ✅ | ✅ | Paid tiers | Azure AI models |
| Pricing unit | Execution time | Workflow executions | Workspace plans | Platform units or robot and user licenses | Per user and per bot |

Based on public product information as of November 2026; check each vendor's current documentation. More detail: [platform comparison](https://www.aventisia.com/resources/#compare).

## What is Avintra?

Avintra is a platform for building AI agents and workflow automations that run real business processes in finance, tax, HR, IT and operations. AI steps run next to deterministic logic, desktop and browser automation, and app integrations, and every run is recorded, so teams can trust what goes into production.

- **Agent Builder**: a visual canvas of triggers, nodes and paths, with templates, sub-agents, loops and routers
- **Triggers**: schedules, webhooks, email and messages
- **AI nodes**: Text AI, speech-to-text and text-to-speech, with your own model providers (OpenAI, Anthropic, Google Gemini, OpenRouter, DeepInfra, Ollama)
- **Knowledge bases** for retrieval over your own documents, plus reusable **Skills** and **Tools** that call external APIs
- **App integrations**: Microsoft 365 (Outlook, SharePoint), Google Workspace, AWS, Azure, Excel, Word, PDF, Twilio, SendGrid, HTTP, FTP and more
- **Desktop and browser automation** (RPA) through the Runner on your own machines
- **Orchestrator**: machines, queues, triggers, executions, a credential vault and a config store
- **Run history** for every execution and job, with usage tracking

## Quick start

Avintra runs from source today.

Requirements: .NET 8 SDK, Node.js 22+ with npm, Python 3.12+.

```bash
git clone https://github.com/aventisia/avintra.git
cd avintra
./scripts/initial-setup.sh   # once; initial-setup.ps1 on Windows
dekit up                     # start every service
```

Then open the Accounts app at http://localhost:3001 and sign in. Setup details: [DEVELOPMENT.md](DEVELOPMENT.md). Product docs: https://docs.aventisia.com

The Desktop App and Runner run on Windows 10 and 11, macOS and Linux (x64). Desktop and browser automation, and the desktop Excel and Word nodes, need Windows.

## Use cases

| Area | Example workflow |
| --- | --- |
| Finance | Invoice extraction, three-way matching, approval routing |
| HR | Employee onboarding across HRIS, IT and payroll |
| IT | Ticket triage, access requests, incident summaries |
| Operations | Vendor onboarding, document review, reporting |

## Community vs. Enterprise

| | Community | Enterprise |
| --- | :---: | :---: |
| Agent Builder and Orchestrator | ✅ | ✅ |
| App integrations, AI nodes, knowledge bases | ✅ | ✅ |
| Self-hosting | ✅ | ✅ |
| Spaces | 1 | Multiple |
| Run history retention | 1 day | 365 days (unlimited with a Commercial License) |
| Custom branding | ❌ | When enabled for your license |
| SSO with Microsoft Entra ID | ❌ | When enabled for your license |
| Full audit logs and governance | Basic | ✅ |
| Multi-tenancy | ❌ | With a Commercial License |
| Support | Community | Dedicated, with SLA |
| Host and charge for your own solutions for your customers | ❌ | With a Commercial License |
| White-label your solutions | ❌ | With a Commercial License |
| Resell Avintra itself or offer it as a competing platform | ❌ | With a Commercial License |

[Talk to us about Enterprise](https://aventisia.com/contact/)

## License

Avintra is licensed under the [Avintra Community License](LICENSE): Apache 2.0 with additional conditions.

- ✅ Free to self-host and modify for your organisation's internal use
- ✅ Free to use for consulting, implementation and support work for clients
- 💼 A **Commercial License** lets you host Avintra to deliver your own solutions to your customers, charge for those solutions, and white-label them
- ❌ Without one, you may not host Avintra for third parties or sell it, and you may not remove or modify the Avintra logo and copyright notices in the frontend
- 🚫 Not allowed under any license: selling, reselling, sublicensing or renting Avintra itself; offering it under any name as a standalone or competing AI, agent or automation platform; reselling or sharing license keys; distributing the Enterprise files; or distributing the code for a fee
- 🔒 Enterprise features live in files marked `.ee` (`Name.ee.ts`, `Name.ee.cs`, `name_ee.py`) and are covered by the [Avintra Enterprise License](LICENSE_EE.md). They need a valid license key, as set out in that license, and the key check may not be bypassed.

For a Commercial License, see [Enterprise](https://aventisia.com/contact/) or email [contact@aventisia.com](mailto:contact@aventisia.com).

## Contributing

We welcome contributions of every size. Start with [CONTRIBUTING.md](CONTRIBUTING.md) and the [good first issues](https://github.com/aventisia/avintra/issues?q=is%3Aopen+label%3A%22good+first+issue%22). First-time contributors sign our [CLA](CLA.md) by commenting on their pull request.

## Community

- [GitHub Discussions](https://github.com/aventisia/avintra/discussions) for ideas and RFCs
- Follow [Aventisia on LinkedIn](https://www.linkedin.com/company/aventisia)

## Security

Please don't open public issues for vulnerabilities. See [SECURITY.md](SECURITY.md).

## Telemetry

The Community edition sends nothing to Aventisia. Registered Enterprise and Commercial deployments check their license at startup and daily, and report usage counts (platform version, jobs run, execution time, users, published agents). No workflow content, data or credentials are sent.
