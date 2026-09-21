"use client";

import { useEffect, useRef, useState } from "react";

const MAX_FRAMES = 90;
const MIN_FRAMES = 24;
const FRAMES_PER_SECOND = 12;
const MAX_FRAME_WIDTH = 960;
const LERP = 0.12;
const SEEK_EPSILON = 0.04;

function scrollProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

/** Draw a source into the canvas with object-fit: cover math. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
) {
  const { width, height } = ctx.canvas;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const w = sourceWidth * scale;
  const h = sourceHeight * scale;
  ctx.drawImage(source, (width - w) / 2, (height - h) / 2, w, h);
}

function waitFor(video: HTMLVideoElement, event: string) {
  return new Promise<void>((resolve) => video.addEventListener(event, () => resolve(), { once: true }));
}

/** Seek an offscreen video and capture evenly spaced frames as bitmaps. */
async function extractFrames(src: string, cancelled: () => boolean): Promise<ImageBitmap[]> {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = src;
  await waitFor(video, "loadedmetadata");

  const count = Math.min(MAX_FRAMES, Math.max(MIN_FRAMES, Math.round(video.duration * FRAMES_PER_SECOND)));
  const scale = Math.min(1, MAX_FRAME_WIDTH / video.videoWidth);
  const width = Math.round(video.videoWidth * scale);
  const height = Math.round(video.videoHeight * scale);
  const frames: ImageBitmap[] = [];

  for (let index = 0; index < count; index += 1) {
    if (cancelled()) break;
    video.currentTime = (index / (count - 1)) * Math.max(0, video.duration - 0.05);
    await waitFor(video, "seeked");
    frames.push(await createImageBitmap(video, { resizeWidth: width, resizeHeight: height }));
  }
  video.removeAttribute("src");
  video.load();
  return frames;
}

/**
 * Fixed full-bleed background whose playback position follows page scroll.
 * Motion is scroll-driven only: the video never autoplays or loops.
 */
export function ScrollVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<ImageBitmap[]>([]);
  const [hasFrame, setHasFrame] = useState(false);
  const [cacheReady, setCacheReady] = useState(false);

  // Build the frame cache once the visible video has something to show.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;

    const start = async () => {
      setHasFrame(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      try {
        const frames = await extractFrames(src, () => cancelled);
        if (cancelled || frames.length === 0) return;
        framesRef.current = frames;
        setCacheReady(true);
      } catch {
        // Seeking fallback keeps working without a cache.
      }
    };

    if (video.readyState >= 2) void start();
    else video.addEventListener("loadeddata", () => void start(), { once: true });

    return () => {
      cancelled = true;
      framesRef.current.forEach((frame) => frame.close());
      framesRef.current = [];
    };
  }, [src]);

  // Scroll → smoothed progress → frame.
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !video || !ctx) return;

    let target = scrollProgress();
    let smoothed = target;
    let raf = 0;
    let lastDrawn = -1;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      lastDrawn = -1;
    };
    const onScroll = () => {
      target = scrollProgress();
    };

    const tick = () => {
      smoothed += (target - smoothed) * LERP;
      const frames = framesRef.current;
      if (frames.length > 0) {
        const index = Math.round(smoothed * (frames.length - 1));
        if (index !== lastDrawn) {
          const frame = frames[index];
          drawCover(ctx, frame, frame.width, frame.height);
          lastDrawn = index;
        }
      } else if (Number.isFinite(video.duration) && video.duration > 0) {
        const time = smoothed * Math.max(0, video.duration - 0.05);
        if (Math.abs(video.currentTime - time) > SEEK_EPSILON && !video.seeking) {
          video.currentTime = time;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0a0a0a]">
      <video
        ref={videoRef}
        src={src}
        crossOrigin="anonymous"
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          hasFrame && !cacheReady ? "opacity-100" : "opacity-0"
        }`}
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
          cacheReady ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Keeps white type legible over the brightest frames. */}
      <div className="absolute inset-0 bg-black/25" />
    </div>
  );
}
