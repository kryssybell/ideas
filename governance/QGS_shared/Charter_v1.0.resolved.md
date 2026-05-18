<!-- GENERATED FROM qgs-framework@1.0.0. Do not edit. Edit the framework form upstream and re-run sync-product.js. -->

# kryssy-qgs Charter

**Version:** v1.0
**Authority:** Kryssy Bell (Approved-Kryssy-Bell)
**Status:** Authoritative. Every task answers to this Charter. If a task's output diverges from this Charter, the task is wrong, not the Charter.

---

## Contents

1. Conceptual Model
2. Repository Structure
3. Master File Inventory
4. Task System
5. Authority and Amendment

---

## Section 1: Conceptual Model

### 1.1 The QGS instance

`kryssy-qgs` is one operator's instance of the personal-projects Quality Governance System (QGS). It governs a set of managed products built by Kryssy Bell, enforcing a consistent task lifecycle, rule set, and reporting discipline across all of them.

The QGS is a *framework*. The instance (`kryssy-qgs`) is the operator's resolved copy. The framework lives upstream in the `qgs-framework` repo with `{{placeholder}}` content; this resolved Charter is what governs day-to-day work in the instance.

### 1.2 Managed products

Each managed product is an independent SaaS or tool with its own:
- GitHub repository
- Supabase project (separate database, separate RLS, separate credentials)
- Vercel deployment
- User base (where applicable)

Products are governed by this QGS instance from outside. The QGS-shared rules are pulled into each product at install time as read-only files in `governance/QGS_shared/`. Product-specific Master files (Master_Dossier, Technical_Reference, Master_File_Register) live committed inside each product's own `governance/Master/` directory.

The current set of managed products is listed in `kryssy-qgs/governance/Managed_Products_Index.md`.

### 1.3 Where product detail lives

This Charter does not describe product features, market positioning, or pricing. Per-product detail lives in the respective Master Dossier inside that product's repo:

- `<product>/governance/Master/Master_Dossier_<ProductName>_v1.0.md`

---

## Section 2: Repository Structure

### 2.1 Five repositories

| Repo | GitHub | Role |
|---|---|---|
| `qgs-framework` | `kryssybell/qgs-framework` | Source-of-truth framework forms, scripts, Templates |
| `kryssy-qgs` | `kryssybell/kryssy-qgs` | This operator's resolved instance; governance Tasks/Reports/Audits |
| `project-template` | `kryssybell/project-template` | Reusable Next.js + Supabase boilerplate cloned to spawn new products |
| Each managed product | `kryssybell/<product>` | Standalone product code + product-specific Master files |

Products consume `qgs-framework` as a pinned git-URL devDependency. The dependency is declared as `file:../qgs-framework` during initial scaffolding and swapped to `github:kryssybell/qgs-framework#<tag>` before each consumer's first commit.

### 2.2 Top-level layout of `kryssy-qgs/`

```
kryssy-qgs/
├── CLAUDE.md
├── START.md
├── NEW_CLAUDE_INSTANCE.bat
├── package.json
├── qgs.config.json
├── governance/
│   ├── operator.yaml                     The single identity file
│   ├── Master/
│   │   ├── Charter_v1.0.resolved.md      GENERATED, gitignored
│   │   ├── Rules_v1.0.resolved.md        GENERATED, gitignored
│   │   ├── Task_Management_v1.0.resolved.md  GENERATED, gitignored
│   │   ├── Master_File_Register_v1.0.md  HAND-AUTHORED, COMMITTED
│   │   └── QGS_Dossier_v1.0.md           HAND-AUTHORED, COMMITTED
│   ├── Templates/                        GENERATED, gitignored
│   ├── Managed_Products_Index.md
│   ├── Tasks/
│   ├── Reports/
│   ├── Logs/, Audits/, Issues/, Drafts/, Decisions/, Onboarding/, Performance/, Product_Roadmap/, Reviews/, Backup_Drills/, Compliance_Evidence/, Security_Incidents/, Support_Archive/, Testing/, User_Research/, Vendor_Docs/
└── scripts/
```

### 2.3 Per-product layout

Each managed product carries a `governance/` directory with:
- `Master/` — product-specific Master files (Master_Dossier, Technical_Reference, Master_File_Register), hand-authored and committed
- `QGS_shared/` — Charter, Rules, Task_Management resolved files generated from `qgs-framework` at install time, gitignored
- `Templates/` — Task Spec, Completion Report, Issue Report, Audit Report, generated at install time, gitignored
- `Templates_local/` — optional product-specific templates, committed if present
- `Tasks/`, `Reports/`, `Issues/` — per-product task lifecycle artefacts

