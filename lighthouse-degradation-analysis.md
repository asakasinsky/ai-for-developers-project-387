# Lighthouse Performance Degradation Analysis

## Summary

The latest Lighthouse CI runs (2026-06-24) show performance score **dropping from 1.0 to 0.83** in non-representative runs. A similar degraded run (0.59) appeared on 2026-06-23.

## Root Cause

**This is NOT a code regression.** The cause is CI runner CPU throttling variability:

| Report | Perf Score | BenchmarkIndex | CPU vs Baseline |
|---|---|---|---|
| Baseline (Jun 22, rep) | 1.0 | 4391 | 1× |
| Baseline (Jun 22, non-rep) | 1.0 | 4391 | 1× |
| Jun 23 (non-rep, degraded) | **0.59** | **366** | **12× slower** |
| Jun 23 (rep) | 1.0 | 2507 | 1.8× slower |
| Latest (non-rep, degraded) | **0.83** | **1967** | **2.2× slower** |
| Latest (rep) | 1.0 | 2338 | 1.9× slower |

## Resources — No Change

All runs serve identical assets:
- **4 requests** (1 document, 1 script, 1 stylesheet, 1 other) — unchanged
- **~95.7KB total** (~90KB JS, ~4KB CSS, ~519B document) — unchanged
- **No new requests** or heavier resources across any run

## Metrics That Degraded (in non-rep runs)

When CPU is throttled (benchmarkIndex drops), these metrics suffer:

| Metric | Baseline | Latest (degraded) |
|---|---|---|
| Total Blocking Time | 0ms | **537ms** |
| Time to Interactive | 1.29s | **2.42s** |
| LCP | 1.29s | 1.78s |
| Speed Index | 1.29s | 4.14s |

The main thread work breakdown confirms the bottleneck is CPU-bound script evaluation (712ms vs 57ms baseline) and style/layout (257ms vs 20ms).

## Actionable Recommendations

1. **Stabilize CI runner CPU**: Lighthouse's `benchmarkIndex` ranged from **366 to 4391** (12× variance). Options:
   - Pin to a specific runner type with guaranteed vCPU allocation (GitHub `ubuntu-latest` can vary)
   - Add a `benchmarkIndex` threshold check in CI — fail/retry if below e.g. 2000
   - Use Lighthouse's `--throttling.cpuSlowdownMultiplier` to normalize across environments
2. **Reduce JS bundle size** (proactive, not a regression fix): The 90KB JS bundle (`index-CIVfrDjm.js`) is the main culprit under slow CPU. Code-splitting or tree-shaking could help.
3. **Prerender critical content**: With a document of only 519 bytes, the page relies entirely on JS to render meaningful content. Adding SSR or prerendering would improve LCP on slow devices.
4. **Remove unused JavaScript**: Lighthouse flagged unused JS (`score=0`) in all runs — this is wasted parse/execute time that compounds on slow CPUs.
