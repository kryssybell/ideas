<!-- GENERATED FROM qgs-framework@1.0.0. Do not edit. Edit the framework form upstream and re-run sync-product.js. -->

# kryssy-qgs Rules

**Version:** v1.0
**Authority:** Kryssy Bell (Approved-Kryssy-Bell)
**Status:** Authoritative. This file is the canonical source for all QGS-shared rules. CLAUDE.md files and rule sections of Master Dossiers reference this file. No rule wording lives elsewhere.

This rule set governs `kryssy-qgs` and every managed product under it. Seventeen rules. Each is referenced by its canonical number throughout task specs, completion reports, code comments, and Master files.

---

## Contents

1. Foundations (Rules 1-5)
2. Build-time standards (Rules 6-7)
3. Ship-time standards (Rules 8-9)
4. Closure standards (Rules 10-11)
5. Cross-cutting (Rules 12-13)
6. Product invariants (Rules 14-15)
7. Authority and Quality (Rule 16)
8. Operator diagnostics (Rule 17)

---

## Section 1: Foundations (Rules 1-5)

### Rule 1. File Preservation

Files are not deleted by default. CC may delete only files that are truly redundant: superseded code artefacts, `.bak_*` files after their replacement is verified working, and dead components confirmed unused after live grep.

Files that are NEVER deletable: database migrations, task specs, completion reports, files in `governance/Master/` or `governance/QGS_shared/`, and database objects (governed by Rule 4).

When uncertain whether a file qualifies as truly redundant, CC invokes Rule 3 (HALT) before deletion and provides a written justification. Post-hoc reporting of deletion is not acceptable; the HALT must occur before deletion.

### Rule 2. No Dashes Mid-Structured-Sentence Ending with a Full Stop

**Single test:** Is this a complete grammatical sentence ending with `.`, with a dash flanked by spaces and words inside it? If yes, rewrite. If no, leave it alone.

**Variants in scope of the pattern:** hyphen `-`, en-dash `–`, em-dash `—`, double-hyphen `--`.

**Bad (rewrite):** `The framework holds the rules — and the instance applies them.`
**Good (rewritten):** `The framework holds the rules. The instance applies them.`

**Out of scope (always fine):** titles, headings, labels, list items, table cells, button text, compound words, number ranges, file names, code identifiers — even if they contain a `.`.

### Rule 3. HALT Discipline

When any pre-work check fails, any rule is violated, or any mid-task obstacle has no obvious safe path, CC stops execution and produces an issue report at `governance/Reports/<Prefix>_Issue_<task>_<short>.md`.

The issue report explains the failure, lists Kryssy Bell's decision options, and ends the task at that point. CC does NOT take corrective action that expands the task's scope beyond approved bounds without explicit instruction.

Other rules referencing "HALT" mean: invoke this rule.

### Rule 4. Schema Safety

No data is destroyed without a verified replacement live. Old columns and tables are marked DEPRECATED via SQL COMMENT and dropped only in a separate later task, once reads are verified migrated.

**Prohibited without explicit Kryssy Bell sign-off:** DROP, TRUNCATE, destructive ALTER, RLS policy changes.

Schema-destructive operations attempted without sign-off invoke Rule 3 (HALT).

### Rule 5. Directory Inventory Authority

All file paths in code, scripts, documentation, task specs, and completion reports MUST match the directory structure documented in this instance's Charter (Section 2). If a path is not in the inventory, ask before using it.

---

## Section 2: Build-time standards (Rules 6-7)

### Rule 6. Mobile UX Standards

Mobile-first on every product UI. 44px minimum touch targets. 16px minimum body text. Components designed for 320px first; desktop enhancements via Tailwind breakpoints. Full-width child cards on mobile.

Each product carries a `MOBILE_CHECKLIST.md` at its repo root that governs the mobile verification gate. Mobile-impacting changes pass the checklist before close.

### Rule 7. ModalPortal Required for Modals

Every modal MUST render via the product's `ModalPortal` component (`src/components/common/ModalPortal.tsx` from `project-template`), which uses `createPortal(..., document.body)` to escape any parent stacking context.

**Prohibited:** direct `fixed inset-0` divs inside an app shell or layout (visually broken by design).

ModalPortal owns Escape handling, backdrop click handling, and stop-propagation. Do not add these separately.

Mandatory flows use `closeOnBackdropClick={false} closeOnEscape={false}`.

---

## Section 3: Ship-time standards (Rules 8-9)

