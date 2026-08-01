# MurakMed AI — Mobile-Friendly Analysis Report

**Project:** `v2_231225_-of-murakmed-ai---tetum` (MurakMed AI – Tetum, medical symptom checker)
**Stack:** React 19 + TypeScript 5.8 + Vite 6.2 + Tailwind (via CDN) + Gemini AI
**Targets:** iOS Safari, Android Chrome, iPadOS / Android tablets, desktop browsers
**Build:** ✅ `vite build` passes (exit 0) — `dist/assets/index-CSY0WBun.js` 404 KB (108 KB gzip)
**Analysis date:** 2026-08-01

> Note on scope: This is a React web app, not a native (Swift / Kotlin) or React Native codebase. The review covers mobile-web responsiveness only. True native behavior on iOS/Android would require Capacitor, a PWA install path, or a React Native port.

---

## 1. Executive Summary

**Overall mobile readiness: 7/10 — solid foundation, several real-world device gaps.**

| Area | Status | Notes |
|---|---|---|
| Tailwind responsive breakpoints | ✅ Good | `sm:`, `md:`, `lg:` used consistently |
| Mobile-first layout | ✅ Good | Single-column collapses work well |
| Tablet layout | ⚠️ Mixed | Patient/doctor views OK; Login/Signup still feel phone-sized |
| Touch targets | ⚠️ Mixed | Mostly OK (40–48 px), some < 32 px icons |
| Safe-area / notch handling | ❌ Missing | No `viewport-fit=cover`, no `env(safe-area-inset-*)` |
| Orientation handling | ⚠️ Mostly OK | Landscape on phones works; iPad landscape OK |
| iOS input zoom | ❌ Bug | `<input type="text">` font-size 14 px triggers iOS auto-zoom |
| Date input on mobile | ❌ UX | Native iOS picker can be awkward at small sizes |
| Touch gestures | ⚠️ Limited | No swipe-to-close on dropdown menu |
| Bundle / performance | ✅ Good | 404 KB / 108 KB gzip — reasonable for the feature set |
| Accessibility (a11y) | ⚠️ Needs work | Missing aria-labels, focus traps in modal-like menu |
| PWA / offline | ❌ Absent | No manifest, no service worker |
| Dark mode | ✅ Good | `prefers-color-scheme` + manual toggle, persisted |
| i18n RTL | ⚠️ N/A | Tetum/English/Indonesian — none are RTL |
| Print stylesheet (cert) | ✅ OK | `@media print` rules present |

---

## 2. Build & Verification

```
$ npm run build
✓ 1721 modules transformed.
dist/index.html                  1.18 kB │ gzip:   0.61 kB
dist/assets/index-CSY0WBun.js  404.24 kB │ gzip: 108.26 kB
✓ built in 21.15s
```

Build is clean. **No unit/integration/E2E tests exist** — there are no `*.test.ts`, `vitest.config`, or `playwright.config` files. **Recommendation:** add Vitest + React Testing Library for component tests, plus Playwright for cross-viewport smoke tests.

---

## 3. Critical Issues (fix first — block real-device use)

### 🔴 C1. iOS Safari auto-zoom on form focus
**Files:** `Login.tsx`, `Signup.tsx`, `ProfileEdit.tsx`, `ResetPassword.tsx`, `SymptomInput.tsx`
**Issue:** All text/email/password inputs use `text-base` (16 px) on mobile or `text-sm` (14 px) on Tailwind defaults below `md`. iOS Safari zooms in whenever an input font-size is < 16 px and the page is not at native scale.
**Fix:** Add `text-base` (or explicit 16 px) to every `<input>`, `<select>`, `<textarea>`. Example:

```tsx
<input className="... text-base sm:text-base ..." />
```

