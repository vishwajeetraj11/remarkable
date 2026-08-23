/**
 * Deterministic test utilities for generator corpus tests.
 *
 * Generators accept an injectable `rng?: () => number` parameter. Tests pass
 * a seeded PRNG (mulberry32) so every run is reproducible, and install a
 * guard that makes any accidental use of global Math.random fail loudly.
 */

/**
 * Small, fast, seedable PRNG returning floats in [0, 1).
 * See https://en.wikipedia.org/wiki/Mulberry32
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let guardInstalled = false;

/**
 * Replace global Math.random with a throwing stub for the remainder of the
 * process. Proves that no code path under test reaches for the global RNG —
 * everything must flow through the injected `rng`.
 */
export function forbidGlobalRandom(): void {
  if (guardInstalled) return;
  guardInstalled = true;
  Object.defineProperty(Math, "random", {
    value: () => {
      throw new Error(
        "global Math.random used during tests — inject rng instead"
      );
    },
    writable: false,
    configurable: false,
  });
}

/** Stable JSON serialization: sorts object keys, expands Sets. */
export function stable(value: unknown): string {
  if (value instanceof Set) {
    return JSON.stringify(["__set__", [...value].map(stable).sort()]);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => stable(v)).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`)
      .sort();
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value) ?? "undefined";
}
