import amalfiBoat from "@/assets/amalfi-boat.jpg";
import heroTuscany from "@/assets/hero-tuscany.jpg";
import icelandBeach from "@/assets/iceland-beach.jpg";
import midnightBonfire from "@/assets/midnight-bonfire.jpg";
import moroccoRiad from "@/assets/morocco-riad.jpg";
import parisCafe from "@/assets/paris-cafe.jpg";
import tokyoAlley from "@/assets/tokyo-alley.jpg";
import type { ExperienceMediaAsset } from "../schemas/experience-spec";

const fixtureSources = [
  heroTuscany,
  icelandBeach,
  tokyoAlley,
  midnightBonfire,
  moroccoRiad,
  parisCafe,
  amalfiBoat,
];

export function fixtureMediaAssets(fixtureId: string): ExperienceMediaAsset[] {
  const seed = fixtureId.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
  return ["opening", "climax"].map((role, index) => ({
    id: `${fixtureId}-${role}`,
    src: fixtureSources[(seed + index * 3) % fixtureSources.length],
    width: 1600,
    height: index === 0 ? 1067 : 1200,
  }));
}
