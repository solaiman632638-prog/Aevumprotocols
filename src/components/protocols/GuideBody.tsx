import { standardMixing, standardStorage, type Guide } from "@/lib/data/guides";

const heading = "font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl";

function formatConc(mgPerMl: number): string {
  if (mgPerMl >= 100) return `${Math.round(mgPerMl)} mg/mL`;
  return `${Number(mgPerMl.toFixed(2))} mg/mL`;
}

/** Reconstitution, schedule, duration, notes, and storage for one guide. */
export function GuideBody({ guide }: { guide: Guide }) {
  const ready = guide.readyMgPerMl != null;

  return (
    <div className="space-y-10">
      {guide.important ? (
        <p className="max-w-3xl rounded-3xl border border-warn/30 bg-warn-tint px-5 py-4 text-warn">
          <span className="font-semibold">Important: </span>
          {guide.important}
        </p>
      ) : null}

      <section>
        <h2 className={heading}>Reconstitution</h2>
        {ready ? (
          <p className="mt-3 max-w-prose">
            Ships ready to use at {guide.readyMgPerMl} mg/mL
            {guide.readyMl ? ` in a ${guide.readyMl} mL vial` : ""}. Nothing to mix.
          </p>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto rounded-3xl border border-rule">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Concentration by vial size and water volume</caption>
                <thead className="border-b border-rule bg-sheet">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">Vial</th>
                    {guide.bac.map((ml) => (
                      <th key={ml} scope="col" className="px-4 py-2.5 font-medium">
                        {ml} mL water
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guide.vials.map((mg) => (
                    <tr key={mg} className="border-b border-rule last:border-b-0">
                      <th scope="row" className="px-4 py-2.5 font-normal">{mg} mg</th>
                      {guide.bac.map((ml) => (
                        <td key={ml} className="px-4 py-2.5 font-mono text-[0.8rem]">
                          {formatConc(mg / ml)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {guide.bacNote ? <p className="mt-4 max-w-prose text-sm text-mute">{guide.bacNote}</p> : null}
            <ol className="mt-4 max-w-prose list-decimal space-y-1.5 pl-5 text-sm">
              {[...standardMixing, ...guide.recon].map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </>
        )}
      </section>

      <section>
        <h2 className={heading}>Protocol</h2>
        <p className="mt-2 text-sm text-mute">Route: {guide.route}</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {guide.sections.map((section) => (
            <div key={section.title} className="rounded-3xl border border-rule bg-sheet p-5">
              <h3 className="eyebrow">{section.title}</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="text-mute">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        {guide.dosing.length > 0 ? (
          <section>
            <h2 className={heading}>Dosing detail</h2>
            <ul className="mt-4 max-w-prose list-disc space-y-2 pl-5">
              {guide.dosing.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ) : null}
        <div className="space-y-10">
          {guide.duration.length > 0 ? (
            <section>
              <h2 className={heading}>Duration</h2>
              <ul className="mt-4 max-w-prose list-disc space-y-2 pl-5">
                {guide.duration.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {guide.notes.length > 0 ? (
            <section>
              <h2 className={heading}>Notes</h2>
              <ul className="mt-4 max-w-prose list-disc space-y-2 pl-5">
                {guide.notes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      <section>
        <h2 className={heading}>Storage and handling</h2>
        <ul className="mt-4 max-w-prose list-disc space-y-2 pl-5 text-sm">
          {(ready ? guide.storage : [...standardStorage, ...guide.storage]).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
