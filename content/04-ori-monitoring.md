---
layout: cards
id: monitoring
nav: ORI monitoring
eyebrow: Objective 1 · Deliverables
---

## Improved open research information monitoring

Where exactly do missing ORCIDs, incomplete affiliations and conflicting open access metadata come from, and what can we do about them together? These are the tools and reports we built to find out. All of them are open: use them, reuse them and build on them.

### ORI data quality dashboard

icon: research-20
tags: In production, Demonstrator

![ORI data quality dashboard](assets/img/ori-dashboard.jpg)

A dashboard for metadata specialists at the Dutch signatories of the Barcelona Declaration. Select your organisation and see your metadata across sources on four dimensions: **coverage**, **completeness**, **enrichment** potential and **accuracy**. It also suggests interventions, with an estimate of effort and impact.

- [Open the dashboard](https://ori-dashboard.surf.nl/)
- [View the mockup](https://ori-dashboard.lovable.app/)

### ORI backbone: an open data lake

icon: data-14
tags: Proof of concept, Open source

![ORI backbone: technical data pipelines](assets/img/ori-backbone-pipeline.jpg)

A data lake on a public tech stack (DuckLake, Parquet and S3) on SURF storage infrastructure. Snapshots of OpenAIRE, OpenAlex, OpenAPC and Dutch CRIS systems flow through open pipelines from external sources to *bronze*, *silver* and *gold* layers. Browse the catalogue and query it straight from your browser, no server needed.

- [Data overview](http://surf-ori.github.io/ducklake-overview)
- [Code: external → staging → bronze](https://github.com/surf-ori/sprouts)
- [Code: bronze → silver → gold](https://github.com/surf-ori/pid2portal)

### ORI framework report

icon: research-17
tags: Report, Deliverable A1

![The monitoring framework: comparing metadata quality across sources](assets/img/ori-framework.jpg)

Which use cases matter most to Dutch institutions, and which metadata do they need? Based on 14 use cases from 10 organisations, grouped into reporting, assessment and analysis. The verdict: improve three elements first. **DOIs** (also for grey literature), **ROR** for institutions and **ORCID** for people.

- [Read the report](https://doi.org/10.5281/zenodo.18667698)

### ORI metrics report

icon: research-03
tags: Report, Deliverable A2

![Example interventions with effort and impact](assets/img/ori-interventions.jpg)

What to measure and how, for every prioritised metadata element. The report compares OpenAlex, OpenAIRE, Crossref and CRIS, explains the approaches behind the dashboard and lists concrete interventions, each with its expected effort and impact.

- [Read the report](https://doi.org/10.5281/zenodo.23682960)

### ORI AI tools

icon: research-01
tags: Extra, Open source

![Asking the data lake a question in natural language](assets/img/ori-ai-sql.jpg)

Ask a question in plain language and get a working SQL query on the data lake. Skills and an MCP server let AI agents find their way through the complex data structures, so non-technical users can query the data transparently.

- [Read the documentation](https://github.com/surf-ori/agentic-tools)

### ORI AI crash course

icon: collaboration-09
tags: Extra, Course

![ORI crash course: participant quickstart](assets/img/ori-ai-crash-course.jpg)

Build a small, auditable dashboard about Dutch open research in one hour, without writing code yourself. You direct an open source AI agent (opencode, open LLMs and marimo notebooks) and judge what it produces. Everything runs on your own laptop.

- [Start the crash course](https://github.com/surf-ori/ori-ai-crashcourse/blob/main/docs/participant-quickstart.md)
