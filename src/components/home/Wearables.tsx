import { Reveal } from "@/components/home/Reveal";

/**
 * Logos are drawn as masks in the current text colour, so every brand sits in
 * the site's palette. Icon-only marks carry the brand name beside them.
 */
const brands = [
  { name: "WHOOP", src: "whoop.svg", width: 120 },
  { name: "Apple Watch", src: "applewatch.svg", width: 128 },
  { name: "Fitbit", src: "fitbit.svg", width: 28, label: true },
  { name: "Google Fit", src: "googlefit.svg", width: 28, label: true },
  { name: "Garmin", src: "garmin.svg", width: 120 },
  { name: "Samsung", src: "samsung.svg", width: 132 },
  { name: "Polar", src: "polar.svg", width: 112 },
  { name: "Withings", src: "withings.svg", width: 120 },
];

export function Wearables({ wrap, heading }: { wrap: string; heading: string }) {
  return (
    <section className="border-t border-rule" aria-labelledby="wearables-heading">
      <div className={`${wrap} pt-16 sm:pt-24 lg:pt-32`}>
        <Reveal>
          <p className="eyebrow">Coming soon</p>
          <h2 id="wearables-heading" className={`mt-6 ${heading}`}>
            Heart rate
            <br />
            monitoring.
          </h2>
          <p className="mt-8 max-w-md text-lg text-mute">
            Connect the wearable you already wear. Resting heart rate, HRV and
            sleep sit beside your log, so recovery trends show up next to
            everything else you track.
          </p>
        </Reveal>
      </div>

      <div className="marquee relative mb-16 mt-10 overflow-hidden border-y border-rule py-8 sm:mb-24 sm:mt-16 sm:py-10 lg:mb-32">
        <ul className="marquee-track flex w-max items-center text-mute">
          {[...brands, ...brands].map((brand, index) => (
            <li
              key={`${brand.name}-${index}`}
              aria-hidden={index >= brands.length}
              className="flex shrink-0 items-center gap-3 px-10 sm:px-14"
            >
              <span
                role="img"
                aria-label={brand.name}
                className="block h-7 bg-current"
                style={{
                  width: brand.width,
                  mask: `url(/wearables/${brand.src}) center / contain no-repeat`,
                  WebkitMask: `url(/wearables/${brand.src}) center / contain no-repeat`,
                }}
              />
              {brand.label && <span className="whitespace-nowrap text-xl">{brand.name}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
