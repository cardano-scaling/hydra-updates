import type { Metadata } from "next";
import { DeliverableCard } from "@/components/deliverable-card";
import { getDeliverables, getStatusAsOf } from "@/lib/content";

export const metadata: Metadata = {
  title: "Deliverables",
  description:
    "Status and scope of every deliverable in the Cardano Developer Experience Initiative.",
};

export default function DeliverablesPage() {
  const deliverables = getDeliverables();
  const asOf = getStatusAsOf();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-14">
      <header className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
          Scope &amp; status
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground">
          Deliverables
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          The eight deliverables that make up the initiative. Status is set by
          the team{asOf ? `, last updated ${asOf}` : ""}; supporting GitHub
          activity is attached per deliverable in the weekly updates.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-5">
        {deliverables.map((d, i) => (
          <DeliverableCard
            key={d.id}
            deliverable={d}
            showDescription
            className="ledger-in"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
