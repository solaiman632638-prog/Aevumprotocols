import type { Metadata } from "next";
import Link from "next/link";
import { Contact, LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms for using Aevum.",
};

const link = "text-pine-deep underline decoration-rule underline-offset-2";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <section>
        <h2>Educational information only</h2>
        <p>
          Aevum gives general health and research information. It is not medical
          advice, a diagnosis, or treatment, and using it does not create a
          doctor–patient relationship. Talk to a qualified health professional
          before changing your diet, training, supplements, or medications, and
          seek care immediately if you feel unwell.
        </p>
      </section>

      <section>
        <h2>Scores and recommendations</h2>
        <p>
          Daily scores and targets are estimates calculated from what you enter
          or what a connected device reports. They can be wrong, and they are
          not a substitute for medical testing or professional judgement.
        </p>
      </section>

      <section>
        <h2>Peptide guidance</h2>
        <p>
          The peptide check-in compares what you log with the published protocol
          for each compound and flags side effects and combinations. It is
          general information, not a prescription or a recommendation to use
          any compound, and it can be wrong. You are responsible for what you
          take; confirm doses and combinations with a qualified clinician.
        </p>
      </section>

      <section>
        <h2>Research compounds</h2>
        <p>
          The library and protocol pages describe compounds that are
          investigational, prescription-only, or sold for laboratory research.
          This information is for education. It is not an offer to sell, a
          recommendation to use any compound, or a statement that any compound is
          safe, legal, or effective where you live. Many of these compounds are
          not approved for human use. See the{" "}
          <Link href="/disclaimer" className={link}>full disclaimer</Link>.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <p>
          You are responsible for the accuracy of what you enter and for keeping
          access to your email secure. We may suspend accounts that misuse the
          service.
        </p>
      </section>

      <section>
        <h2>No warranty and limits of liability</h2>
        <p>
          Aevum is provided as is, without warranties of any kind. To the extent
          the law allows, we are not liable for any loss or harm arising from
          your use of the site or reliance on its content.
        </p>
      </section>

      <section>
        <h2>Privacy</h2>
        <p>
          How we handle your information is described in the{" "}
          <Link href="/privacy" className={link}>privacy policy</Link>.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>We may update these terms. The effective date above shows the latest version.</p>
      </section>

      <Contact />
    </LegalPage>
  );
}
