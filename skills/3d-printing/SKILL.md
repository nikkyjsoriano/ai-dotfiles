---
name: 3d-printing
description: Edit and prepare Nikky's STL and 3MF models, organize printing projects, and record transformations and physical fit feedback. Use for grips, level holders, clips, trays, boxes, and slicer preparation.
---

# 3D printing

Library: `/Users/nikkysoriano/Documents/3D Prints`.

## Find the context

Read the library's `AGENTS.md`, `Guidance/START HERE.md`, and the relevant `Transformations/<project>/RECORD.md`. Use [references/library.md](references/library.md) to find projects and history. Current project records take precedence over historical chat summaries; distinguish proposals, generated files, digital checks, and physical tests.

## Edit and verify

- Prefer lightweight scripting; keep scripts in scratch space, not the library.
- Establish units, axes, mounting face, and protected interfaces. Preview ambiguous directions or attachments before committing to geometry.
- Preserve originals, previous variants, and successful fits. Save descriptive outputs under `Transformations/<project>/<date>-<revision>/` with previews when useful.
- Reload exported meshes; check topology, dimensions, clearances, and untouched regions. Digital checks do not prove physical fit or strength. Read [references/geometry.md](references/geometry.md) for relevant design lessons.

## Record and deliver

Use `Guidance/TRANSFORMATION TEMPLATE.md`. Record input/output paths and SHA-256, units, parent revision, ordered operations and exact parameters, tool versions, before/after dimensions, checks and limitations. Keep measurements separate from estimates and physical feedback tied to its variant. Update the project record during the task; link the model, preview, and record at completion. Store reproducibility details in Markdown, not generating scripts or JSON reports.

## Prepare a print

Open requested STLs with macOS `open` and a quoted path. Preserve manual plate arrangements; check contact face, overlaps, supports, selected plate, and actual filament source. Use the existing `Beyblade X/Print Queue/QUEUE.md`. Read `Guidance/WORKFLOW.md` for slicing lessons. Preparation does not authorize starting a print; historical cleanup requests do not authorize deletion. For explicitly requested cleanup, retain originals and final models, document reproducibility and recovery paths, and move authorized intermediates to recoverable Trash.