### Rule 8. Push and Deploy Verification

Every code-change commit MUST be pushed to remote `main` in the same task that produces it. Local-only commits are not closure.

The completion report's Push and Deploy Verification section MUST contain values sourced from live `git` and live Vercel API:

- For each repo committed: local HEAD SHA, remote HEAD SHA post-push (must match), and verbatim `git push` output
- For any code change to a Vercel-deployed repo: Vercel deployment ID, status, source commit SHA (must match the pushed SHA), build duration, and current-production status

Vercel READY plus current-production confirmation must occur before close.

Tasks with no code commits state "No code commits this task; Push and Deploy Verification not applicable." in the same section.

### Rule 9. Master File Reconciliation

Every task spec MUST include a Master File Impact section identifying which canonical reference documents in `governance/Master/` (instance) or `governance/QGS_shared/` (product) the task affects and how.

The completion report's Master Files Updated section lists ONLY the Master files actually changed, with the sections modified and the reason. Tasks with zero Master file changes state "No Master file changes." as a single line.

A patch line is added to a Master file's header ONLY when content actually changed.

Note: files in `governance/QGS_shared/` are read-only at the product level. Changes to QGS-shared rules happen at the framework level (`qgs-framework`), not per-product.

---

## Section 4: Closure standards (Rules 10-11)

### Rule 10. Task Closure and DONE Prefix

When a task closes, the task spec is renamed in place by prepending `DONE_` to the filename. The task spec does not move directories.

**Artefact requiring the DONE prefix at closure:**
- The task spec (in `governance/Tasks/`)

**Artefacts NOT requiring the DONE prefix:**
- Completion reports (in `governance/Reports/`)
- Issue reports (in `governance/Reports/`)
- Audit reports (in `governance/Audits/`)
- Sub-reports, logs, proposals tied to the task

These artefacts are inherently post-closure by Rule 11 (Completion Report Write Order). They live at their canonical locations from creation onward; no rename at task close.

