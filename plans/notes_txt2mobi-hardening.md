# txt2mobi Hardening Notes

- Primary risk: file renaming currently reads/removes/writes, which can overwrite user content after normalization.
- Secondary risk: package currently publishes no runtime code.
- Testing risk: existing tests overuse mocks and do not assert orchestrator behavior on empty inputs.
- Refactor target: prefer `fire-keeper` filesystem APIs over shell commands for portability and escaping.
- Fixed: package now builds to `dist/`, declares `bin`/`files`, and packs runtime artifacts.
- Fixed: rename flow now uses `rename()` with collision handling instead of delete-and-rewrite.
- Fixed: manga conversion skips empty sources; novel conversion checks existence per split file.
- Fixed: processor tests and converter tests now align with real `fire-keeper` basename behavior.
