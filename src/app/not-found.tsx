import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 sm:px-6">
      <h1 className="font-display text-4xl font-light leading-none tracking-[-0.03em] sm:text-5xl">
        No worksheet for that URL
      </h1>
      <p className="mt-3 text-mute">
        The register lists every compound this site covers.
      </p>
      <Link
        href="/protocols"
        className="btn-primary mt-6"
      >
        Open the register
      </Link>
    </div>
  );
}
