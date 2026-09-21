import { NextResponse } from "next/server";
import { appUrl, googleConfigured, whoopConfigured } from "@/lib/wearables/oauth";

export async function GET() {
  return NextResponse.json({
    whoopReady: whoopConfigured(),
    googleReady: googleConfigured(),
    appUrl: appUrl(),
  });
}
