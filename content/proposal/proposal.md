# Abstract

[Proposal as PDF](https://ipnso-com.ipns.dweb.link/?cid=QmQPLwjTwZeGrzsgs2QiC6crJLcMg64fU2kDYZmPZ9o7wf)

Cardano's long-term utility depends on attracting and retaining developers — and this proposal accelerates that by making it dramatically easier to build on the platform. The target: a 30%+ improvement in developer growth rate within 12 months.

Why this matters: Cardano currently has roughly 550 active developers, with no signs of growth, whereas Ethereum added nearly 2,000 new developers per year on average over the last 6 years. Survey data from 109 Cardano builders points to a clear set of barriers — fragmented tooling, scattered documentation, lack of coordination, and a steep learning curve. These are solvable issues, and solving them unlocks the ecosystem flywheel: more builders lead to more DApps, which attract more users and generate more protocol revenue, which attracts more builders.

The initiative delivers five practical outcomes. First, community alignment paired with a bounty program that incentivizes improvements to ecosystem tools and libraries where pain points are greatest. Second, a setup tool ("cardano-init") that lets a new developer go from zero to a working project in minutes, regardless of their preferred tech stack. Third, an OpenZeppelin-style collection of ready-to-use smart contracts that gives builders a solid starting point. Fourth, a unified, simplified onboarding experience in the Developer Portal, built in collaboration with Intersect and coordinated with the team responsible for the Developer Portal. Fifth, a measurement hackathon designed to quantify progress and identify the next priorities.

IO is collaborating with Intersect's Developer Advocate Program and exploring a partnership with TxPipe to broaden delivery capacity. Intersect serves as the designated administrator, with milestone-based disbursement and independent third-party assurance. Unspent funds are returned to the Treasury.

Treasury Ask: ₳3,601,926

# Motivation

As a builder new to Cardano, I want to go from zero to an MVP on testnet in under two weeks, so that I can validate whether Cardano is the right platform for my project without a large upfront time investment.

This proposal funds a focused six-month program to streamline Cardano's developer tooling, documentation, and onboarding experience — directly targeting a 30%+ improvement in developer growth rate.

Opportunity: The current developer experience (DevX) on Cardano is subpar and fragmented, making it difficult for new and experienced developers to build, test, and deploy decentralized applications efficiently. The opportunity lies in harmonizing tooling, establishing canonical patterns, and consolidating documentation and libraries — changes that will accelerate development cycles and lower the barrier to entry for developers coming from other ecosystems (EVM, Web2), converting early interest into long-term commitment.

Solution: The core of this proposal is to provide an ecosystem-wide strategy that aligns the incentives of companies and entities that contribute to DevX, builds with them and on their work, and enables us, as an ecosystem, to work together to achieve a DevX that is similar to, or even better than, what competing ecosystems provide. We will do this by:

Creating bounties to incentivize developers of key projects that contribute to DevX to improve their tooling and libraries.

Creating a starter CLI to quickly set up a new project independent of the preferred tooling and with AI assistance. Everything that can be upstreamed will be upstreamed.

Compiling and creating an OpenZeppelin-like library of ready-to-use smart contracts that will allow new developers to either deploy directly or start from a solid base. It'll also serve to ground LLMs.

Unifying and improving the documentation and educational resources to streamline onboarding under the Developer Portal as the main entry point for developers.

Keeping track of the current and future states of all projects that contribute to DevX and help them fit within the broader context.

Why now: Over the years, our community has built amazing tooling, documentation, and libraries. We believe we have reached a point where each piece of the puzzle can offer great value on its own, we just need someone neutral to take the time of putting them together in a way that is easily accessible to new and experienced developers.

Technical Collaboration: IO is collaborating with Intersect's Developer Advocate Program and exploring a technology partnership with TxPipe to broaden delivery capacity and bring specialist developer tooling expertise to the Cardano ecosystem, ensuring these critical capabilities are sustained and strengthened by multiple capable organizations.

# Rationale

## Proposed Value Delivered (Why)

This initiative is meaningful to the Cardano community because it is based on developer feedback and directly addresses the core challenge of developer adoption and retention.

Independent of cycles, market conditions, or other factors, if something is useful, it will be used. Hence, the long-term value of Cardano and similar programmable blockchains is directly tied to the value their ecosystems provide to users. We need a rich ecosystem to attract users, and we need builders to create it. This is especially important for DeFi, our most valuable vertical. So, the ecosystem flywheel starts with supporting builders.

That also means that if one ecosystem has more builders than another, it is more likely to have greater utility in the long run. This puts us at a huge disadvantage compared to direct competitors (Ethereum and Solana). The clearest way we can visualize our current situation is by comparing developer growth.

On average, Ethereum grows by 1940 devs/year (3.5x the TOTAL number of developers in Cardano, which is currently ~550) while Solana grows by 884 devs/year (1.6x the TOTAL number of developers in Cardano). Why is that?

Based on analyzing datasets about GitHub activity and surveys made to 109 Cardano developers, one of the main reasons is a subpar developer experience:

Immature & Fragmented Tooling: Libraries and tooling across languages are incomplete, inconsistent, and don't work well together.
Poor Documentation & Onboarding: No unified, up-to-date documentation or "blessed path" for newcomers. Learning materials are scarce and scattered across sources.
Steep Learning Curve: The EUTXO model and FP requirements create significant friction.
Subpar Developer Experience: No cohesive development environment, unfriendly abstractions, and going from zero to a working DApp is difficult compared to EVM ecosystems.
Lack of Ecosystem Coordination: Duplicated efforts, unawareness of existing work, and no clear vision for architecture standards. Teams reinvent the wheel instead of building on shared foundations.
This strategy addresses these issues most pragmatically and directly:

The "Developer HUB" item (optimizing the Developer Portal for onboarding) will significantly reduce fragmented and poor documentation and significantly improve onboarding.
Community alignment and collaboration will reduce immature, fragmented tooling and the lack of ecosystem coordination. On top of this, it'll economically contribute to existing teams that build DevX-related tooling.
The "cardanol-init" setup CLI will provide a cohesive development environment to help developers get started quickly.
The Contracts Library will provide solid starting points to speed up development and, together with Developer HUB, reduce the initial learning curve.
Developer Outreach and Reactive work will help smooth out onboarding and solve paper cuts.
All of the items together significantly improve the overall developer experience. Especially for new developers looking into adopting Cardano.
The predicted impact is:

A measurable decrease in development time and onboarding effort.
A measurable improvement in NPS score and other direct measurements of DevX.
The relative growth rate (acquisition speed) of developers increases by at least 30% compared to the baseline (relative GR of 0.3).
A relative GR of 0 means Cardano grows at the same pace as now relative to competing ecosystems; a sustained positive GR means Cardano is gaining ground and could eventually reach or surpass competitors. This proposal targets a relative growth rate of at least 0.3 — a 30%+ acceleration in developer growth compared to the baseline.

This translates to an increase in DApps and directly contributes to Adoption & Utility, Ecosystem Growth, and Monthly Active Users (MAU).

## Core Cardano 2030 KPIs

| Core Cardano 2030 KPIs (Adoption) | Alignment | KPI Alignment Narrative |
|---|---|---|
| TVL | N/A | |
| Monthly Transactions | Yes - Fully | Same rationale as MAU. |
| Monthly Active Users (MAU) | Yes - Fully | We expect this initiative to increase MAU by improving developer retention and reducing time-to-deployment. By lowering friction in the builder journey—through standardized tooling, unified documentation, and educational resources—we anticipate a 20–30% increase in developer onboarding within 12 months. This translates into more production-ready DApps entering the ecosystem, directly driving user acquisition and engagement. Each successfully onboarded developer team can bring hundreds to thousands of active users, creating a multiplier effect on MAU growth. |

## Additional KPIs

| Additional Cardano 2030 KPIs (Adoption) | Alignment | KPI Alignment Narrative |
|---|---|---|
| Reliability: Monthly Uptime (6 epochs) | N/A | |
| Operational Resilience: Voting Power Distribution of Controlling Stake | N/A | |
| Operational Resilience: Alternative Full Node Clients | N/A | |
| Revenue / Adoption: Annual Protocol Revenue | Yes - Fully | By increasing MAU and Monthly Transactions, the protocol revenue increases. |
| Governance: DRep Participation Rate | N/A | |
| Scalability: Throughput Capacity per day | N/A | |

## Cardano 2030 Pillars

| Cardano 2030 Pillars | Alignment | Pillar Alignment Description |
|---|---|---|
| Pillar 1: Infrastructure & Research Excellence | N/A | |
| Pillar 2: Adoption & Utility | Yes - Fully | This initiative directly enables non-speculative utility by removing the primary barrier to adoption: developer friction. By delivering production-grade tooling, canonical patterns, and streamlined onboarding paths, we make it economically viable for builders to choose Cardano over competing ecosystems. Superior developer experience is a prerequisite for superior end-user experience—every improvement in DevX compounds into faster deployment cycles, higher-quality DApps, and ultimately, real-world utility across high-value verticals. |
| Pillar 3: Governance | N/A | |
| Pillar 4: Community & Ecosystem Growth | Yes - Fully | Strong developer experience is the foundation of ecosystem growth. This proposal cultivates a skilled developer base through structured learning paths, hands-on hackathons, and continuous community engagement (Discord, live streams, build clubs). By making Cardano more accessible to both Web2 and EVM developers, we expand the talent pool and accelerate the flywheel: more builders attract more projects, which attract more builders. |
| Pillar 5: Ecosystem Sustainability & Resilience | N/A | |

# Deliverables & Roadmap

| Sequence | Item Description |
|---|---|
| Q3 2026 | Community Alignment: Aligning the ecosystem with an overall DevX strategy. Map all ecosystem tooling to create a baseline for the Community Collaboration and Reactive items. |
| Q3 2026 | Developer Outreach: Support existing channels (e.g., answer questions in Discord). Translate unorganized questions/knowledge into issues/PRs in documentation. Create content about Contracts Library and Setup CLI/TUI items. Support Pentad integrations (Stablecoins, Bridges, Oracles), focusing on exposing features and defining the ideal UX/onboarding flow for developers. |
| Q3 2026 | cardano-init: Create a Setup CLI to easily start DApp projects. A "create-react-app" or "TanStack Builder" for Cardano, where users can pick any desired stack combination, and everything is set up and ready out of the box. This high-level umbrella tool will leverage all identified tools, provide AI/LLM-native integrations and commands, and ensure that getting started with a new project on Cardano takes just a few minutes. Everything that can be upstreamed will be upstreamed to improve the underlying tooling. We'll deliver the initial version of this tool with a reduced stack, but ready to be extended with more tooling. The plugin system will allow anyone to add their tooling without needing to know how the tool's internals work. Significantly reducing work by contributors and maintenance. NOTE: One of Cardano High Assurance's team proposals will account for the plugin architecture of this CLI to improve integration with their tooling. |
| Q3 2026 | Developer HUB: The objective is to have a single entry point for developers new to Cardano. After weeks of analyzing different options and consulting with the Cardano Foundation, Intersect, and community members, we decided that the Developer Portal should be the entry point. So, we'll collaborate with all the previously named parties to get this done there. We will: Define, organize, and create onboarding content for three key user personas: EVM/Blockchain developer, Web2 developer, and Technical entrepreneur. Ensure coding LLM agents can access this information. Add a CI/CD pipeline to maintain working code snippets. Generalize content to serve as onboarding material independently of your tooling preferences. Restructure parts or all of the portal to optimize for onboarding and LLM use. Related: Detailed strategy |
| Q3 2026 | ContractsLibrary: Inspired by OpenZeppelin's role in the EVM ecosystem and Cardano libraries like design-patters and the former Maestro contracts library, this library will provide battle-tested, ready-to-use contract implementations that developers can use as building blocks, inspiration, or a ready-to-go implementation for their applications. It'll target both building blocks and use-case-level contracts. Here, there's more information about the reasoning and the differences between this and existing libraries. We'll design and implement standardized, reusable smart contracts (on- and off-chain, with an emphasis on DeFi) along with related tooling/platform. The deliverable includes creating the library's infrastructure and website and shipping at least 5 ready-to-audit smart contracts (both on-chain and off-chain). For example, Vesting, Programmable Tokens, DEX (Decentralized Exchanges), Swap, Lending, and other contracts. NOTE: One of Cardano High Assurance's team proposals will pick up from here and formally prove the properties of these contracts. |
| Q4 2026 | Community Collaboration: We'll incentivize improvements to key devx-related tools and libraries via bounties paid to maintainers and contributors. We'll emphasize the biggest pain points in each case. For example: On-chain and off-chain interaction. Systems to improve hard-fork readiness. Introspection/serialization issues. |
| Q4 2026 | Measurement: We'll deliver a hackathon at the end of this proposal to measure developer experience. This will give us a clear idea of both the progress we have made and the next steps to keep improving developer experience. The setup and approach will differ from a regular hackathon to control for variables that could contaminate the data. Here's a description of how we'll do it (inside "Direct Metrics). |
| Reactive | Address high-ROI opportunities surfaced through ecosystem alignment. Examples include: Targeted contributions to community-maintained tooling. Additional SDK integrations. Fill key documentation gaps. Building new, currently unidentified, tooling. Etc. Selection criteria, decision-making about how to address these, and outcomes will be reported transparently. |

# Resources

The initiative will be delivered by a team composed of project management, TypeScript and web engineering, DApp development, Rust tooling, and developer relations specialists.

# Budget

Total Treasury Ask: ₳3,601,926

| Funding Distribution | | |
|---|---|---|
| Development & Engineering teams | ₳2,929,680 | 81% |
| Infrastructure | ₳36,019 | 1% |
| Security & Audits | ₳36,019 | 1% |
| Legal & Compliance | ₳36,019 | 1% |
| Engagement & Ecosystem support | ₳432,231 | 12% |
| Operations & Delivery | ₳72,039 | 2% |
| Governance | ₳36,019 | 1% |
| Others | ₳36,019 | 1% |

Pricing Principles: IO is requesting funding in ADA and has provided USD figures as a reference. A portion of the funding shall be specifically tied to demonstrating measurable impact on Cardano's KPIs and pillars

Development & Delivery: The majority of costs are needed to fund the delivery resources.
Community Bounties: fund OSS bounties for community-solved DevX issues. Included within personnel allocation.
Hackathon & Marketing: prize pool and marketing support for the measurement hackathon.
Ecosystem support, Audit, Assurance & Contingency: Leadership, ecosystem, and delivery to support execution and wider alignment. Independent work assurance and audits, plus contingency to account for complexities during execution

# Risks

| Type | Description | Likelihood | Severity / Impact | Mitigation |
|---|---|---|---|---|
| Community / Ecosystem | Differing priorities across ecosystem entities and builders may require additional coordination to achieve alignment. | Low | Medium: Several milestones depend on community acceptance (e.g., dev hub, startup CLI). We would still be technically able to deliver milestones, but the desired effect might not last. | We discussed this proposal with dozens of developers, and all of them agree that this is something needed. |
| Process | Hiring a team could take time. | Medium | Medium: Would complicate things, but some work can start during hiring. | We have already started filtering profiles and have reached out to companies that can provide augmentation. |

# Additional Information

Known Limitations: Adoption of our contributions by external tooling, library, and documentation developers depends on alignment and mutual value. To avoid issues with working on a PR that won't get merged, we'll communicate with the team that owns the repository to ensure they want our contribution and how. Even with this, we can't ensure all of our PRs will be merged.

Release Date / Solution Readiness: No on-chain release needed.

# Treasury Governance & Compliance

## Contract Management

A written off-chain Legal Contract will be created between Input Output and the Cardano Development Holdings (CDH), as mandated by the Constitution, and will be administered by Intersect. This will include details of the project delivery schedule and dispute resolution.

## Project Delivery

All milestones, acceptance criteria, payment amounts and expected delivery dates will be agreed between the Input Output and Intersect, acting on behalf of the CDH. Input Output will deliver according to the agreed-upon project schedule within the Legal Contract, of which the necessary information will be made public via the budget management platform via transaction metadata.

Defined by the milestones within a Legal Contract, Input Output will submit and attest milestone acceptance to the community, Intersect or 3rd Party Assurer.

Project progress will be monitored via Intersect's delivery assurance function which will be communicated to the community.

Acceptance of the work will be supported by a 3rd Party Assurer, who will be responsible for reviewing and signing off the work completed at each project milestone against the corresponding milestone deliverables detailed within the Legal Contract. This work is funded from a portion of this treasury withdrawal.

## Auditable Accounts & Fund Delegation

### Budget Management Tooling

To administrate treasury funds on-chain, Intersect will utilize the treasury management smart contract framework developed by Sundae Labs. The smart contracts have been extensively tested including audits from TxPipe and MLabs.

Final mainnet validation test can be seen via the Disburse action within transaction: 0f591dc544ae14102dbb4a74d5311a6acffc1772b163d8b7a9656b9525950b17

This withdrawal will utilise Intersect's 2025 treasury reserve contract with address being: stake17xzc8pt7fgf0lc0x7eq6z7z6puhsxmzktna7dluahrj6g6ghh5qjr Funds will later be migrated to a 2026 treasury reserve contract once established.

### Budget Management Specifics

Intersect will utilize a single Treasury Reserve Smart Contract (TRSC), with many Project-Specific Smart Contracts (PSSC), managed by Intersect. Intersect's management consists of three 'admin' and two Intersect 'leadership' roles. An Oversight Committee consisting of five external, independent third-party entities will provide checks and balances on Intersect, and safeguard against errors and unilateral control. The administration of both TRSC and PSSCs will be managed by Intersect, with external oversight on certain actions from the Oversight Committee.

The 2025 TRSC Oversight Committee consists of Sundae Labs, Cardano Foundation, Dquadrant, Xerberus and NMKR. Their role is to independently verify key administrative actions using on-chain logic, ensuring accuracy and consistency without exercising discretion over governance decisions.

For all details on Intersect's configuration please see the Smart Contract Guide on the knowledgebase.

The high level permissions are as follows:

TRSC Fund and PSSC Modify
Two of the three Intersect admins, two of the five trusted entities and one of the two Intersect leadership sign-off must authorize
TRSC Disperse
Two of three Intersect admins, three of five trusted entities and two of two Intersect leadership sign-off must authorize
TRSC Pause and Resume
Two of three Intersect admins, and one of two Intersect leadership sign-off must authorize
TRSC Sweep
One of three Intersect admins, and one of two Intersect leadership sign-off must authorize
TRSC Reorganize
Two of three Intersect admins and three of five trusted entities must authorize

## Processes

Upon enactment of this governance action, funding for this project will be directed into the TRSC's stake account. All instances of TRSC and PSSC can not be staked with a SPO and will be delegated to the auto-abstain predefined DRep. From here funds will be withdrawn into a UTxO remaining at the TRSC.

When a 2026 TRSC is established, the funding for this project will be migrated via the 'disburse' action.

When the Legal contract is prepared and Input Output is ready, funding for this project will be transferred using the Fund action to a PSSC. All milestones will be outlined within the metadata.

A dashboard will be available for the community to audit the TRSC or PSSC and track metrics related to this withdrawn ada as well as being immutably verifiable on chain.

## Funding Denomination

All amounts in this proposal are denominated in ada (₳). The total Treasury ask is ₳3,601,926. USD figures ($864,462) are provided for reference only, based on an ADA/USD rate of 0.24.

## Refund Conditions

All funds not disbursed by the end of the delivery period will be returned to the Cardano Treasury. A final reconciliation will be published as part of the oversight reporting cycle. In the event of partial delivery or scope reduction, unspent funds associated with cancelled or reduced deliverables will be returned proportionally.

## Prior Treasury Receipts

IO and its affiliated entities has been accountable for delivery of work funded by the Cardano Treasury. The total funds allocated has been ₳130,708,860 across a number of projects within Treasury Smart Contract, to date IOG has withdrawn ₳78,459,777.

| Workstream | Ada received | % of allocation | Corresponding Governance Action |
|---|---|---|---|
| Blockfrost | ₳1,137,500 | 88% | 8ad3d454f3496a35cb0d07b0fd32f687f66338b7d60e787fc0a22939e5d8833e#2 |
| Catalyst | ₳3,095,400 | 60% ** | 8ad3d454f3496a35cb0d07b0fd32f687f66338b7d60e787fc0a22939e5d8833e#23 |
| IOE | ₳47,159,487 | 49% | 8ad3d454f3496a35cb0d07b0fd32f687f66338b7d60e787fc0a22939e5d8833e#1 |
| IOR | ₳26,840,000 | 100% | 8ad3d454f3496a35cb0d07b0fd32f687f66338b7d60e787fc0a22939e5d8833e#32 |
| Governance | ₳227,390 | 38% | 8ad3d454f3496a35cb0d07b0fd32f687f66338b7d60e787fc0a22939e5d8833e#22 |

**Note: for Catalyst this only reflects the workstream that focuses on the Hermes Infrastructure and UX/UI improvements, not the execution and operation of Funds 14-16. Per Info Action this is in the process of transitioning to Cardano Foundation.

## Net Change Limit Compliance

The requested amount does not at time of submission, on its own or in aggregate, breach the applicable 350M Net Change Limit covering Epoch 613 to Epoch 713.

In accordance with the guardrail TREASURY-02a, this withdrawal does not exceed the NCL at the moment of submission.

## Audit & Oversight

Audit and oversight costs are included within the overhead applied to this proposal. The Intersect administration fee covers administrative oversight and is reflected within the cost of this proposal. Independent oversight will be provided through Intersect and technically capable third-party, including reporting obligations and milestone-based disbursement controls.

## Standardized Format & Immutable Hosting

Upon finalization, this proposal will be hosted on IPFS in an immutable format. The blake2b-256 hash of the document will be provided for on-chain reference and verification.
