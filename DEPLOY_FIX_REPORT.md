# Deploy Fix Report — CVE-2026-102989 / GHSA-qx66-fv34-fjm8

**Date:** 2026-10-09  
**Goal:** Upgrade `@tanstack/start-server-core` from 1.169.17 to ≥ 1.169.39 to unblock Vercel deploy.

---

## Lockfiles Present

- `package-lock.json` ✅ (edited)
- `bun.lock` ⚠️ (present but NOT edited per task rules)

---

## npm ls @tanstack/start-server-core

```
tanstack_start_ts@ /home/osallam/public/cherish-code-cloud
└─┬ @tanstack/react-start@1.168.60
  ├─┬ @tanstack/react-start-server@1.167.46
  │ └── @tanstack/start-server-core@1.169.39 deduped
  ├─┬ @tanstack/start-plugin-core@1.171.49
  │ └── @tanstack/start-server-core@1.169.39 deduped
  └── @tanstack/start-server-core@1.169.39
```

---

## git diff --stat

```
 package-lock.json     | 344 ++++++++++++++++++++++++--------------------------
 package.json          |   4 +-
 src/routes/__root.tsx |   4 +-
 3 files changed, 169 insertions(+), 183 deletions(-)
```

---

## git diff package.json

```diff
diff --git a/package.json b/package.json
index 5ebfc7b..a295493 100644
--- a/package.json
+++ b/package.json
@@ -20,8 +20,8 @@
     "@supabase/supabase-js": "^2.110.7",
     "@tailwindcss/vite": "^4.2.1",
     "@tanstack/react-query": "^5.101.1",
-    "@tanstack/react-router": "^1.170.16",
-    "@tanstack/react-start": "^1.168.26",
+    "@tanstack/react-router": "^1.170.41",
+    "@tanstack/react-start": "^1.168.60",
     "@tanstack/router-plugin": "^1.168.18",
     "class-variance-authority": "^0.7.1",
     "clsx": "^2.1.1",
```

---

## npx tsc --noEmit (last 15 lines)

```
npm notice run npx
npm notice run 'tsc' --noEmit
```

*(No errors — clean exit)*

### Source fix (upgrade-caused breakage only)

`src/routes/__root.tsx` line 39: `ErrorComponentProps.error` is now typed `unknown` in the new router version.

```diff
-function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
+function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
   const router = useRouter();
   useEffect(() => {
-    reportLovableError(error, { boundary: "tanstack_root_error_component" });
+    reportLovableError(error instanceof Error ? error : new Error(String(error)), { boundary: "tanstack_root_error_component" });
```

---

## npm run build (last 15 lines)

```
.output/server/_libs/supabase__realtime-js+unenv.mjs                78.21 kB │ gzip:  20.00 kB
.output/server/_libs/supabase__postgrest-js.mjs                    105.41 kB │ gzip:  21.66 kB
.output/server/_libs/@supabase/storage-js+[...].mjs                118.94 kB │ gzip:  22.11 kB
.output/server/_libs/supabase__auth-js+tslib.mjs                   303.17 kB │ gzip:  60.63 kB
.output/server/_libs/@tanstack/react-router+[...].mjs              757.63 kB │ gzip: 160.62 kB

✓ built in 483ms
[nitro] ℹ Using auto generated worker name: o-sallam-eidgrouplandingpage
[nitro] ℹ Generated .output/server/wrangler.json
[nitro] ℹ Generated .wrangler/deploy/config.json
[nitro] ℹ Generated .output/public/_headers
[nitro] ℹ Generated .output/nitro.json

[nitro] ✔ You can preview this build using npx vite preview
[nitro] ✔ You can deploy this build using npx nitro deploy --prebuilt
```

---

## npm audit --omit=dev

6 remaining vulnerabilities (2 moderate, 4 high). **None involve `@tanstack/start-server-core`.**  
No critical issues. All fixable via `npm audit fix` if desired.

| Package | Severity | Advisory |
|---|---|---|
| baseline-browser-mapping ≥2.0.0 <2.11.0 | moderate | GHSA-w5vr-8v7q-w6rv |
| browserslist ≤4.28.6 | high | GHSA-c83g-rgw3-j3cx, GHSA-73wf-gq98-2v4g |
| js-yaml 4.0.0 – 4.3.1 | high | GHSA-5p4m-2wfm-xmqj, GHSA-2883-xcg3-v3hh |
| nanoid <3.3.18 | high | GHSA-2v37-7h3g-55p8 |
| postcss ≤8.5.22 | moderate | GHSA-fxqj-rqcc-2cmp |
| source-map-js 1.0.0 – 1.2.1 | high | GHSA-68fv-2mgg-jv7q |

---

## Summary

- `@tanstack/start-server-core` upgraded from **1.169.17 → 1.169.39** ✅  
- No `overrides` entry was needed — direct package upgrades were sufficient.  
- One source file changed (`src/routes/__root.tsx`): minimal type fix for `error: unknown`.  
- Build passes. No `/admin` or Supabase logic touched.  
- `DANGEROUSLY_DEPLOY_VULNERABLE_TANSTACK_START_XSS` was NOT set.
