import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">
        Disclaimer
      </h1>
      <div className="mt-6 max-w-prose space-y-4">
        <p>
          Aevum Protocols publishes educational reconstitution worksheets,
          a goal-and-risk matcher, and optional heart-rate overlays for compounds
          listed on the NovaEvum catalog. Nothing on this site is medical advice,
          a diagnosis, a prescription, or an instruction to use any substance in
          or on a person or animal.
        </p>
        <p>
          Mechanism, safety, legal status, and literature scores are paraphrased
          from Pepipedia monographs. Pepipedia withholds investigational dosing
          on research-chemical pages. Amounts, schedules, and cycle lengths on
          these worksheets are reconstitution math for NovaEvum vials, not a
          Pepipedia dose and not a claim that any compound is safe or effective
          for any purpose.
        </p>
        <p>
          Products referenced here are sold for laboratory research. They are
          not dietary supplements, not drugs, and not approved by the FDA for
          the uses implied by these worksheets.
        </p>
        <p>
          Wearable connections (Whoop, Google Fit) read recovery and heart-rate
          data to suggest holding a pulse on a hard day. They do not diagnose,
          and a green recovery score is not permission to raise amounts.
        </p>
        <p>
          You are responsible for complying with the laws that apply to you.
          If you need medical care, speak to a licensed clinician. If a
          worksheet and a certificate of analysis disagree, the certificate
          wins.
        </p>
      </div>
    </div>
  );
}
