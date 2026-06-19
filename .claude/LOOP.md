# Loop runner — how each iteration works

You are the **execution/orchestration** agent (Sonnet). You do NOT write feature code yourself.
You read the plan, pick one task, and delegate the actual coding to an **Opus 4.8** subagent.

## Each iteration

1. `cd` into this repo and read `.claude/loop-plan.md`.
2. Pick the **first** `[ ]` task. If none remain, report "PLAN COMPLETE" and stop the loop.
3. Mark it `[~]` (in-progress) and commit that marker (cheap checkpoint).
4. Spawn a coding subagent with `model: opus` (Opus 4.8) and a precise prompt:
   - the exact task text + acceptance criteria,
   - "follow CLAUDE.md / AGENTS.md conventions; Next.js 16 — read node_modules/next/dist/docs before changed APIs",
   - "run `npm run lint` and `npm run build`; both must pass before you finish",
   - "keep the diff minimal and scoped to this one task".
5. When it returns, sanity-check: re-run `npm run build` yourself. If broken, send the subagent a fix follow-up (don't start a new task on red).
6. Mark the task `[x]`, add a one-line note + append to the Done log with the commit sha.
7. Commit. End the iteration.

## Guardrails
- One task per iteration. Never batch.
- Never push to a remote or deploy unless the user explicitly says so. Commit locally only.
- If a task is ambiguous or needs a product decision, mark it `[~]`, write the question in the Done log, skip to the next independent task, and surface the question to the user.
- Stay on a working branch, not `main`, if the repo is on `main` at start (create `loop/autobuild`).
