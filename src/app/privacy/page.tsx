import type { Metadata } from "next";
import Link from "next/link";
import { Contact, LegalPage } from "@/components/legal/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Aevum collects, where it is stored, and how to delete it.",
};

const link = "text-pine-deep underline decoration-rule underline-offset-2";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <section>
        <h2>The short version</h2>
        <ul>
          <li>Without an account, everything you enter stays in your browser. We never receive it.</li>
          <li>With an account, your profile and check-ins are stored so they sync across your devices.</li>
          <li>We do not sell your data, show ads, or share it for marketing.</li>
          <li>You can delete your synced data at any time from the <Link href="/account" className={link}>Account</Link> page.</li>
        </ul>
      </section>

      <section>
        <h2>What you enter</h2>
        <p>
          The Today page asks for health information: age, sex, height, weight,
          goals, training habits, health conditions, medications, supplements,
          allergies, and daily check-ins such as sleep, energy, soreness,
          stress, heart rate, and weight. We treat all of it as sensitive.
        </p>
        <p>
          <strong>If you do not sign in,</strong> this information is saved only
          in your browser&apos;s local storage on that device. It is not sent to
          {" "}{site.domain} or anyone else. Clearing your browser data deletes it.
        </p>
        <p>
          <strong>If you create an account,</strong> we store your email
          address, your profile, and your check-ins with our database provider
          so you can use them on more than one device. Access is restricted so
          that only your signed-in account can read or change your records. If
          you choose a password, it is stored only as a secure hash by our
          authentication provider; we never see it.
        </p>
      </section>

      <section>
        <h2>Connected devices</h2>
        <p>
          If you choose to connect a device such as WHOOP, you sign in with that
          company and grant read access to your recovery, sleep, and training
          data. We keep the access token in a secure, browser-only cookie and
          fetch your data when you open Today. We do not store that data on our
          servers. You can disconnect at any time from the Devices page, and
          revoke access in the device maker&apos;s own settings.
        </p>
      </section>

      <section>
        <h2>Analytics</h2>
        <p>
          We use Vercel Web Analytics to count page views. It does not use
          cookies, does not identify you, and does not see anything you enter
          on Today.
        </p>
      </section>

      <section>
        <h2>Who processes your data</h2>
        <ul>
          <li>Vercel, which hosts the website.</li>
          <li>Supabase, which stores account data if you sign in.</li>
          <li>The device maker you connect, if any, under its own privacy policy.</li>
        </ul>
        <p>These providers may store data on servers outside Canada.</p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You can see, correct, export, or delete your information. Local data is
          yours to clear in your browser. Synced data can be deleted from the
          Account page, or by contacting us. We keep synced data until you delete
          it or close your account.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>Aevum is not intended for anyone under 13.</p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          If we change this policy we will update the effective date above, and
          tell signed-in users about material changes before they apply.
        </p>
      </section>

      <Contact />
    </LegalPage>
  );
}
