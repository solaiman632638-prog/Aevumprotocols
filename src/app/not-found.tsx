import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 sm:px-6">
      <h1 className="font-display text-4xl font-light leading-none tracking-[-0.03em] sm:text-5xl">
        Nothing at that address
      </h1>
      <p className="mt-3 text-mute">
        The compound register lists everything this site covers.
      </p>
      <Link
        href="/peptides"
        className="btn-primary mt-6"
      >
        Open the compound register
      </Link>
    </div>
  );
}
