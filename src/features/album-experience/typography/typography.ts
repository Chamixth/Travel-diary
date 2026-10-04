const typographyClasses: Record<string, string> = {
  cinematic: "font-serif tracking-normal",
  editorial: "font-serif tracking-tight",
  documentary: "font-sans tracking-normal",
  quiet: "font-sans font-light tracking-wide",
  contemporary: "font-sans tracking-tight",
  journal: "font-serif tracking-wide",
  playful: "font-sans tracking-normal",
  brutalist: "font-sans font-black uppercase tracking-[-0.04em]",
  nostalgic: "font-serif tracking-[0.015em]",
  technical: "font-mono tracking-tight",
  "handwritten-accent": "font-serif italic tracking-wide",
};

export function resolveTypography(personality: string): string {
  return typographyClasses[personality] ?? typographyClasses.documentary;
}
