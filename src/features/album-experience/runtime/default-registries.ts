import {
  ColorWashEffect,
  GrainEffect,
  LetterboxEffect,
  LightLeakEffect,
  MonochromeEffect,
  NoEffect,
  SoftHazeEffect,
  VignetteEffect,
} from "../effects/effects";
import {
  BlurToFocus,
  CameraFlash,
  ClipReveal,
  DepthReveal,
  ExposureReveal,
  GentleReveal,
  HorizontalDrift,
  NoMotion,
  RiseAndSettle,
  SlowZoom,
} from "../motion/motions";
import { CinematicFullscreenScene } from "../scenes/CinematicFullscreenScene";
import { ContactSheetScene } from "../scenes/ContactSheetScene";
import { EditorialSplitScene } from "../scenes/EditorialSplitScene";
import { FilmStripScene } from "../scenes/FilmStripScene";
import { HorizontalTravelScene } from "../scenes/HorizontalTravelScene";
import { LayeredDepthScene } from "../scenes/LayeredDepthScene";
import { MinimalGalleryScene } from "../scenes/MinimalGalleryScene";
import { ScatteredPrintsScene } from "../scenes/ScatteredPrintsScene";
import { TimelineScene } from "../scenes/TimelineScene";
import {
  CrossfadeTransition,
  CutTransition,
  DipToBlackTransition,
  DissolveTransition,
  FlashTransition,
  PageTurnTransition,
  SlideOverTransition,
  WipeTransition,
} from "../transitions/transitions";
import { ExperienceRegistry } from "./registry";
import type { EffectRenderer, MotionRenderer, SceneRenderer, TransitionRenderer } from "./types";

export const sceneRegistry = new ExperienceRegistry<SceneRenderer>()
  .register("cinematic-fullscreen", CinematicFullscreenScene)
  .register("editorial-split", EditorialSplitScene)
  .register("minimal-gallery", MinimalGalleryScene)
  .register("film-strip", FilmStripScene)
  .register("contact-sheet", ContactSheetScene)
  .register("scattered-prints", ScatteredPrintsScene)
  .register("timeline", TimelineScene)
  .register("layered-depth", LayeredDepthScene)
  .register("horizontal-travel", HorizontalTravelScene);

export const motionRegistry = new ExperienceRegistry<MotionRenderer>()
  .register("none", NoMotion)
  .register("gentle-reveal", GentleReveal)
  .register("slow-zoom", SlowZoom)
  .register("blur-to-focus", BlurToFocus)
  .register("depth-reveal", DepthReveal)
  .register("horizontal-drift", HorizontalDrift)
  .register("camera-flash", CameraFlash)
  .register("exposure-reveal", ExposureReveal)
  .register("clip-reveal", ClipReveal)
  .register("rise-and-settle", RiseAndSettle);

export const effectRegistry = new ExperienceRegistry<EffectRenderer>()
  .register("none", NoEffect)
  .register("grain", GrainEffect)
  .register("vignette", VignetteEffect)
  .register("soft-haze", SoftHazeEffect)
  .register("light-leak", LightLeakEffect)
  .register("letterbox", LetterboxEffect)
  .register("monochrome", MonochromeEffect)
  .register("color-wash", ColorWashEffect);

export const transitionRegistry = new ExperienceRegistry<TransitionRenderer>()
  .register("cut", CutTransition)
  .register("crossfade", CrossfadeTransition)
  .register("dip-to-black", DipToBlackTransition)
  .register("wipe", WipeTransition)
  .register("dissolve", DissolveTransition)
  .register("slide-over", SlideOverTransition)
  .register("flash", FlashTransition)
  .register("page-turn", PageTurnTransition);