Anything not listed here does not exist in the QGS layout unless added through a Charter amendment.

---

## Section 3: Master File Inventory

### 3.1 QGS-shared Master files (live in `qgs-framework`, resolved into `kryssy-qgs` and each product)

| Basename | Source of truth | Resolved location |
|---|---|---|
| `Charter_v1.0` | `qgs-framework/governance/Master/Charter_v1.0.framework.md` | `kryssy-qgs/governance/Master/Charter_v1.0.resolved.md` and `<product>/governance/QGS_shared/Charter_v1.0.resolved.md` |
| `Rules_v1.0` | `qgs-framework/governance/Master/Rules_v1.0.framework.md` | Same pattern |
| `Task_Management_v1.0` | `qgs-framework/governance/Master/Task_Management_v1.0.framework.md` | Same pattern |

These files are *generated*, *gitignored*, and *regenerated on every `npm install`*. Direct edits cannot be committed (a precommit hook fails on divergence).

### 3.2 Instance-specific Master files (hand-authored in `kryssy-qgs`, committed)

| Basename | Purpose |
|---|---|
| `Master_File_Register_v1.0.md` | Index of QGS-shared Master files in this instance |
| `QGS_Dossier_v1.0.md` | Describes this QGS instance, its managed-products pattern, the `project-template` strategy |

### 3.3 Per-product Master files (hand-authored in each product, committed)

| Basename | Purpose |
|---|---|
| `Master_Dossier_<ProductName>_v1.0.md` | What the product is, its target user, its scope |
| `Technical_Reference_<ProductName>_v1.0.md` | Schema, RLS, app structure, live |
| `Master_File_Register_<ProductName>_v1.0.md` | Tier-2 register listing this product's Master files only |

---

## Section 4: Task System

### 4.1 Task lifecycle

| State | Spec location | Reports location |
|---|---|---|
| Drafted, unnumbered | `governance/Drafts/` | n/a |
| Active | `governance/Tasks/` | `governance/Reports/` |
| Closed (DONE_) | `governance/Tasks/DONE_<spec>.md` | `governance/Reports/DONE_<report>.md` |

Closed task and report files remain in their canonical location. Closure is signalled by prepending `DONE_` to the filename.

### 4.2 Task naming

`<Prefix>_Task_<NNNN>` where `<Prefix>` identifies the product or governance scope. Numbering is sequential within each prefix and permanent once a task starts running.

Examples:
- QGS-level task in `kryssy-qgs`: `kryssy-qgs_Task_0001`
- Product-level task in a Bybit tracker product: `BybitTracker_Task_0001`

### 4.3 Task artefacts

Every task produces:
- A spec at `governance/Tasks/<Prefix>_Task_<NNNN>.md`, derived from `Templates/Task_Spec_Template.md`
- A completion report at `governance/Reports/<Prefix>_Task_<NNNN>_Complete.md`, derived from `Templates/Completion_Report_Template.md`

Optionally:
- One or more issue reports at `governance/Reports/<Prefix>_Task_<NNNN>_Issue_<N>.md`
- An audit report at `governance/Audits/<Prefix>_Audit_<NNNN>.md`

### 4.4 Task quality gates (Rule 16)

Every task carries:
1. Acceptance Criteria rendered as a TodoWrite checklist visible in chat throughout the task
2. A pre-task schema-alignment check against the relevant Technical Reference file (HALT on mismatch)
3. A closing acceptance check (manual or scripted)
4. The "All Rules followed" final checkbox in the completion report ticked

Speed never trumps spec. Production-grade quality is non-negotiable.

---

## Section 5: Authority and Amendment

### 5.1 Authority

This Charter is authoritative for `kryssy-qgs`. The token `Approved-Kryssy-Bell` is required, quoted verbatim, before any change to a file in `kryssy-qgs/governance/Master/` or `qgs-framework/governance/Master/`.

### 5.2 Amendment

Changes to this Charter happen via:
1. A versioned release of `qgs-framework` (for changes to the framework-form Charter)
2. A consumer-side `npm install` (for the instance to pick up the new resolved version)

A Charter amendment is a numbered task with a completion report.

### 5.3 Conflict resolution

When a Master file conflicts with this Charter, the Charter wins and the Master file is corrected.

When a CLAUDE.md file conflicts with a Master file, the Master file wins and the CLAUDE.md is corrected.

When the framework form conflicts with a resolved file, the framework form is the source of truth and the resolved file is regenerated.
