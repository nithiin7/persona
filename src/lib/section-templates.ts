export interface SectionTemplate {
  role: string;
  bullets: string[];
}

export const WORK_EXPERIENCE_TEMPLATES: SectionTemplate[] = [
  {
    role: "Software Engineer",
    bullets: [
      "Designed and implemented [feature/system], reducing [metric] by [X]%",
      "Collaborated with product and design teams to deliver [project] on schedule",
      "Refactored [module/codebase] to improve maintainability and reduce technical debt",
      "Wrote unit and integration tests, achieving [X]% code coverage on [service]",
      "Optimized [database queries / API endpoints], improving p99 latency by [X]ms",
      "Mentored [N] junior engineers through code reviews and pair programming",
      "Participated in on-call rotation, resolving [N] production incidents per quarter",
      "Led migration of [legacy system] to [new stack], cutting infrastructure costs by [X]%",
    ],
  },
  {
    role: "Frontend Engineer",
    bullets: [
      "Built and maintained [component/feature] using [React/Vue/Angular], serving [N]+ users",
      "Improved Lighthouse performance score from [X] to [Y] through lazy loading and code splitting",
      "Implemented responsive designs from Figma specs, achieving pixel-perfect fidelity across breakpoints",
      "Reduced bundle size by [X]% by introducing tree-shaking and dynamic imports",
      "Collaborated with designers to create and document a shared component library used across [N] teams",
      "Wrote E2E test suites with [Cypress/Playwright], catching [N]+ regressions before release",
      "Integrated [REST/GraphQL] APIs and managed client-side state with [Redux/Zustand/React Query]",
    ],
  },
  {
    role: "Backend Engineer",
    bullets: [
      "Designed and built [REST/GraphQL] APIs consumed by [N] client applications",
      "Implemented [feature/service] using [Node.js/Python/Go/Java], handling [X]k requests per second",
      "Modeled and optimized database schemas, reducing query time for [critical path] by [X]%",
      "Designed event-driven architecture with [Kafka/RabbitMQ/SQS], decoupling [N] services",
      "Improved service reliability from [X]% to [Y]% uptime by [technique/fix]",
      "Set up CI/CD pipelines with [GitHub Actions/Jenkins], reducing deployment time from [X] to [Y] minutes",
      "Ensured security compliance by implementing [auth pattern / input validation / encryption] across all endpoints",
    ],
  },
  {
    role: "Full Stack Engineer",
    bullets: [
      "Owned end-to-end development of [feature], from database schema design to UI implementation",
      "Built [web application] with [React/Next.js] frontend and [Node.js/Python] backend, serving [N]+ users",
      "Reduced page load time by [X]% through server-side rendering and API response caching",
      "Designed and implemented authentication and authorization flows using [JWT/OAuth/Supabase Auth]",
      "Led weekly technical reviews with stakeholders, translating business requirements into engineering tasks",
      "Shipped [N] features per sprint while maintaining [X]% test coverage",
      "Migrated monolith to microservices, improving deployment independence for [N] teams",
    ],
  },
  {
    role: "Data Engineer",
    bullets: [
      "Built and maintained ETL pipelines processing [X]GB of data daily from [N] source systems",
      "Designed data warehouse schema on [Snowflake/BigQuery/Redshift], enabling self-serve analytics for [N] teams",
      "Reduced pipeline failure rate from [X]% to [Y]% by implementing data quality checks and alerting",
      "Optimized [dbt/Spark] transformation jobs, cutting run time from [X] hours to [Y] minutes",
      "Collaborated with data scientists to productionize ML feature pipelines with sub-[X]ms latency",
      "Automated infrastructure provisioning with [Terraform/Pulumi], reducing setup time by [X]%",
      "Documented data lineage and catalogued [N] datasets in [DataHub/dbt docs], improving discoverability",
    ],
  },
  {
    role: "DevOps / Platform Engineer",
    bullets: [
      "Maintained and scaled Kubernetes clusters serving [N] microservices across [N] environments",
      "Reduced mean time to recovery (MTTR) from [X] hours to [Y] minutes through improved observability",
      "Built self-service developer platform enabling teams to deploy independently without ops involvement",
      "Authored Terraform modules managing [X]+ cloud resources across [AWS/GCP/Azure]",
      "Implemented zero-downtime deployment strategy, eliminating [N] hours of annual planned maintenance",
      "Set up centralized logging and tracing with [ELK/Datadog/Grafana], reducing debug time by [X]%",
      "Led incident response for [N]+ P0/P1 events, authoring post-mortems and driving follow-up actions",
    ],
  },
  {
    role: "Product Manager",
    bullets: [
      "Owned [product area] roadmap from discovery to launch, delivering [N] features per quarter",
      "Conducted [N] user research sessions and synthesized findings into actionable product requirements",
      "Increased [metric: DAU/retention/conversion] by [X]% by shipping [feature/experiment]",
      "Wrote detailed PRDs and collaborated with engineering and design to align on scope and delivery",
      "Ran A/B experiments that informed [decision], improving [metric] by [X]%",
      "Partnered with sales and customer success to identify and prioritize [N] high-impact opportunities",
      "Presented quarterly roadmap updates to [C-suite / stakeholders], gaining buy-in on [N] initiatives",
    ],
  },
  {
    role: "Data Analyst",
    bullets: [
      "Built dashboards in [Tableau/Looker/Power BI] tracking [KPIs], used by [N] stakeholders weekly",
      "Performed cohort analysis revealing [finding], leading to [business decision]",
      "Wrote complex SQL queries against [data warehouse] to support [N] ad-hoc business requests per month",
      "Automated [report/process] with [Python/dbt], saving [X] hours of manual work per week",
      "Collaborated with product and engineering to define event tracking schemas for [N] new features",
      "Presented data-driven recommendations to leadership, directly influencing [initiative]",
      "Maintained and documented [N] core data models, ensuring consistent metric definitions across teams",
    ],
  },
  {
    role: "Data Scientist",
    bullets: [
      "Developed and deployed [model type] model achieving [X]% accuracy / [X] AUC on [problem]",
      "Reduced [metric: churn / fraud / cost] by [X]% using [ML technique] in production",
      "Designed and analyzed [N] A/B experiments, surfacing insights that improved [KPI] by [X]%",
      "Built feature pipelines and model retraining workflows, reducing model staleness from [X] days to [Y]",
      "Collaborated with engineering to serve model predictions with sub-[X]ms p99 latency at scale",
      "Presented findings and model results to non-technical stakeholders, driving adoption of [N] recommendations",
      "Explored and evaluated [N] open-source models / techniques, identifying [winning approach] for production",
    ],
  },
  {
    role: "UX Designer",
    bullets: [
      "Led end-to-end UX design for [product/feature], from user research and journey mapping to final specs",
      "Conducted [N] usability tests, identifying [N] critical friction points and iterating to resolution",
      "Created and maintained a design system with [N] reusable components, adopted across [N] product teams",
      "Reduced task completion time on [flow] by [X]% through redesigned information architecture",
      "Collaborated daily with engineers in Figma, providing redlines and answering implementation questions",
      "Synthesized user interviews and analytics data into personas and journey maps shared with [N] stakeholders",
      "Shipped [N] major design projects on schedule while maintaining a [X]-day design review turnaround",
    ],
  },
  {
    role: "Project Manager",
    bullets: [
      "Managed delivery of [project] on time and within [X]% of budget, coordinating [N] cross-functional teams",
      "Defined project scope, milestones, and risk register; tracked progress in [Jira/Asana/Linear]",
      "Facilitated [N] stakeholder reviews per quarter, resolving blockers and keeping leadership aligned",
      "Reduced average project cycle time by [X]% by introducing [process change / tooling]",
      "Maintained resource allocation for a team of [N] across [N] simultaneous workstreams",
      "Ran retrospectives after each sprint/phase, implementing [N] process improvements over [timeframe]",
      "Authored project status reports distributed to [C-suite / board], summarizing risks and milestones",
    ],
  },
  {
    role: "Business Analyst",
    bullets: [
      "Elicited and documented requirements from [N] business stakeholders, producing [N] detailed BRDs",
      "Mapped current-state processes and identified [N] opportunities for automation or process improvement",
      "Conducted cost-benefit analysis for [initiative], projecting [X]% ROI over [timeframe]",
      "Built financial models and scenario analyses to support [decision / investment]",
      "Served as liaison between business and engineering, translating requirements into technical user stories",
      "Tracked and reported on KPIs for [initiative], presenting insights to leadership monthly",
      "Facilitated workshops with [N] stakeholders to align on prioritization and acceptance criteria",
    ],
  },
  {
    role: "Marketing Manager",
    bullets: [
      "Owned [channel / campaign] strategy, growing [metric: leads/traffic/conversions] by [X]% YoY",
      "Managed a [X]k marketing budget, achieving [X]x ROAS on paid channels",
      "Launched [N] integrated campaigns across [email/social/paid/SEO], increasing brand awareness by [X]%",
      "Partnered with sales to align on ICP targeting, contributing to [X]% increase in qualified pipeline",
      "Analyzed campaign performance weekly and reallocated budget, improving blended CAC by [X]%",
      "Built and maintained editorial calendar for [blog/social], publishing [N] pieces of content per month",
      "Grew email list from [X]k to [Y]k subscribers with [X]% average open rate",
    ],
  },
  {
    role: "Sales Representative",
    bullets: [
      "Exceeded quota by [X]% in [year/quarter], generating $[X] in new ARR",
      "Managed a pipeline of [N] accounts with a combined deal value of $[X]",
      "Reduced average sales cycle from [X] days to [Y] days through improved discovery and objection handling",
      "Closed [N] enterprise deals averaging $[X]k ACV, working with procurement and legal on contract terms",
      "Collaborated with marketing on ABM campaigns targeting [N] named accounts, achieving [X]% conversion",
      "Maintained [X]%+ CRM hygiene, providing accurate forecasts within [X]% variance each quarter",
      "Onboarded and ramped [N] new reps, sharing playbooks and call coaching to accelerate their attainment",
    ],
  },
  {
    role: "Customer Success Manager",
    bullets: [
      "Managed a portfolio of [N] accounts totalling $[X]M ARR with [X]% net revenue retention",
      "Reduced churn by [X]% YoY through proactive health scoring and escalation playbooks",
      "Led [N] quarterly business reviews per quarter, demonstrating ROI and securing multi-year renewals",
      "Drove [X]% expansion revenue within existing accounts by identifying upsell and cross-sell opportunities",
      "Onboarded [N] new customers per quarter, achieving average time-to-value of [X] days",
      "Served as voice of customer to product team, submitting [N] feature requests that shipped within [timeframe]",
      "Maintained [X]+ NPS and [X]+ CSAT scores across portfolio through regular touchpoints and advocacy programs",
    ],
  },
];
