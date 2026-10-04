import { describe, expect, it } from "vitest";
import {
  effectRegistry,
  motionRegistry,
  sceneRegistry,
  transitionRegistry,
} from "./default-registries";
import { ExperienceRegistry } from "./registry";

describe("ExperienceRegistry", () => {
  it("registers and resolves an implementation", () => {
    const registry = new ExperienceRegistry<number>().register("scene", 42);
    expect(registry.resolve("scene")).toBe(42);
    expect(registry.ids()).toEqual(["scene"]);
  });

  it("rejects duplicate registrations", () => {
    const registry = new ExperienceRegistry<number>().register("scene", 1);
    expect(() => registry.register("scene", 2)).toThrow(/already exists/);
  });
});

describe("default experience vocabulary", () => {
  it("exposes the production v1 creative primitives", () => {
    expect(sceneRegistry.ids()).toHaveLength(9);
    expect(motionRegistry.ids()).toHaveLength(10);
    expect(transitionRegistry.ids()).toHaveLength(8);
    expect(effectRegistry.ids()).toHaveLength(8);

    expect(sceneRegistry.has("horizontal-travel")).toBe(true);
    expect(sceneRegistry.has("scattered-prints")).toBe(true);
    expect(motionRegistry.has("camera-flash")).toBe(true);
    expect(transitionRegistry.has("page-turn")).toBe(true);
  });
});
