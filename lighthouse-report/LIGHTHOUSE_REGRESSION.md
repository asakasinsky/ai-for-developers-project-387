# Lighthouse Performance Regression Report

## Cold-start performance score (mobile)

| Date | Performance |
|---|---|
| 2026-06-22 | 100% |
| 2026-06-23 | 59% |
| 2026-06-24 | 83% |
| 2026-06-25 | 100% |
| 2026-06-26 | 88% |
| 2026-06-27 | 91% |
| 2026-06-28 | 100% |
| 2026-06-29 | 75% |
| 2026-06-30 | **93%** |
| **2026-07-01** | **86%** ⬇️ |

## What degraded

**Total Blocking Time (TBT) doubled: 220ms → 510ms**

This is the primary driver of the 93% → 86% drop. On the 2026-07-01 cold run, JavaScript main-thread work spiked despite an identical bundle.

| Metric | 2026-06-30 | 2026-07-01 | Delta |
|---|---|---|---|
| TBT | 220.5 ms | **510.0 ms** | **+289.5 ms (+131%)** |
| TTI | 2005 ms | **2253 ms** | **+248 ms** |
| FCP | 1728 ms | 1643 ms | −85 ms ✅ |
| LCP | 1728 ms | 1643 ms | −85 ms ✅ |
| Server response | 106 ms | 52 ms | −54 ms ✅ |

## What did NOT change

- **No new pages** — only one URL (`/`) is tested in all reports.
- **No extra requests** — stable at exactly 4 requests.
- **No heavier resources** — JS bundle is the same file (`index-CIVfrDjm.js`, ~90 KB), CSS identical (`index-BlTHxY5R.css`, ~4 KB).
- **Unused JS waste** unchanged at 46 KB (51% of bundle).

The root cause is **not** new code size or new dependencies — the `index-CIVfrDjm.js` hash is identical across both dates. The TBT increase suggests a change in how/when the JS initializes, or that the module evaluation path got longer (e.g., dynamic import, new async work in `useEffect`, or a third-party script changed behavior).

## Specific actionable fixes

1. **Audit `useEffect` / `useLayoutEffect` calls** — check for new async work added between the two dates that runs on mount. The TBT spike without a bundle size change points to synchronous work during hydration/initial render.

2. **Code-split lazy routes** — the app has 5 routes but bundles everything into one chunk. Route-based splitting (`React.lazy` + `Suspense`) would defer unused components.

3. **Tree-shake dead pages** — `AvailabilityPage.tsx` and `EventTypesPage.tsx` exist but are not imported in `App.tsx`. Remove them or lazy-load them.

4. **Reduce unused JS (46 KB is 51% of the bundle)** — run `vite-plugin-lighthouse` or `rollup-plugin-visualizer` to identify what's shipped but unused, then code-split or remove.

5. **Add `<meta name="description">`** — the SEO 82% is a persistent issue (no `<meta>` tag in `index.html`). This is not a regression but is a quick fix.

## Conclusion

The regression is in JavaScript **execution time**, not bundle size or network. Focus on synchronous initialization work in the React component tree.
