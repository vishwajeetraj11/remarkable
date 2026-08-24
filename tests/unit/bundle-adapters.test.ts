/**
 * Corpus tests for the bundle adapter registry: every adapter must generate,
 * draw a puzzle page, and draw an answer entry without throwing, and the
 * retry/isolation helpers must behave.
 */
import { describe, it, expect } from "vitest";
import { jsPDF } from "jspdf";

import {
  BUNDLE_ADAPTERS,
  generateWithRetry,
  safeDraw,
  safeDrawAnswer,
} from "@/lib/bundles/adapters";

const PW = 595.28;
const PH = 841.89;
const ctx = { pw: PW, ph: PH };

function freshDoc(): jsPDF {
  return new jsPDF({ unit: "pt", format: [PW, PH] });
}

describe("bundle adapters", () => {
  it("registers the full puzzle set with unique ids and labels", () => {
    const ids = BUNDLE_ADAPTERS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      "sudoku",
      "crossword",
      "word-search",
      "maze",
      "nonogram",
      "word-scramble",
      "cryptogram",
      "kakuro",
      "kenken",
      "word-ladder",
      "number-fill",
      "logic-grid",
    ]);
    for (const a of BUNDLE_ADAPTERS) {
      expect(a.label.length).toBeGreaterThan(0);
    }
  });

  it("every adapter generates, draws a puzzle page, and draws an answer entry", { timeout: 120_000 }, () => {
    for (const adapter of BUNDLE_ADAPTERS) {
      const puzzle = generateWithRetry(adapter);
      expect(puzzle, `${adapter.id} failed to generate`).not.toBeNull();

      const doc = freshDoc();
      expect(safeDraw(doc, adapter, puzzle, ctx, 0)).toBe(true);

      // Answer entry returns an advanced cursor.
      const answerDoc = freshDoc();
      const nextCy = safeDrawAnswer(answerDoc, adapter, puzzle, ctx, 60, 0);
      expect(nextCy).toBeGreaterThan(60);

      // Puzzle page starts its own page; answers flow into a section.
      expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(2);
      expect(answerDoc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    }
  });

  it("generateWithRetry redraws gated engines until they produce", () => {
    let calls = 0;
    const flaky = {
      id: "flaky",
      label: "Flaky",
      generate: () => {
        calls++;
        return calls >= 3 ? { ok: true } : null;
      },
      draw: () => {},
      drawAnswer: () => 0,
    };
    const result = generateWithRetry(flaky as never);
    expect(result).toEqual({ ok: true });
    expect(calls).toBe(3);

    // A permanently-gated engine gives up after the attempt budget.
    const dead = {
      id: "dead",
      label: "Dead",
      generate: () => null,
      draw: () => {},
      drawAnswer: () => 0,
    };
    expect(generateWithRetry(dead as never, undefined, 2)).toBeNull();
  });

  it("renderer errors stay isolated to their own page", () => {
    const boom = {
      id: "boom",
      label: "Boom",
      generate: () => ({ x: 1 }),
      draw: () => {
        throw new Error("renderer exploded");
      },
      drawAnswer: () => {
        throw new Error("answer exploded");
      },
      fine: {
        id: "fine",
        label: "Fine",
        generate: () => ({ y: 2 }),
        draw: (doc: jsPDF) => {
          doc.addPage();
          doc.text("ok", 40, 40);
        },
        drawAnswer: (_doc: jsPDF, _p: unknown, _c: unknown, cy: number) => cy + 10,
      },
    };
    const fine = (boom as unknown as { fine: typeof boom }).fine;

    const doc = freshDoc();
    const before = doc.getNumberOfPages();

    expect(safeDraw(doc, boom as never, boom.generate(), ctx, 0)).toBe(false);
    // Isolation lands the failure on its own page, ready for the next draw.
    expect(safeDraw(doc, fine as never, fine.generate(), ctx, 1)).toBe(true);
    expect(doc.getNumberOfPages()).toBeGreaterThan(before);

    const cyAfterFailure = safeDrawAnswer(
      doc,
      boom as never,
      boom.generate(),
      ctx,
      100,
      0,
    );
    expect(cyAfterFailure).toBe(100); // cursor untouched by failures
  });
});
