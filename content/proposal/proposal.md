# Developer Experience Initiative

> As a builder new to Cardano, I want to go from zero to an MVP on testnet in
> under two weeks, so that I can validate whether Cardano is the right platform
> for my project without a large upfront time investment.

This proposal funds a focused six-month program to streamline Cardano's developer
tooling, documentation, and onboarding experience — directly targeting a **30%+
improvement in developer growth rate**.

## At a glance

| | |
|---|---|
| **Treasury ask** | ₳3,601,926 ($864,462 reference, at ADA/USD 0.24) |
| **Program length** | Six months — Q3 2026 → Q4 2026 |
| **Proposal lead** | Robertino Martinez |
| **Requesting entity** | Input \| Output's Cardano Business Unit (CBU) |
| **Collaborators** | Intersect Developer Advocate Program; TxPipe (exploratory) |
| **Contract** | Input Output ↔ Cardano Development Holdings (CDH), administered by Intersect |

## Motivation

**Opportunity.** The current developer experience (DevX) on Cardano is subpar and
fragmented, making it difficult for new and experienced developers to build,
test, and deploy decentralized applications efficiently. The opportunity lies in
harmonizing tooling, establishing canonical patterns, and consolidating
documentation and libraries — changes that accelerate development cycles and
lower the barrier to entry for developers coming from other ecosystems (EVM,
Web2), converting early interest into long-term commitment.

**Solution.** The core of this proposal is an ecosystem-wide strategy that aligns
the incentives of the companies and entities that contribute to DevX, builds with
them and on their work, and enables us — as an ecosystem — to achieve a DevX
similar to, or better than, competing ecosystems. We will do this by:

- Creating **bounties** to incentivize developers of key DevX projects to improve
  their tooling and libraries.
- Creating a **starter CLI** to quickly set up a new project independent of the
  preferred tooling and with AI assistance. Everything that can be upstreamed,
  will be upstreamed.
- Compiling an **OpenZeppelin-like library** of ready-to-use smart contracts that
  lets new developers deploy directly or start from a solid base — and that also
  grounds LLMs.
- Unifying and improving **documentation and educational resources** to streamline
  onboarding, under the Developer Portal as the main entry point.
- Keeping track of the **current and future state** of all projects that
  contribute to DevX, and helping them fit within the broader context.

**Why now.** Over the years, our community has built amazing tooling,
documentation, and libraries. We have reached a point where each piece of the
puzzle offers great value on its own — we just need someone neutral to take the
time to put them together in a way that is easily accessible to new and
experienced developers.

## Proposed value delivered

This initiative is based on developer feedback and directly addresses the core
challenge of developer adoption and retention. The long-term value of Cardano and
similar programmable blockchains is directly tied to the value their ecosystems
provide to users: we need a rich ecosystem to attract users, and we need builders
to create it. The flywheel starts with supporting builders.

