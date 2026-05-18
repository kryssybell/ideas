<!-- GENERATED FROM qgs-framework@1.0.0. Do not edit. Edit the framework form upstream and re-run sync-product.js. -->

# <Prefix>_Task_<NNNN>: Completion Report

**Task:** <Prefix>_Task_<NNNN> — <title>
**Started:** <YYYY-MM-DD HH:MM local>
**Closed:** <YYYY-MM-DD HH:MM local>
**Total elapsed:** <HH:MM>
**Operator:** Kryssy Bell

---

## Summary

One paragraph describing what shipped. Link to spec at `governance/Tasks/DONE_<Prefix>_Task_<NNNN>.md`.

---

## Acceptance Criteria evidence

Every AC from the spec, restated, with the evidence linking it to a real artefact.

| # | AC | Evidence | Status |
|---|---|---|---|
| 1 | <AC1 from spec> | <commit SHA / DB query / smoke test / Vercel deployment ID> | done |
| 2 | <AC2 from spec> | <evidence> | done |

---

## Master Files Updated

Per Rule 9.

| File | Sections modified | Reason |
|---|---|---|
| <path> | <section> | <reason> |

Or: "No Master file changes."

---

## Push and Deploy Verification

Per Rule 8. Values from live `git` and live Vercel API.

**Repos committed:**

| Repo | Local HEAD SHA | Remote HEAD SHA post-push | Match? |
|---|---|---|---|
| <repo> | <sha> | <sha> | yes |

**`git push` output (verbatim):**

```
<paste here>
```

**Vercel deployment (per product touched):**

| Project | Deployment ID | Status | Source SHA | Build duration | Current production? |
|---|---|---|---|---|---|
| <product> | <id> | READY | <sha matches push> | <duration> | yes |

Or: "No code commits this task; Push and Deploy Verification not applicable."

---

## Deviations

Per Rule 16 Gate 4. For genuine unforeseen obstacles only. NEVER for time-saving choices.

- <deviation, what was unforeseen, what was done, why this was the only safe path>

Or: "None."

---

## Standing Rules Compliance

| # | Rule | Followed? | Evidence (one line) |
|---|---|---|---|
| 1 | File Preservation | yes | <evidence> |
| 2 | No Dashes Mid-Sentence | yes | <evidence> |
| 3 | HALT Discipline | yes | no HALT triggered |
| 4 | Schema Safety | yes | <evidence> |
| 5 | Directory Inventory Authority | yes | all paths verified |
| 6 | Mobile UX Standards | yes / n/a | <evidence> |
| 7 | ModalPortal Required | yes / n/a | <evidence> |
| 8 | Push and Deploy Verification | yes | see section above |
| 9 | Master File Reconciliation | yes | see Master Files Updated section |
| 10 | Task Closure and DONE Prefix | yes | DONE_ applied to spec post-close |
| 11 | Completion Report Write Order | yes | written after push and Vercel READY |
| 12 | Credential Storage Discipline | yes | no literal credentials in any committed file |
| 13 | No Em Dashes in User-Facing Copy | yes / n/a | <evidence> |
| 14 | Schema Migration Discipline | yes / n/a | <migration filename> |
| 15 | Single Theme Per Product | yes / n/a | <evidence> |
| 16 | Master File Authority and Quality Gates | yes | <Approved-Kryssy-Bell or n/a> |

---

## All Rules followed

- [ ] All 16 rules above followed.

This checkbox is ticked by CC only after re-reading every rule against the deployed task and confirming each has been honoured. The task does not close until ticked.
