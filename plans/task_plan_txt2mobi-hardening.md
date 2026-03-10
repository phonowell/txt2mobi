# txt2mobi Hardening Plan

Status: completed

Capability assessment:
- `plan-implementation`: applicable, used to break this multi-file repair into tracked steps.
- `review-code-changes`: applicable after implementation for final quality pass.
- No skill lifecycle gap found. No extra skill search/audit needed.

Scope:
- Fix package/build/publish viability.
- Remove destructive rename behavior and shell-based path handling.
- Harden manga/novel conversion flow around empty inputs and stale cache state.
- Replace weak tests with assertions that cover real failure modes.

Plan:
1. Repair package scripts and publish surface. [done]
2. Refactor file cleaning and conversion orchestration to avoid data loss. [done]
3. Harden processor and Kindle helpers for empty/invalid inputs. [done]
4. Rewrite and extend tests around renamed files, skipped conversions, and packaging. [done]
5. Run lint/build/tests, review diff, and trim remaining code smells. [done]

Verification:
- `pnpm lint`
- `pnpm build`
- `pnpm test`
- `npm pack --dry-run`
