# Loop runner — multi-agent pipeline

Three roles per iteration. The loop session is the **orchestrator**; it never writes
feature code or reviews — it delegates and decides.

| Role | Who | Job |
|---|---|---|
| **Orchestrator** | the loop session (Sonnet) | Pick the task, spawn agents, adjudicate findings, run the final build, commit. Keeps its own context lean by pushing detail into subagents. |
| **Coder** | Opus 4.8 subagent | Implement the one task. Lint + build must pass. |
| **Debugger** | Opus 4.8 subagent (fresh context) | **Run** the change — start/build the app, exercise the feature, catch RUNTIME bugs: exceptions, hydration warnings, console errors, FOUC, broken behavior. Dynamic verification. Returns repro + diagnosis. Does NOT edit code. |
| **Reviewer** | Opus 4.8 subagent (fresh context) | Review the coder's diff for correctness bugs + scope/quality. Static analysis. Returns severity-tagged findings. Does NOT edit code. |

## Each iteration

1. `cd` into this repo and read `.claude/loop-plan.md`.
2. Pick the **first** `[ ]` task. If none remain, report "PLAN COMPLETE" and stop the loop.
3. Mark it `[~]` and commit that marker (cheap checkpoint).
4. **Coder** — spawn an Opus 4.8 subagent with: exact task text + acceptance criteria;
   "follow CLAUDE.md / AGENTS.md; Next.js 16 — read node_modules/next/dist/docs before changed APIs";
   "run `npm run lint` and `npm run build`, both must pass"; "keep the diff minimal and scoped";
   "do NOT commit — leave changes in the working tree". Keep this agent's ID for follow-ups.
5. **Debugger** — when the coder returns, spawn an Opus 4.8 subagent (fresh context) that RUNS the app
   (build and/or `npm run dev`), exercises the changed feature, and hunts RUNTIME issues: uncaught
   exceptions, React hydration warnings, console errors, FOUC, and wrong behavior. Returns repro steps +
   diagnosis tagged P0/P1/P2. Does NOT edit code. Any P0 → bounce to the coder before the reviewer runs.
6. **Reviewer** — after the debugger is clear (no open P0), spawn a SEPARATE Opus 4.8 subagent (fresh context) that:
   - reads the working-tree diff (`git diff` + untracked files),
   - reviews ONLY this task's change for: correctness bugs, regressions, dark-mode/SEO/a11y issues
     relevant to the task, scope creep, and obvious simplifications,
   - returns findings tagged **P0** (must fix — bug/breakage), **P1** (should fix), **P2** (nice-to-have),
   - does NOT edit code.
   (Alternatively the orchestrator may run the `/code-review` skill, but a subagent keeps context clean.)
7. **Adjudicate** — orchestrator reads debugger + reviewer findings:
   - Any **P0** (and P1 worth fixing) → send them back to the **same coder agent** via SendMessage to fix.
     Re-run the debugger if the fix touches runtime behavior. Never commit on an open P0.
   - P2s → fold into the plan as a follow-up task only if meaningful; otherwise drop.
8. **Final gate** — orchestrator runs `npm run build` itself. Must be green.
9. Mark the task `[x]`, add a one-line note, append to the Done log with the commit sha. Commit.
10. End the iteration.

## Guardrails
- One task per iteration. Never batch.
- Coder and Reviewer are always **Opus 4.8**. Orchestration follows the session model (Sonnet when set).
- Commit locally only — never push or deploy unless the user explicitly says so.
- Stay on the `loop/autobuild` branch.
- If a task is ambiguous or needs a product decision, mark it `[~]`, write the question in the Done log,
  skip to the next independent task, and surface the question to the user.
- Reviewer findings the orchestrator overrides should be noted in the Done log (one line, with why).
