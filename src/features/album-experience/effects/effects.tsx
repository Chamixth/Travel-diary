import type { EffectRendererProps } from "../runtime/types";

export function NoEffect({ children }: EffectRendererProps) {
  return <>{children}</>;
}

export function GrainEffect({ children }: EffectRendererProps) {
  return <div className="grain relative isolate">{children}</div>;
}

export function VignetteEffect({ children }: EffectRendererProps) {
  return (
    <div className="relative isolate after:pointer-events-none after:absolute after:inset-0 after:z-20 after:bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.62)_100%)]">
      {children}
    </div>
  );
}

export function SoftHazeEffect({ children }: EffectRendererProps) {
  return (
    <div className="relative isolate after:pointer-events-none after:absolute after:inset-0 after:z-20 after:bg-[linear-gradient(135deg,rgba(235,242,241,0.2),transparent_48%,rgba(210,220,220,0.12))] after:backdrop-blur-[0.5px]">
      {children}
    </div>
  );
}

export function LightLeakEffect({ children }: EffectRendererProps) {
  return (
    <div className="relative isolate after:pointer-events-none after:absolute after:inset-0 after:z-20 after:mix-blend-screen after:bg-[radial-gradient(circle_at_5%_10%,rgba(255,126,51,0.34),transparent_32%),radial-gradient(circle_at_95%_80%,rgba(255,220,145,0.2),transparent_28%)]">
      {children}
    </div>
  );
}

export function LetterboxEffect({ children }: EffectRendererProps) {
  return (
    <div className="relative isolate before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-20 before:h-[clamp(10px,3vw,40px)] before:bg-black after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-20 after:h-[clamp(10px,3vw,40px)] after:bg-black">
      {children}
    </div>
  );
}

export function MonochromeEffect({ children }: EffectRendererProps) {
  return <div className="relative isolate grayscale">{children}</div>;
}

export function ColorWashEffect({ effect, children }: EffectRendererProps) {
  const tone = typeof effect.params?.tone === "string" ? effect.params.tone : "amber";
  const wash =
    tone === "blue"
      ? "after:bg-sky-900/15"
      : tone === "rose"
        ? "after:bg-rose-900/15"
        : "after:bg-amber-700/10";
  return (
    <div
      className={`relative isolate after:pointer-events-none after:absolute after:inset-0 after:z-20 after:mix-blend-color ${wash}`}
    >
      {children}
    </div>
  );
}
