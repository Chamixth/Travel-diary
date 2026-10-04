export type RenderingTier = "A" | "B" | "C";

export interface RuntimeCapabilities {
  reducedMotion: boolean;
  tier: RenderingTier;
}

export function detectRuntimeCapabilities(): RuntimeCapabilities {
  if (typeof window === "undefined") return { reducedMotion: false, tier: "A" };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return { reducedMotion: true, tier: "A" };

  const supportsAdvancedDOM = "IntersectionObserver" in window && "ResizeObserver" in window;
  if (!supportsAdvancedDOM) return { reducedMotion: false, tier: "A" };

  const canvas = document.createElement("canvas");
  const supportsWebGL = Boolean(canvas.getContext("webgl2"));
  return { reducedMotion: false, tier: supportsWebGL ? "C" : "B" };
}