### 🔴 C2. No safe-area / notch handling
**Files:** `index.html`, `App.tsx`, `components/Header.tsx`
**Issue:** The sticky header (Header.tsx:74 — `sticky top-0 z-50`) and bottom footer will be hidden under the iPhone notch / Dynamic Island / Android camera cutouts in landscape. No `viewport-fit=cover` in the viewport meta; no `env(safe-area-inset-*)` in CSS.
**Fix:**
1. `index.html:5` — change viewport to:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=5.0" />
   ```
2. Add to `index.html` style:
   ```css
   html, body { padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }
   ```
3. Header.tsx:74 — add `pt-[env(safe-area-inset-top)]` to the sticky wrapper, or set the inner `header` element's `padding-top` to use safe-area.

### 🔴 C3. Dropdown menu has no focus trap / no Escape-to-close / no swipe-to-dismiss
**Files:** `components/Header.tsx:103-227`
**Issue:** The hamburger menu on mobile is a click-only popover with no keyboard nav, no focus management, and no touch gesture to dismiss. Tapping outside closes it (mousedown handler), but on iOS this is often missed when tapping a button at the menu's edge. In landscape the menu can extend off-screen.
**Fix:**
- Add `keydown` handler for `Escape` to close.
- Use `<dialog>` or focus-trap library for keyboard users.
- Position `max-h-[80vh] overflow-y-auto` so it never extends past viewport.
- Consider closing the menu on `route` change automatically (currently relies on each click handler).

### 🔴 C4. Print-to-PDF certificate opens a popup (often blocked on mobile)
**Files:** `components/ResultsDisplay.tsx:108-141`
**Issue:** `window.open(...)` to print the medical certificate is blocked by most mobile browsers by default and produces a poor experience. Mobile Safari and Chrome on Android frequently suppress popups.
**Fix:**
- Use `window.print()` directly on the main document with a print-only stylesheet (preferred for mobile).
- Or render the certificate inline behind a modal and trigger `print()` from there.
- Currently `printWindow.print()` is called with `setTimeout(..., 800)` — fragile on slow mobile networks.

### 🔴 C5. No service worker / offline / "Add to Home Screen"
**Files:** `index.html`, `vite.config.ts`
**Issue:** Medical info entry needs to work in low-connectivity clinics. There is no PWA manifest, no service worker, no offline fallback. Loading Tailwind from `cdn.tailwindcss.com` (index.html:7) also means offline = blank page.
**Fix:**
- Add a `manifest.webmanifest` and register a service worker (e.g. via `vite-plugin-pwa`).
- Self-host Tailwind in the Vite build instead of CDN for offline + smaller payload + CSP safety.
- Add an Apple touch icon and `<meta name="apple-mobile-web-app-capable" content="yes">` for "Add to Home Screen".

---

## 4. High-Priority Issues (degrade real-world UX)

### 🟠 H1. Tap targets smaller than 44 × 44 px
**Files:** Multiple
- `Header.tsx:113` — Menu hamburger button: `p-2.5` + `w-5 h-5` icon → ~40 × 40 px touch surface. Just below Apple's 44 pt minimum.
- `Header.tsx:230` — Dark-mode toggle: `p-2.5` + `w-5 h-5` → ~40 × 40 px.
- `ResultsDisplay.tsx:312` — Call-doctor round button: `p-2.5` + `Phone` icon `w-5 h-5` → 40 × 40.
- `SpecialistDashboard.tsx:454` — Patient-history icon button: `p-3` + `w-4 h-4` → 44 × 44 ✅ OK.
- `AppointmentScheduler.tsx:98` — Close `X` button: `p-2` + `w-5 h-5` → 36 × 36 px — **too small**.
- `FAQ.tsx:55` — Accordion chevron container: `p-1` + `w-5 h-5` → 28 × 28 — **too small** for thumb.
- `Dashboard.tsx:124-145` — `ActionCard` is full-width so fine; inner icon `p-4` (48 × 48) ✅.
- `SymptomInput.tsx:220` — Quick-add symptom tags: `px-3 py-1.5` → ~28 px tall — **borderline**.
- `PatientHistory.tsx:315` — Chevron indicator: `p-3` → 48 × 48 ✅.
- `AuscultationTest.tsx:45` — Close button: `p-2` + `w-5 h-5` → 36 × 36 — too small.

**Fix:** Use `min-h-[44px] min-w-[44px]` utility or set `p-3` minimum on every interactive icon button. On Tailwind, `min-h-11 min-w-11` = 44 px.

### 🟠 H2. Specialist dashboard sidebar disappears on tablet portrait
**Files:** `SpecialistDashboard.tsx:532`
**Issue:** Sidebar `w-full lg:w-80` collapses to full-width below `lg` (1024 px). On iPad portrait (768–1024 px) the sidebar stacks below appointments, pushing the page very long.
**Fix:** Use `md:w-80` (768 px breakpoint) instead of `lg:w-80`, or move the sidebar to a tab pattern on smaller widths.

### 🟠 H3. Date input renders awkwardly on mobile
**Files:** `Signup.tsx:184`, `ProfileEdit.tsx:193`, `SymptomInput.tsx:120`
**Issue:** `<input type="date">` shows different UIs per platform — native iOS wheel, Android modal, desktop picker. No `inputmode`, no `pattern`, no placeholder hint.
**Fix:** Add `max={new Date().toISOString().split('T')[0]}` to prevent future dates, and add a placeholder for clarity. Consider a custom date picker for consistent cross-platform UX.

### 🟠 H4. Some `<select>` dropdowns are not mobile-friendly
**Files:** `SymptomInput.tsx:142-152`, `Signup.tsx:194-206`, `ProfileEdit.tsx:203-213`
**Issue:** Tailwind `<select>` uses the native picker which works but looks broken with custom styling. On iOS the picker is full-screen modal — fine; on Android it's a dialog. The visual contrast is inconsistent.
**Fix:** Acceptable as-is (native pickers are best on mobile). Just ensure `appearance-none` isn't accidentally applied.

### 🟠 H5. Text scaling / dynamic type not supported
**Files:** App-wide
**Issue:** No `text-base` baseline — many labels use `text-[10px]`/`text-xs`/`text-sm`. iOS Dynamic Type and Android font-scale users will see clipped or wrapped labels.
**Fix:** Use `rem` units where possible; set `:root { font-size: clamp(14px, 0.85rem + 0.5vw, 18px); }` or add a `data-text-scale` toggle.

### 🟠 H6. No focus-visible styles
**Files:** App-wide
**Issue:** Buttons reset focus with `focus:outline-none` and only add `focus:ring-2 focus:ring-blue-500` on inputs (not all buttons). Keyboard / switch-control users on iOS will lose focus indicator.
**Fix:** Add `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2` to all `<button>` elements.

### 🟠 H7. Patient-history record detail view doesn't scroll well in landscape
**Files:** `PatientHistory.tsx:60-208`
**Issue:** The detail view has `p-8`, fixed header, and lots of content. On iPhone landscape (~375 × 667 pt usable) the certificate sub-section may push below the fold with no scroll indicator.
**Fix:** Add `max-h-[85vh] overflow-y-auto` to the inner detail card on small screens.

---

## 5. Medium-Priority Polish

### 🟡 M1. Tablet breakpoint consistency
The app uses `sm:` (640 px) and `md:` (768 px) effectively. `lg:` (1024 px) is used in `SpecialistDashboard.tsx`. Consider adding `xl:` for large tablets (1280 px, e.g. iPad Pro landscape) for the specialist dashboard hero card.

### 🟡 M2. ResultsDisplay filter chips wrap awkwardly
**File:** `ResultsDisplay.tsx:236`
Filter chips `flex flex-wrap gap-2` — works but with 4 chips on a 320 px screen the layout shifts. Acceptable.

### 🟡 M3. Sticky header obscures content on anchor scroll
**File:** `Header.tsx:74`
Sticky header height is `h-16` = 64 px. There's no scroll-margin-top set anywhere, so anchor links (if added) would land under the header.

### 🟡 M4. Footer in dark mode is hard to read
**File:** `App.tsx:388-397`
Footer text uses `text-slate-400 dark:text-slate-600` — dark-mode contrast ratio may be too low (4.5:1 WCAG AA). `slate-600` on `slate-950` is borderline.

### 🟡 M5. Print certificate uses A4 dimensions (210 × 297 mm) — fine for PDF but won't fit iPhone screen
**File:** `MedicalCertificate.tsx:25`
On a phone screen this renders tiny. Add a `scale` wrapper or `transform: scale(0.4)` for screen preview while keeping print-size.

### 🟡 M6. Empty states are good but could include illustrations
All empty states use icon + text. Fine.

### 🟡 M7. The "Auto-translating" overlay (`App.tsx:273`) blocks the screen
**File:** `App.tsx:273-280`
Uses `absolute inset-0` over the results — on mobile this is acceptable but the loader has no "skip" button. If Gemini translation hangs, the user is stuck.

### 🟡 M8. Form labels and placeholders are duplicated
`SymptomInput.tsx:108-115` uses `placeholder={t.input.name}` — placeholder should be different from the label per UX best practice. Accessibility tools will read both.

---

## 6. Strengths (good patterns to keep)

✅ Mobile-first hamburger pattern in `Header.tsx` — language switcher and profile are correctly collapsed into the menu on small screens and shown inline on `sm:` and up.
✅ Grid breakpoints (`grid-cols-1 md:grid-cols-2`, `lg:grid-cols-3`) consistently used.
✅ Dark-mode toggle is class-based and persisted in localStorage.
✅ i18n via `TRANSLATIONS[language]` with three locales — no layout regressions across them.
✅ The `MedicalCertificate` uses `max-w-[210mm] min-h-[297mm]` for print correctness.
✅ ESC-safe overlays (`isTranslating` overlay, error shake animation) are nice.
✅ `ResultsDisplay` specialist grid switches to single-column on small screens — well done.
✅ All long-content cards use `line-clamp-1` / `line-clamp-2` to prevent layout overflow.
✅ Use of `active:scale-95` on primary CTAs gives tactile feedback on touch.

---

## 7. Recommended Fix Order (PR-sized chunks)

1. **PR 1 — iOS input zoom + viewport-fit:** add `text-base` to all inputs, update viewport meta, add safe-area padding in CSS. (~30 min)
2. **PR 2 — Tap targets:** audit and bump all icon buttons to `min-h-[44px] min-w-[44px]`. (~45 min)
3. **PR 3 — PWA:** add `vite-plugin-pwa`, manifest, icons, register service worker, self-host Tailwind. (~2 h)
4. **PR 4 — A11y:** add focus-visible, aria-labels for icon buttons, focus trap in Header menu, Escape-to-close. (~1 h)
5. **PR 5 — Print UX:** replace `window.open` with `window.print()` + print stylesheet, add mobile preview. (~1 h)
6. **PR 6 — Tests:** add Vitest + a few Playwright viewports (375, 414, 768, 1024, 1280). (~2 h)
7. **PR 7 — Polish:** date input max attr, footer contrast, sticky-header scroll-margin, etc.

---

## 8. Per-Component Mobile Score

| Component | Score | Notes |
|---|---|---|
| `App.tsx` | 7/10 | Good layout; needs safe-area padding. |
| `Header.tsx` | 7/10 | Smart hamburger; needs safe-area + better dismiss + a11y. |
| `Login.tsx` | 8/10 | Single-column, recent users list, accessible. |
| `Signup.tsx` | 7/10 | Multi-step friendly; date input could improve. |
| `ResetPassword.tsx` | 8/10 | Stepped flow works well on mobile. |
| `SymptomInput.tsx` | 7/10 | Form is busy but mobile-friendly; tags borderline. |
| `Dashboard.tsx` | 9/10 | Hero collapses gracefully, actions stack well. |
| `ResultsDisplay.tsx` | 7/10 | Specialist cards OK; print uses popup (problematic on mobile). |
| `AppointmentScheduler.tsx` | 8/10 | Date pills scroll horizontally — correct. |
| `PatientHistory.tsx` | 7/10 | Detail view long in landscape; OK otherwise. |
| `ProfileEdit.tsx` | 7/10 | Same iOS zoom concern. |
| `SpecialistDashboard.tsx` | 6/10 | Sidebar disappears below 1024 px — needs `md:`. |
| `AuscultationTest.tsx` | 7/10 | Forms work; close button small. |
| `MedicalCertificate.tsx` | 6/10 | A4 layout — bad preview on phones. |
| `FAQ.tsx` | 9/10 | Accordion is mobile-perfect. |
| `About.tsx` | 9/10 | Simple, scales well. |

**Average: 7.4/10**

---

## 9. Verification Checklist (what to test on a real device)

When reviewing on iPhone Safari / Android Chrome, check:

- [ ] Load home → no horizontal scroll at 320 px, 375 px, 414 px widths
- [ ] Tap username field → no iOS zoom
- [ ] Rotate to landscape → header still visible, no content under notch
- [ ] Open hamburger → close by tapping outside **and** Escape key
- [ ] Pick a date in Signup → native picker appears
- [ ] Submit analysis → wait for Gemini response on slow 3G
- [ ] Open Result → "Print Certificate" — does popup work on iOS?
- [ ] Toggle dark mode → contrast OK in both modes
- [ ] Switch language to Tetum → layout unchanged, no overflow
- [ ] Scroll Patient History detail in landscape → no clipping
- [ ] Specialist Dashboard on iPad portrait → sidebar visible or properly collapsed
- [ ] Use Back button (browser) → returns to previous view (currently the app uses internal state, not the URL — history is broken)
- [ ] Add to Home Screen → icon appears, opens in standalone mode (PWA — currently fails)

---

## 10. Browser/Device Compatibility Notes

- **iOS Safari 17+:** Main target. Tailwind CDN works. `<input type="date">` native picker OK. Service workers supported since 11.3.
- **Android Chrome 120+:** Same. `<input type="file" accept="image/*">` triggers camera (good — used in Signup, ProfileEdit, SymptomInput).
- **Samsung Internet:** Tested by extension of Chromium — should work.
- **Firefox Mobile:** Tailwind CDN works. `<dialog>` element OK.
- **iPadOS Safari:** "Request Desktop Website" toggle can break the responsive layout — consider a meta to override.
- **Android tablet (e.g. Tab S9):** 1024–1600 px range — uses `lg:` layouts. Specialist dashboard feels right at this size.

---

## 11. Summary of Recommended Tools / Libraries

| Concern | Tool |
|---|---|
| Tap target audit | `eslint-plugin-jsx-a11y` |
| A11y testing | `@axe-core/react` + Lighthouse CI |
| PWA | `vite-plugin-pwa` |
| Date picker | `react-day-picker` (already a11y-friendly) |
| Form validation | `react-hook-form` + `zod` |
| Gestures (swipe-to-close) | `@use-gesture/react` |
| Unit tests | `vitest` + `@testing-library/react` |
| E2E viewports | `playwright` with `--device="iPhone 13"` flag |
| Lighthouse mobile audit | `lighthouse --preset=mobile` |

---

## 12. Conclusion

MurakMed AI is a **well-structured React web app** with strong responsive design fundamentals. The main mobile gaps are:

1. iOS input zoom bug (easy fix)
2. No safe-area handling for notched devices (easy fix)
3. No PWA / offline support (medium effort)
4. A few small tap targets (audit + fix)
5. No tests (recommend Vitest + Playwright)

The build is clean (404 KB / 108 KB gzip) — a healthy size for the feature set. With the critical and high-priority fixes applied, this app would be ready for real-world deployment on iOS, Android, and tablet browsers via the standard web stack.

For a true native iOS/Android app experience (push notifications, biometric login, app icon on home screen, deep system integration), the next step would be wrapping this build with **Capacitor** — a 1-day effort that produces installable `.ipa` and `.apk` from the existing web app.

---

*Report generated by automated analysis. No code was modified — only recommendations.*