import { site } from "@/lib/site";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">{title}</h1>
      <p className="mt-4 text-sm text-mute">Effective {site.legalEffectiveDate}</p>
      <div className="mt-10 max-w-prose space-y-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-light [&_h2]:tracking-[-0.02em] [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}

export function Contact() {
  if (!site.contactEmail) return null;
  return (
    <section>
      <h2>Contact</h2>
      <p>
        Questions or requests:{" "}
        <a href={`mailto:${site.contactEmail}`} className="text-pine-deep underline decoration-rule underline-offset-2">
          {site.contactEmail}
        </a>
        .
      </p>
    </section>
  );
}