**Verification at next task start:** at the start of each new task, CC verifies the active task is the only undecorated `<Prefix>_Task_*` file (matching the new task's product prefix) in `governance/Tasks/`. Any prior-task spec for the same prefix without a `DONE_` prefix is a closure failure: CC invokes Rule 3 (HALT) and the new task's first action is to apply the missing `DONE_` prefix.

**Acceptable contents of `governance/Tasks/`:** the currently-running task's spec; queued-but-not-yet-running task specs; living documents; `DONE_`-prefixed task specs from any closed task.

### Rule 11. Completion Report Write Order

Completion reports are written in this strict sequence:

1. All code work complete
2. All repos committed and pushed
3. Vercel READY plus current-production confirmed (where applicable)
4. Push and Deploy Verification populated from live `git log` and live Vercel API
5. Pre-commit sanity check passes (zero placeholders, every field a real value)
6. Closure write: completion report written to `governance/Reports/<Prefix>_Task_<NNNN>_Complete.md`
7. Closure commit: report and any final code changes committed in the same commit

The Push and Deploy Verification fields MUST NOT be populated, even partially, before the corresponding push has occurred.

Placeholder text ("captured below", "to be filled", "pending") is prohibited anywhere in the report. If a value is not yet known, do not include that field yet.

---

## Section 5: Cross-cutting (Rules 12-13)

### Rule 12. Credential Storage Discipline

Literal credential values (API keys, tokens, passwords, service role keys, JWTs, private keys, OAuth secrets, DB connection strings with credentials) live in exactly two locations:

1. Developer-machine `.env.local` files (one per repo), gitignored
2. Vercel project environment variables, encrypted at rest by Vercel

Every other file references credentials by environment variable name only (e.g. `process.env.SUPABASE_SERVICE_ROLE_KEY`). Examples that must show value shape use clearly-non-real placeholders (e.g. `YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE`, `<redacted: see .env.local>`).

Violations invoke Rule 3 (HALT).

### Rule 13. No Em Dashes in User-Facing Copy

No em dashes in user-facing strings (UI text, marketing copy, error messages, email templates). Use a colon, parentheses, comma, or sentence break instead. This is enforced separately from Rule 2 because Rule 2 governs structured-sentence dashes everywhere, while Rule 13 governs the specific em-dash character in user-visible text.

**Out of scope:** internal documentation, governance documents, code comments, and CC-authored task artefacts.

---

## Section 6: Product invariants (Rules 14-15)

These rules apply per-product and may be tightened or relaxed by individual products via their Master Dossier. They are listed in the QGS-shared rules because they are common patterns across personal-scale products.

### Rule 14. Schema Migration Discipline

Every database schema change ships as a numbered migration in the product's `supabase/migrations/` directory. Migration files are immutable once committed; corrections happen in a new migration, not by editing an old one.

Migration naming: `0NNN_<short_description>.sql`. Sequential within each product.

Every migration creates or alters tables with explicit RLS policies. RLS-disabled tables are prohibited at the product level unless the Master Dossier explicitly justifies the exception.

### Rule 15. Single Theme Per Product

Each product ships with a single theme, defined in `src/contexts/ThemeContext.tsx` from `project-template`. Multi-theme switching machinery is not added unless the product's Master Dossier explicitly requires it.

Rationale: personal-scale products do not need theme-switching. Adding it preemptively introduces complexity that has to be maintained but rarely earns its weight.

---

## Section 7: Authority and Quality (Rule 16)

### Rule 16. Master File Authority and Task Quality Gates

This rule combines two concerns: authorisation for changes to Master files, and the quality gates every task must satisfy.

#### 16.1 Master File Edit Authorisation

Master files in `governance/Master/` are the canonical source of truth. They are NOT editable, movable, renameable, or deletable as part of routine task execution.

**Scope of "change" governed by this rule:**

Any of the following operations on any file or subfolder within `governance/Master/` requires Approved-Kryssy-Bell authorisation:

- Edit: changing the content of a Master file
- Create: adding a new Master file or subfolder under `governance/Master/`
- Move: moving a Master file out of `governance/Master/`
- Rename: changing the filename of any Master file
- Delete: removing a Master file from disk
- Reorder / restructure: changing the subfolder structure under `governance/Master/`

**Procedure:**

1. CC identifies a Master file change as necessary or desirable
2. CC invokes Rule 3 (HALT) and produces an issue report
3. The issue report contains: which Master file(s) are affected, the type of change, the exact proposed text or before-and-after diff, and the reason
4. Kryssy Bell reviews and either rejects or approves with the literal token `Approved-Kryssy-Bell`
5. The approval token must be quoted verbatim in the completion report

A single `Approved-Kryssy-Bell` covers a batch of related changes if the issue report enumerates them.

**Out of scope:** changes to `governance/QGS_shared/` (those happen via `qgs-framework` releases, not per-instance Rule 16).

#### 16.2 Task Quality Gates

Every task must satisfy four quality gates and meet production-grade quality. The "All Rules followed" checkbox at task closure is the final gate; it cannot be ticked unless every other gate has passed and every other rule (1-15) has been followed.

**Gate 1: Acceptance Criteria.** Every task spec carries an Acceptance Criteria section listing every testable requirement. Each AC is a single testable pass/fail statement. The AC list is rendered as a live TodoWrite checklist in chat at the start of the task.

**Gate 2: Schema-alignment check before coding.** For any task that touches DB reads or writes, CC runs a live query against the relevant Supabase project to enumerate actual columns, RLS policies, foreign keys, and indexes for every table the task will touch. The live state is compared against the schema documented in the product's `Technical_Reference_<Product>_v1.0.md`. Any discrepancy is HALT-worthy per Rule 3.

**Gate 3: Acceptance check at closure.** A check (manual or scripted) verifies: every AC has evidence (commit SHA, DB query result, smoke test result, Vercel READY confirmation); every Master file update listed in the spec is committed; every deploy is verified READY against the pushed commit SHA; all TodoWrite items are marked completed.

**Gate 4: Production-grade quality is non-negotiable.** Speed never trumps spec. If scope cannot be delivered to spec within available time, HALT under Rule 3 and surface to Kryssy Bell BEFORE shipping. Closure-report Deviation sections are for genuinely unforeseen obstacles only and never for time-saving choices.

**Closing checkbox: "All Rules followed".** The completion report's standing-rules table includes a final entry: "All Rules followed" with a checkbox. CC ticks it only after re-reading every rule (1-16) against the deployed task and confirming each has been honoured.

Violations invoke Rule 3 (HALT). A task that closes without all four gates passed and the "All Rules followed" checkbox ticked is a closure failure.

---

## Section 8: Operator diagnostics (Rule 17)

### Rule 17. Build Traceability

Every managed product under `kryssy-qgs` MUST surface a software-revision identifier that lets Kryssy Bell trace any running build back to (a) its exact GitHub commit and (b) its exact Vercel deployment, with no third system in between. This is operator-facing — required even on single-operator products where end-users are not a concern.

#### 17.1 Required artefacts per product

1. **Revision constants module:** `src/lib/version.ts` exporting at minimum:
   - `APP_REVISION_MINOR` — manually-bumped integer counter, starts at `100` for every product, increments on each operator-decided release.
   - `APP_REVISION_SUMMARY` — one-line plain-string summary of what `APP_REVISION_MINOR` represents.
   - `APP_REVISION` — the rendered string `0.<APP_REVISION_MINOR>-<short-sha>`, where `<short-sha>` is the first 7 chars of `process.env.VERCEL_GIT_COMMIT_SHA` (falls back to `dev` locally).

2. **About page:** `src/app/about/page.tsx`, reachable from the product's top nav as the tab labelled "About". Page renders, at minimum:
   - The product name and one-line description
   - The operator name (sourced from `governance/operator.yaml` placeholders at install time)
   - A footer showing: `APP_REVISION` (e.g. `0.100-a0964ac`), the current row's `APP_REVISION_SUMMARY`, the deployment ID from `process.env.VERCEL_DEPLOYMENT_ID` rendered as a clickable link to the Vercel deployment page, the short SHA rendered as a clickable link to the GitHub commit, and a one-line pointer to `governance/Revisions.md`.

3. **Revision table:** `governance/Revisions.md` at the product repo root governance folder. Append-only. One row per `APP_REVISION_MINOR` bump. Required columns:

   | Revision | Date (YYYY-MM-DD) | Git commit | Vercel deployment | Summary |

   Both "Git commit" and "Vercel deployment" cells MUST be markdown hyperlinks to the respective GitHub commit URL and Vercel deployment URL, not bare strings. The Summary cell mirrors `APP_REVISION_SUMMARY`.

#### 17.2 Bump procedure

Bumping `APP_REVISION_MINOR` is a two-commit flow per release:

1. **Commit 1 (release):** edit `src/lib/version.ts` (minor + summary), append a new row to `governance/Revisions.md` with the date and summary; leave the Git commit and Vercel deployment cells as `TBD` placeholders. Commit, push, wait for Vercel READY.
2. **Commit 2 (backfill):** once Vercel reports READY, replace the `TBD` placeholders with markdown hyperlinks to the actual commit and deployment from commit 1. Commit (markdown-only, no rebuild risk), push.

The chicken-and-egg of "a commit cannot contain its own SHA" is the reason for the two-commit pattern. The follow-up commit MUST happen in the same task as the bump; an unbacked `TBD` row is a Rule 11 closure failure.

#### 17.3 Format constraints

- The `APP_REVISION` string format `0.<minor>-<short-sha>` is fixed. No alternative formats. Do not embed a fake or fabricated "build number" sourced by counting deploys via the Vercel API; Vercel does not expose a monotonic build number and inventing one is prohibited under Rule 4 (no fabricated identifiers in operator-facing data).
- `APP_REVISION_MINOR` starts at `100` to leave headroom for a future `0.NN` pre-100 historical reconstruction without colliding with current values.
- Revision rows are immutable once their commit/deployment columns are populated. A correction is a new row, not an edit.

#### 17.4 Backfill for products that exist at the time Rule 17 lands

A product that already exists at the moment Rule 17 enters its `governance/QGS_shared/` is given a single grace task to reach compliance. The grace task: scaffold `src/lib/version.ts`, `src/app/about/page.tsx`, an "About" tab in the top nav, and `governance/Revisions.md` seeded with row `0.100`. This grace work satisfies Rule 17 without back-dating prior commits.

#### 17.5 Rationale

Build traceability is not a user-facing nicety; it is the operator's audit trail. When the operator sees odd behaviour on mobile, they need to know in one glance which commit and which deployment are running, with click-through to the source-of-truth UIs (GitHub for code, Vercel for build logs and env). The two identifiers together never collide, never need translation, and survive every Vercel UI redesign.

---

## Appendix: Rule numbering

This framework has seventeen rules. Rules 1–16 cover foundations, build-time and ship-time standards, closure, cross-cutting concerns, product invariants, and authority. Rule 17 (Build Traceability) covers the operator-facing audit trail that links every running build to its exact GitHub commit and Vercel deployment. Rule 17 is operator-facing only and applies as a cross-product invariant across all managed products.
