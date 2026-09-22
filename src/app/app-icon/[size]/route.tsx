import { ImageResponse } from "next/og";

const SIZES = [180, 192, 512] as const;

export function generateStaticParams() {
  return SIZES.map((size) => ({ size: String(size) }));
}

/** Square app icon: the crossbar-less A from the wordmark, white on black. */
export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size: raw } = await params;
  const size = SIZES.find((candidate) => String(candidate) === raw) ?? 512;
  const stroke = Math.round(size * 0.055);
  const inset = size * 0.28;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#000000" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path
            d={`M${inset} ${size - inset} L${size / 2} ${inset} L${size - inset} ${size - inset}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth={stroke}
            strokeLinejoin="miter"
          />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
