import { useEffect } from "react";

export function AlbumGenerationLoader({ stageLabel }: { stageLabel?: string }) {
  useEffect(() => {
    console.info("[VoyaLoom][AlbumGenerationLoader] mounted");
    return () => console.info("[VoyaLoom][AlbumGenerationLoader] unmounted");
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-midnight/90 px-6 text-center backdrop-blur-sm"
      aria-live="polite"
    >
      <div className="w-full max-w-xl">
        <div className="relative mx-auto mb-8 h-32 w-56">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              style={{ animationDelay: `${index * 180}ms` }}
              className="album-card-motion absolute left-0 top-8 h-24 w-32 border border-gold/35 bg-charcoal shadow-cinematic"
            >
              <div className="absolute inset-2 bg-gradient-to-br from-gold/20 via-sand/5 to-midnight" />
              <div className="absolute bottom-2 left-2 h-px w-12 bg-gold/50" />
            </div>
          ))}
          <div className="album-beacon absolute -right-2 top-2 size-2 rounded-full bg-gold shadow-gold" />
        </div>
        <p className="text-[10px] uppercase tracking-ultra text-gold">
          {stageLabel || "Designing your experience…"}
        </p>
        <p className="mt-3 font-serif text-xl italic text-sand/60">
          Placing the moments into a story worth returning to.
        </p>
      </div>
    </div>
  );
}
