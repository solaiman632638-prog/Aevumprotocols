import type { Metadata } from "next";
import { ReconCalculator } from "@/components/calc/ReconCalculator";
import { SameSyringeChecker } from "@/components/calc/SameSyringeChecker";
import { pepipediaStorage } from "@/lib/data/pepipedia";

export const metadata: Metadata = {
  title: "Reconstitution calculator",
  description:
    "Convert vial fill, bacteriostatic water, and an intended amount into a U-100 syringe draw, with the mixing and storage method behind it.",
};

const sectionTitle = "font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl";

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">
        Reconstitution calculator
      </h1>
      <p className="mt-3 max-w-prose text-mute">
        Concentration is vial milligrams divided by water millilitres. The draw
        is the intended amount divided by that concentration. A U-100 insulin
        syringe is 100 units per millilitre.
      </p>
      <div className="mt-8">
        <ReconCalculator />
      </div>
      <p className="mt-6 text-sm text-mute">
        Open a compound sheet if you want these fields pre-filled from the
        catalog vial size.
      </p>

      <section id="mixing" className="mt-14 scroll-mt-24">
        <h2 className={sectionTitle}>How to mix</h2>
        <p className="mt-3 max-w-prose text-mute">
          Lyophilized peptides are a dry cake. Bacteriostatic water turns that
          cake into a solution you can measure. The calculator does the
          arithmetic; this is the bench method behind it.
        </p>
        <ol className="mt-6 space-y-6">
          <Step n="1" title="Let the vial warm">
            A freezer or fridge vial sweats if you open it cold. Sit it 15–30
            minutes until the glass is near room temperature, then wipe the
            stopper with alcohol and let it dry. Do not skip the wait — condensate
            is how cakes collapse.
          </Step>
          <Step n="2" title="Keep the diluent at room temperature">
            Bacteriostatic water stays at 20–25 °C. Do not refrigerate the unopened
            diluent. More water means a larger, easier draw for a small amount.
            Less water keeps a large weekly amount on a 1 mL syringe. Each compound
            page suggests a starting volume for the catalog vial size.
          </Step>
          <Step n="3" title="Introduce water down the glass">
            Draw bacteriostatic water, insert the needle through the stopper, and
            let the stream run down the inside wall. Do not blast the cake.
          </Step>
          <Step n="4" title="Swirl until clear">
            Roll the vial between your palms. Do not shake. Foam and bubbles mean
            you were too vigorous. If particles remain after a few minutes, discard.
          </Step>
          <Step n="5" title="Label the math and box it">
            Write the date, the milligrams in the vial, the millilitres added, and
            the resulting mg/mL. Mixed vials stay in their box, dark, at 2–8 °C.
          </Step>
        </ol>
      </section>

      <section id="storage" className="mt-14 scroll-mt-24">
        <h2 className={sectionTitle}>Storage</h2>
        <p className="mt-3 max-w-prose text-mute">
          Two states, two rules. Dry powder is stable if it stays dry and cold.
          Once water is in the vial, the clock starts.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <StorageCard title="Lyophilized">{pepipediaStorage.lyophilized}</StorageCard>
          <StorageCard title="Reconstituted">{pepipediaStorage.reconstituted}</StorageCard>
          <StorageCard title="Bacteriostatic water">{pepipediaStorage.bacWater}</StorageCard>
          <StorageCard title="Nasal sprays">{pepipediaStorage.nasal}</StorageCard>
        </div>
        <h3 className="mt-8 font-display text-xl font-medium tracking-[-0.02em]">Discard if</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-mute">
          <li>The solution is cloudy, flecked, or will not clear after swirling.</li>
          <li>GHK-Cu loses its blue-green colour or throws a precipitate.</li>
          <li>Glutathione darkens — thiols oxidise even when the molecule’s safety file is otherwise quiet.</li>
          <li>The stopper has been punctured so often it cores or leaks.</li>
          <li>You cannot read the concentration on the label you wrote.</li>
        </ul>
      </section>

      <div id="same-syringe" className="mt-14 scroll-mt-24">
        <SameSyringeChecker />
      </div>
      <p className="mt-6 text-sm text-mute">
        Mixing peptides in one syringe has almost no published stability data.
        Most of these entries are community practice, not testing. When in
        doubt, use separate syringes. Educational only, not medical advice.
      </p>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[2rem_1fr] gap-4">
      <span className="font-mono text-sm text-brass">{n}</span>
      <div>
        <h3 className="font-display text-xl font-medium tracking-[-0.02em]">{title}</h3>
        <p className="mt-2 text-mute">{children}</p>
      </div>
    </li>
  );
}

function StorageCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-rule bg-sheet px-4 py-4">
      <h3 className="font-display text-xl font-medium tracking-[-0.02em]">{title}</h3>
      <p className="mt-2 text-sm text-mute">{children}</p>
    </section>
  );
}
