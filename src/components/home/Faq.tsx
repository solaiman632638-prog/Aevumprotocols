/** Plain questions, plain answers. Native details so it works without JavaScript. */
export function Faq({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  return (
    <div className="divide-y divide-rule border-y border-rule">
      {items.map((item) => (
        <details key={item.q} className="group py-5 sm:py-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg sm:text-xl [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rule text-mute transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="mt-3 max-w-2xl text-mute">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
