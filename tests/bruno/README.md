# Bruno API Tests

Bruno test collections for the Aventisia WORC Platform APIs.

## Overview

This directory contains [Bruno](https://www.usebruno.com/) collections used to manually and automatically exercise the platform's REST APIs. Collections are organized by service.

## Collections

| Collection        | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `AccountsAPIs`    | Identity, accounts, tenants, subscriptions, billing  |
| `WorkspaceAPIs`   | Flows, executions, files, chat, connectors, projects |
| `GlobalAdminAPIs` | Global admin and on-prem instance management         |
| `llmpipelineapis` | Text extraction, OCR, TTS, STT, LLM providers        |

## Getting Started

1. Install [Bruno](https://www.usebruno.com/downloads).
2. Open this folder (`tests/bruno`) as a Bruno collection/workspace.
3. Select an environment under `environments/` (e.g., local, staging, production).
4. Run requests or collections as needed.

## Files

- `collection.bru` — Root collection metadata
- `bruno.json` — Bruno configuration
- `environments/` — Environment-specific variables (host, tokens, etc.)

## Notes

- Do not commit secrets or production tokens in environment files.
- Keep request naming consistent with the feature or controller it targets.
