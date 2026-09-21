import type { Metadata } from "next";
import Link from "next/link";
import { pepipediaStorage } from "@/lib/data/pepipedia";

export const metadata: Metadata = {
  title: "How to reconstitute",
};

export default function ReconstitutionGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow">
        <Link href="/guides" className="text-brass no-underline hover:text-ink">
          Guides
        </Link>
      </p>
      <h1 className="mt-2 font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">
        How to reconstitute
      </h1>
      <p className="mt-4 max-w-prose">
        Lyophilized peptides are a dry cake. Bacteriostatic water turns that
        cake into a solution you can measure. The calculator does the arithmetic;
        this page is the bench method behind every sheet.
      </p>

      <ol className="mt-8 space-y-6">
        <Step n="1" title="Let the vial warm">
          A freezer or fridge vial sweats if you open it cold. Sit it 15–30
          minutes until the glass is near room temperature, then wipe the
          stopper with alcohol and let it dry. Do not skip the wait — condensate
          is how cakes collapse.
        </Step>
        <Step n="2" title="Keep the diluent at room temperature">
          Bacteriostatic water stays at 20–25 °C. Do not refrigerate the unopened
          diluent. More water means a larger, easier draw for a small amount.
          Less water keeps a large weekly amount on a 1 mL syringe. Each protocol
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

      <p className="mt-10 text-sm text-mute">
        {pepipediaStorage.reconstituted} {pepipediaStorage.bacWater} Sterile
        water without preservative is single-use. Glutathione is the thiol
        exception on this site — use it promptly even if the molecule’s safety
        file is otherwise quiet. Amounts on the protocol sheets are
        reconstitution math, not a recommendation.
      </p>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="grid grid-cols-[2rem_1fr] gap-4">
      <span className="font-mono text-sm text-brass">{n}</span>
      <div>
        <h2 className="font-display text-xl font-medium tracking-[-0.02em]">{title}</h2>
        <p className="mt-2 text-mute">{children}</p>
      </div>
    </li>
  );
}