Developer growth makes the gap concrete. On average, **Ethereum grows by ~1,940
developers/year** (3.5× Cardano's total of ~550 developers) and **Solana by ~884
developers/year** (1.6× Cardano's total). Based on GitHub activity datasets and a
survey of **109 Cardano developers**, the main reasons trace back to developer
experience:

- **Immature & fragmented tooling** — incomplete, inconsistent, and poorly
  interoperating across languages.
- **Poor documentation & onboarding** — no unified, up-to-date docs or "blessed
  path" for newcomers.
- **Steep learning curve** — the EUTXO model and FP requirements create friction.
- **Subpar developer experience** — no cohesive environment; zero-to-DApp is hard
  compared to EVM ecosystems.
- **Lack of ecosystem coordination** — duplicated effort, unawareness of existing
  work, and no clear architecture standards.

### Predicted impact

- A measurable decrease in development time and onboarding effort.
- A measurable improvement in NPS and other direct DevX measures.
- A **relative developer growth rate of at least 0.3** — a 30%+ acceleration in
  developer growth versus the baseline. (A relative GR of 0 means Cardano grows at
  today's pace relative to competitors; a sustained positive GR means it is
  gaining ground.)
- An anticipated **20–30% increase in developer onboarding within 12 months**,
  translating into more production-ready DApps and, through them, user
  acquisition and engagement.

### Cardano 2030 alignment

| Area | Alignment |
|---|---|
| Monthly Active Users (MAU) | Fully — better retention and faster time-to-deployment |
| Monthly Transactions | Fully — follows from MAU |
| Annual Protocol Revenue | Fully — follows from MAU and transactions |
| Pillar 2 — Adoption & Utility | Fully — removes developer friction, the primary barrier to adoption |
| Pillar 4 — Community & Ecosystem Growth | Fully — cultivates a skilled developer base and widens the talent pool |
| TVL; Pillars 1, 3, 5 | N/A |

## Deliverables & roadmap

Eight deliverables make up the initiative. Q3 lays the foundations; Q4 turns them
into community collaboration and measurement; the Reactive workstream runs
throughout.

### Q3 2026

**1. Community Alignment.** Align the ecosystem on an overall DevX strategy, and
map all ecosystem tooling to create a baseline for the Community Collaboration and
Reactive items.

**2. Developer Outreach.** Support existing channels (e.g. answer questions in
Discord); translate unorganized questions and knowledge into issues/PRs in
documentation; create content about the Contracts Library and Setup CLI/TUI; and
support Pentad integrations (Stablecoins, Bridges, Oracles), focusing on exposing
features and defining the ideal UX/onboarding flow for developers.

**3. cardano-init.** A Setup CLI to easily start DApp projects — a
"create-react-app" or "TanStack Builder" for Cardano, where users pick any desired
stack combination and everything is set up and ready out of the box. This
high-level umbrella tool leverages all identified tooling, provides AI/LLM-native
integrations and commands, and makes getting started take just a few minutes.
Everything that can be upstreamed will be upstreamed. The initial version ships
with a reduced stack but a **plugin system** so anyone can add their tooling
without knowing the tool's internals. *(One of Cardano High Assurance's team
proposals will account for the plugin architecture to improve integration with
their tooling.)*

**4. Developer HUB.** A single entry point for developers new to Cardano. After
analysis and consultation with the Cardano Foundation, Intersect, and community
members, the **Developer Portal** was chosen as the entry point. We will: define,
organize, and create onboarding content for three key personas (EVM/blockchain
developer, Web2 developer, technical entrepreneur); ensure coding LLM agents can
access the information; add a CI/CD pipeline to keep code snippets working;
generalize content to be tooling-agnostic; and restructure the portal to optimize
for onboarding and LLM use.

**5. Contracts Library.** Inspired by OpenZeppelin's role in the EVM ecosystem and
Cardano libraries like design-patterns and the former Maestro contracts library,
this library provides battle-tested, ready-to-use contract implementations that
developers use as building blocks, inspiration, or ready-to-go implementations. We
will design and implement standardized, reusable on- and off-chain contracts (with
an emphasis on DeFi), plus the library's infrastructure and website, shipping **at
least five ready-to-audit contracts** — for example Vesting, Programmable Tokens,
DEX, Swap, and Lending. *(One of Cardano High Assurance's team proposals will pick
up from here and formally prove the properties of these contracts.)*

### Q4 2026

**6. Community Collaboration.** Incentivize improvements to key DevX-related tools
and libraries via bounties paid to maintainers and contributors, emphasizing the
biggest pain points — for example on-chain/off-chain interaction, systems to
improve hard-fork readiness, and introspection/serialization issues.

**7. Measurement.** Deliver a hackathon at the end of the proposal to measure
developer experience, giving a clear read on progress made and the next steps. The
setup differs from a regular hackathon to control for variables that could
contaminate the data.

### Ongoing

**8. Reactive.** Address high-ROI opportunities surfaced through ecosystem
alignment — targeted contributions to community-maintained tooling, additional SDK
integrations, filling key documentation gaps, and building new, currently
unidentified tooling. Selection criteria, decision-making, and outcomes are
reported transparently.

## Resources

The initiative will be delivered by a team composed of project management,
TypeScript and web engineering, DApp development, Rust tooling, and developer
relations specialists.

## Budget

Total Treasury ask: **₳3,601,926**.

| Funding distribution | Amount | Share |
|---|---:|---:|
| Development & Engineering teams | ₳2,929,680 | 81% |
| Engagement & Ecosystem support | ₳432,231 | 12% |
| Operations & Delivery | ₳72,039 | 2% |
| Infrastructure | ₳36,019 | 1% |
| Security & Audits | ₳36,019 | 1% |
| Legal & Compliance | ₳36,019 | 1% |
| Governance | ₳36,019 | 1% |
| Others | ₳36,019 | 1% |

**Pricing principles.** IO requests funding in ADA and provides USD figures for
reference. A portion of the funding is tied to demonstrating measurable impact on
Cardano's KPIs and pillars. Community bounties for OSS DevX issues are included
within the personnel allocation; the measurement hackathon's prize pool and
marketing support are funded from the engagement allocation; ecosystem support,
audit, assurance, and contingency cover execution, independent assurance, and
complexity during delivery.

## Risks

| Type | Description | Likelihood | Mitigation |
|---|---|---|---|
| Community / Ecosystem | Differing priorities across ecosystem entities may require extra coordination to achieve alignment. | Low | This proposal was discussed with dozens of developers who agree it is needed; milestones remain technically deliverable regardless. |
| Process | Hiring a team could take time. | Medium | Profile filtering has started and augmentation partners have been contacted; some work can begin during hiring. |

**Known limitations.** Adoption of our contributions by external tooling, library,
and documentation maintainers depends on alignment and mutual value. To avoid
working on PRs that won't be merged, we coordinate with the owning team first —
though we can't guarantee every PR is merged. No on-chain release is needed.

## Treasury governance & compliance

**Contract management.** A written off-chain legal contract will be created between
Input Output and Cardano Development Holdings (CDH), as mandated by the
Constitution, and administered by Intersect. It covers the delivery schedule and
dispute resolution. Milestones, acceptance criteria, payment amounts, and expected
delivery dates are agreed between Input Output and Intersect (acting for the CDH),
made public via the budget-management platform through transaction metadata.
Progress is monitored via Intersect's delivery-assurance function; acceptance at
each milestone is signed off by a **third-party assurer**.

**Auditable accounts.** Treasury funds are administered on-chain via the treasury
management smart-contract framework developed by Sundae Labs (audited by TxPipe and
MLabs). Intersect uses a single Treasury Reserve Smart Contract (TRSC) with many
Project-Specific Smart Contracts (PSSCs), governed by three Intersect admins, two
Intersect leadership roles, and a five-member independent **Oversight Committee**
(for 2025: Sundae Labs, Cardano Foundation, DQuadrant, Xerberus, NMKR). A public
dashboard makes the TRSC/PSSC immutably auditable on-chain.

**Funding denomination.** All amounts are denominated in ada (₳). The total ask is
₳3,601,926; the USD figure ($864,462) is reference only, at an ADA/USD rate of
0.24.

**Refund conditions.** All funds not disbursed by the end of the delivery period
are returned to the Cardano Treasury, with a final reconciliation published in the
oversight reporting cycle. Unspent funds for cancelled or reduced deliverables are
returned proportionally.

**Net Change Limit.** The requested amount does not, on its own or in aggregate,
breach the applicable 350M Net Change Limit covering Epoch 613 to Epoch 713, in
accordance with guardrail TREASURY-02a.

## Addendum — possible future deliverables (2027)

The following are **not commitments** — they are possible next steps we may begin
if spare resources remain from this proposal.

- **Improve Developer HUB** — design patterns, `llms.txt` for all docs, an MCP
  server for integrated docs, Connect docs, and an expanded CI/CD pipeline.
- **Propagate CIPs** — push for community agreement on key DevX and DeFi CIPs, and
  help update tooling, libraries, and docs post-acceptance.
- **Extend cardano-init** — project templates, install aids, more tooling, health
  checks, and Agent Skills for common actions.
- **IDE / VSCode plugins** — a CBOR analyzer/interpreter and an error-translation
  layer for node error messages.
- **Documentation: Pushing Plutus' Limits** — experimental ways to increase smart
  contract throughput, with examples.
- **Developer Outreach: Build Club & more content** — Build Club sessions, live
  streams, and short video tutorials.
- **Exploratory R&D** — prototypes and CIP drafts for low-hanging DevX
  improvements.
- **Measure the state of DevX** — direct (hackathon) and indirect (relative growth
  rates of developers, DApps, and contracts deployed; Developer NPS).
