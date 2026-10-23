# Working in this repo

- Keep this a small WXT + strict TypeScript Chrome Manifest V3 extension. Use platform APIs; add dependencies only when needed.
- Put extension entrypoints in `entrypoints/` and feature logic in `utils/`. Add future Drive/Gmail tools as focused features, not a speculative framework.
- Request the least permissions needed. No remote code, credential capture, analytics, or private Google API calls. Never commit HARs, tokens, document contents, or personal IDs.
- UI automation must fail safely: never click Move confirmations, delete files, change sharing, or navigate to unvalidated URLs. Keep injected functions self-contained.
- Test changed behavior; run `npm test`, `npm run typecheck`, and `npm run build`. Report authenticated-browser checks that were not performed.
