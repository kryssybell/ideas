<!-- GENERATED FROM qgs-framework@1.0.0. Do not edit. Edit the framework form upstream and re-run sync-product.js. -->

# kryssy-qgs Task Management

**Version:** v1.0
**Authority:** Kryssy Bell (Approved-Kryssy-Bell)
**Status:** Authoritative for all task lifecycle, naming, and artefact structure across `kryssy-qgs` and every managed product.

---

## Contents

1. Task lifecycle states
2. Naming convention
3. Task spec structure
4. Completion report structure
5. Issue report structure
6. Audit report structure
7. Closure procedure
8. Cross-task and cross-product workflow

---

## Section 1: Task lifecycle states

| State | Spec location | Filename pattern |
|---|---|---|
| Drafted, unnumbered | `governance/Drafts/` | `<short-description>.md` |
| Active (currently running) | `governance/Tasks/` | `<Prefix>_Task_<NNNN>.md` |
| Queued (numbered, not yet started) | `governance/Tasks/` | `<Prefix>_Task_<NNNN>.md` |
| Closed | `governance/Tasks/` | `DONE_<Prefix>_Task_<NNNN>.md` |

The `governance/Tasks/` directory contains both active and closed task specs. Closure is signalled by the `DONE_` prefix on the filename, not by directory move (per Rule 10).

---

## Section 2: Naming convention

`<Prefix>_Task_<NNNN>` where:

- `<Prefix>` identifies the scope:
  - `kryssy-qgs` for QGS-instance-level tasks (e.g. spawning a new managed product, amending the QGS)
  - The product's CamelCase name for product-level tasks (e.g. `BybitTracker`, `CableScheduleAS3000`)
- `<NNNN>` is a four-digit sequential number, zero-padded.

**Numbering rules:**
- Sequential within each prefix
- Permanent once a task starts running (no renumbering)
- A task drafted but not run is unnumbered; numbering happens at start

**Examples:**
- `kryssy-qgs_Task_0001` — first task in this QGS instance
- `BybitTracker_Task_0042` — 42nd task in the Bybit tracker product

Each product carries its own counter. Cross-product tasks use the prefix of the originating scope.

---

## Section 3: Task spec structure

A task spec lives at `governance/Tasks/<Prefix>_Task_<NNNN>.md` and is derived from `Templates/Task_Spec_Template.md`.

Required sections:

1. **Heading and metadata:** task number, prefix, title, drafted date, started date (ISO), authority (Approved-Kryssy-Bell if any Master file change is in scope)
2. **Goal:** one paragraph stating the outcome the task must produce
3. **Scope:** what is in and what is explicitly out
4. **Master File Impact:** which `governance/Master/` (or `governance/QGS_shared/`) files this task changes (per Rule 9)
5. **Acceptance Criteria:** numbered list of testable pass/fail statements (per Rule 16 Gate 1)
6. **Schema Alignment Check:** the schema-touching tables enumerated, with a note that the pre-coding check will run (per Rule 16 Gate 2)
7. **Standing rules acknowledgement:** a checklist of the 16 rules with a one-line note for each, signed off as "in-scope" or "n/a"
8. **Risks and mitigations:** identified risks and what to do if each fires

Optional sections (added when relevant):

- **Out-of-scope follow-ups:** items that should NOT be done in this task but should be queued
- **Open questions:** points needing Kryssy Bell input before kickoff

---

## Section 4: Completion report structure

A completion report lives at `governance/Reports/<Prefix>_Task_<NNNN>_Complete.md` and is derived from `Templates/Completion_Report_Template.md`.

Required sections:

1. **Heading and metadata:** task number, completion date, total elapsed
2. **Summary:** one paragraph describing what shipped
3. **Acceptance Criteria evidence:** every AC from the spec, restated, with the evidence linking it to a real artefact (commit SHA, DB query result, smoke test result, Vercel deployment ID)
4. **Master Files Updated:** list of files actually changed, sections modified, reason. Or "No Master file changes." (per Rule 9)
5. **Push and Deploy Verification:** values from live `git` and live Vercel API (per Rule 8). Or "No code commits this task; not applicable."
6. **Deviations:** unforeseen obstacles encountered and how they were resolved (per Rule 16 Gate 4 — for genuine unknowns only, never time-saving choices)
7. **Standing-rules table:** every rule (1-16), checkbox for compliance, one-line evidence
8. **All Rules followed:** final checkbox (per Rule 16)

Per Rule 11, the report is written in strict order: code work → push → Vercel verification → Push and Deploy Verification populated → sanity check → closure write → closure commit.

Placeholder text is prohibited. If a value is not yet known, the field is omitted, not filled with "TBD".

---

## Section 5: Issue report structure

An issue report is produced when CC invokes Rule 3 (HALT). It lives at `governance/Reports/<Prefix>_Issue_<NNNN>_<short-description>.md`.

Required sections:

1. **Heading and metadata:** parent task number, issue date, severity (BLOCKER, CRITICAL, MAJOR, MINOR)
2. **Trigger:** what caused the HALT
3. **Diagnosis:** what investigation revealed
4. **Decision options:** list of options for Kryssy Bell to choose from, each with consequence summary
5. **Recommended option:** CC's recommendation with rationale
6. **Awaiting:** what Kryssy Bell needs to decide before the parent task can resume

---

## Section 6: Audit report structure

An audit report is produced when an end-of-period or trigger-based audit examines a body of work for compliance with rules and Master files. It lives at `governance/Audits/<Prefix>_Audit_<NNNN>.md`.

Required sections:

1. **Heading and metadata:** audit date, scope, auditor (CC or Kryssy Bell)
2. **Scope:** which tasks, files, or systems are in scope
3. **Findings:** numbered list, each with severity, evidence, recommendation
4. **Remediation actions:** the new tasks spawned to fix findings (numbered with full task numbers)
5. **Sign-off:** Approved-Kryssy-Bell if remediation involves Master file changes

---

## Section 7: Closure procedure

When a task closes:

1. The completion report is written per Section 4 and Rule 11
2. The completion report is committed
3. The task spec is renamed in place by prepending `DONE_` (per Rule 10)
4. The rename is committed in the same commit batch as the completion report
5. The next task's first action is to verify there are no undecorated `<Prefix>_Task_*` files for the same prefix (per Rule 10 verification rule)

---

## Section 8: Cross-task and cross-product workflow

**Single-product tasks** are the default. The task prefix matches the product, and Master File Impact is scoped to that product's `governance/Master/`.

**QGS-instance tasks** use the prefix `kryssy-qgs` and may touch:
- `kryssy-qgs/governance/Master/Master_File_Register_v1.0.md`
- `kryssy-qgs/governance/Master/QGS_Dossier_v1.0.md`
- `kryssy-qgs/governance/Managed_Products_Index.md`

QGS-instance tasks do NOT touch `governance/Master/Charter_v1.0.resolved.md`, `Rules_v1.0.resolved.md`, or `Task_Management_v1.0.resolved.md` directly. Those are gitignored generated artefacts. Changes to their content happen in `qgs-framework`.

**Framework tasks** apply to the `qgs-framework` repo and use the prefix `qgs-framework`. Bumping the framework version (e.g. v1.0.0 → v1.1.0) is a framework task with the version bump in the framework's `VERSION` file and a tagged release.

**Cross-product tasks** are rare. When needed, they use the prefix of the originating scope and explicitly enumerate the affected products in the spec.
