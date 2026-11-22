# v1.9.0 validation · 2026-11-18

Passed mobile integration, reversal arithmetic, map zoom, tracking and exports. Added `tests/app-flow.test.cjs`: headless Chrome verifies immediate readings/3D without calibration or zero, a three-button calibration menu with exclusive subpages, reversal/reference-zero persistence across reload, map GPS requests without recording, approximate-fix centering, no arbitrary map before first fix, and 360/390/432px navigation without overflow or page errors. Inspected `tests/calibration-menu-preview.png`.

Android assembleDebug and lintDebug passed. BLE now grants 30 seconds for transient activity pauses, avoids resume scans against an existing GATT connection, tolerates 30 seconds of absent packets, and reports GATT error codes/logcat. No physical Android device attached (`adb devices` empty): radio reliability, Android permission UI, sensor profile save/reload and real map tiles/location remain unverified. Backgrounding longer than 30 seconds still pauses BLE; no continuous background service is claimed.

APK: `dist/TEAL-Tilt-1.9.0-debug.apk`, versionCode 18. Sensor profiles stay on device; reversal and reference zero persist on phone.

# v1.8.2 validation · 2026-11-18

Passed mobile UI and reversal arithmetic regressions. New integration case clicks at +3° and +1° with invalid/stale, moving, unsaved and actively calibrating frames: immediate zero offset +2°, no state gating. Disconnect, sensor restart and calibration flag changes preserve the offset. Missing/non-numeric input still cannot supply an angle. Android assembleDebug and lintDebug passed. Physical sensor validation remains outstanding.

APK: `dist/TEAL-Tilt-1.8.2-debug.apk`, versionCode 17.

# v1.8.1 validation · 2026-11-18

Calibration is optional. UI regression verifies skipping an unsaved calibration, explicit zero before readings, connection gating, and blocking continuation during active calibration. Mobile integration, assembleDebug and lintDebug passed. APK: `dist/TEAL-Tilt-1.8.1-debug.apk` (versionCode 16). Physical phone/sensor validation remains outstanding.

# v1.8.0 validation · 2026-11-18

Passed mobile UI integration, guided connection/calibration/zero gating, disconnect relocking, offline history/sample inspection, session deletion persistence, native confirmation wiring, map empty-state tile requests/first-point recentering, zoom, tracking, reversal, and session exports. Headless Chrome verified the actual setup flow, offline History access, hidden 3D before zero, visible 3D after zero, 360/390/432px layout without horizontal overflow, empty-map tile requests, and no page exceptions. Inspected `tests/guided-readings-preview.png`. Android assembleDebug and lintDebug passed.

APK: `dist/TEAL-Tilt-1.8.0-debug.apk`, versionCode 15. Physical phone BLE/GPS, native confirmation taps, and field map tile connectivity have not been verified. Existing saved calibration can be reused with an explicit Continue; new calibration requires a saved sensor profile.

# v1.7.1 validation

Mobile UI/calibration controls regression, responsive four-tab browser checks, Android assembleDebug and lintDebug passed. Inspected both `tests/wheelchair-uphill.png` and `tests/wheelchair-downhill.png`: upright rider and wheelchair, wheels on slope, opposite facing directions, two captions. Reduced-motion/manual controls remain supported. Hardware calibration remains unverified on a physical phone.

# v1.7.0 validation

Passed mobile UI tests for dedicated calibration navigation, exclusive page visibility, previous/next, play/pause, visible autoplay and off-page pause. Existing calibration BLE controls, reversal math, GPS/session/export and map zoom regressions passed. Responsive browser checks covered all four tabs at 360/384/412/432px portrait and landscape, 48px buttons and text-size reflow. Browser additionally verified reduced-motion starts paused, IMU/legacy guide selection follows sensor mode, and IMU Next updates the caption. Inspected calibration screenshot. Android debug build and lint passed. Physical phone/sensor calibration is not verified by instructional animations.

# v1.6.2 validation

Passed: mobile UI regression including axis swap/restore and removed single reading; tracking, reversal, CSV/HTML exports; new map zoom test verifies bounds 2–26, 128× coordinate/tile scale and tile source cap 19. Responsive browser checks passed across 360/384/412/432px portrait and landscape; live synthetic frame screenshot inspected at `tests/dual-axis-preview.png`. Android debug build and lint passed. Real phone BLE/GPS checks remain unperformed.

# v1.6.1 Galaxy A16 layout validation

- Passed mobile UI, tracking, reversal and session export tests.
- Chromium checks: 360×780, 384×820, 412×892, 432×900, and 780×360; Measure/Map/History; Start/Stop and history checkbox; no JS exceptions or horizontal overflow; visible buttons at least 48 CSS pixels tall. Increased controls/summary/history text to 20px and checked reflow.
- Inspected screenshots `tests/a16-measureTab.png`, `tests/a16-historyTab.png`; map screenshot also retained.
- `:app:assembleDebug :app:lintDebug` passed. No physical Galaxy A16 attached; real Samsung WebView/font-scaling/system-navigation verification is not claimed.

# v1.6.0 validation · 2026-11-13

Passed: mobile-ui integration (including Start/Stop, persisted samples, distinct sessions, selected/all CSV/HTML dispatch, deletion, valid fusion with diagnostic state zero), reversal tests, tracking tests, CSV/HTML escaping and GPS blank-field tests. Android assembleDebug and lintDebug passed. A Chromium 390 × 844 check passed Start/Stop and History checkbox interaction with no page exceptions or horizontal overflow; inspected `tests/history-preview.png`.

Not tested on a physical phone: BLE/180° mechanical placement, phone GPS permission flow, and Android system file-picker export. Background recording is intentionally paused. Debug signing retained; no firmware changes in this update.

# v1.5.2 two-click reversal calibration validation

- `node tests/reversal.test.cjs`: passed immediate capture, automatic averaging/application on the second click, repeated calibration, cancellation, and invalid vectors.
- `node tests/mobile-ui.test.cjs`: passed two clicks without a stability window, Pitch/Grade/3D/GPS correction, and clearing on disconnect, restart, or calibration changes.
- `node tests/tracking.test.cjs`: passed; GPS stable-sampling logic remains covered.
- `./gradlew :app:assembleDebug :app:lintDebug`: passed; the SDK was installed in a persistent directory.
- `apksigner verify --print-certs`: passed; APK version 1.5.2 / versionCode 8.
- APK copies of `reversal.js` / `index.html` matched current source byte for byte.
- Updated `dist/LiveTilt-debug.apk`; no physical phone validation was performed.

---

## v1.5.1 button startup fix · 2026-11-04

- Root cause: native WebView asset allowlist omitted `reversal.js`; the blocked dependency stopped UI initialization before button event binding.
- Added the missing local script to the existing allowlist; retained remote request restrictions.
- Passed: mobile-ui, reversal, tracking Node suites; regression also rejects the original allowlist with reversal.js omitted.
- Passed: `./gradlew :app:assembleDebug :app:lintDebug`.
- No Android phone was attached (`adb devices` empty); device touch/BLE validation remains unperformed.

# v1.5 · 2026-10-30

- Angular/Grade format is one decimal, with signed rounded-zero handling; full precision remains in calculations, calibration and GPS records.
- Reversal and GPS tests require 5 seconds; explicit rejection of 3-second reversal samples added. UI binary-frame integration still covers reversal, zero, Grade/3D, GPS, calibration controls and invalidation.
- Chip-fused synthetic static angular-noise SD ratio: 0.214224 with longer smoothing. Gyro-assisted motion reaches the test target within 0.15° at 0.15 s; isolated spike rejection and invalid-data resets pass. Noise ratio is not absolute accuracy.
- Firmware default stability window is 5 seconds. C++ static detector tests pass with enough settling/collection time and include early-window rejection.
- assembleDebug, lintDebug and PlatformIO firmware compilation passed.
- No USB ESP32 was detected during this update. Sensor drift and physical calibration were not revalidated. App/code changes do not erase calibration storage.

# v1.4 · 2026-10-30

- Reversal model tests: −8°/+12° -> +2° offset / 10° slope, shallow same-sign measurements, flat slope, transverse Roll preservation, cancellation/clear, duplicate frames, movement, jitter, gaps and invalid/inverted data.
- Actual UI integration uses binary SH-2 frames: collect two independent stable windows, review/apply, preserve previous correction on cancel, correct main Pitch/Grade/3D/relative-zero/GPS consistently, preserve IMU saved indication, invalidate on disconnect/restart/calibration changes. No IMU write command is sent by reversal controls.
- Existing chip calibration command/save gating, protocol, GPS tracking and filter regressions pass. Added chip-specific synthetic static noise test: output/input angular SD ratio 0.401336; isolated spike rejection and 0.15 s motion-following test pass. These are algorithm tests, not hardware accuracy claims.
- assembleDebug and lintDebug pass (v1.4, versionCode 5).
- No USB serial sensor was present during this update. Real chip calibration persistence, 180° positioning, physical zero accuracy, Android phone rendering and field repeatability were not re-tested. Firmware and sensor calibration storage were not modified.

# v1.3 · 2026-10-28

- Firmware uses SH-2 Game Rotation Vector with normalized quaternion-to-gravity conversion. Independent C++ tests cover X/Y signs, yaw invariance, q/-q, inversion and invalid input.
- App UI integration tests cover chip accuracy fields, native calibration/save commands and save gating. Synthetic fused motion step reaches within 0.15 degrees in 0.15 seconds; this tests smoothing latency only.
- UI and BLE target 20 Hz. Existing protocol, zero/GPS, tracking and fallback filter tests pass. assembleDebug and lintDebug pass.
- ESP32 upload succeeded at 115200. A 12-second serial capture included 10 valid sample lines, no panic, and SH-2 quality status 59 (fusion High, accel Medium, gyro High). Initial startup invalid samples are expected. Capture: ../diagnostics/bno086-sh2-runtime.txt.
- Fixed driver event buffer lifetime: synchronous calibration commands can dispatch sensor reports, so event storage is persistent and bound before commands.
- Actual phone rendering latency, IMU calibration persistence and physical return-to-position accuracy remain unverified.

# BNO086 axis display update · 2026-10-28 · v1.2

- Exchanged displayed Roll/Pitch values; main Pitch, Grade and new GPS records share the updated mapping. Existing saved records retain their original values.
- Isolated X/Y tilt checks, UI/zero/GPS integration and filter tests passed; tracking tests passed.
- assembleDebug and lintDebug passed. APK signature verification passed.
- Android phone installation and physical axis direction have not been verified in this update.

# Validation · 2026-10-23 · Live Tilt 1.1

## Completed

- `:app:assembleDebug :app:lintDebug` passed with 0 errors. Six existing toolchain, target SDK, manifest and local JavaScript/backup warnings remain.
- APK verified with APK Signature Scheme v2. Package `com.maoslope.livetilt`, versionCode 2 / versionName 1.1, min SDK 26 / target SDK 35. Signing certificate matches the previous v1.0 APK, permitting an in-place update.
- Existing FrameAssembler tests: all 13 reassembly/recovery cases passed.
- Existing mobile protocol/UI and filter tests passed: six-axis decode, 500 ms display, BLE controls, signed grade, zero/reset, diagram orientation and stale-reading removal.
- Stability tests passed: ±0.2° threshold around the window mean, both axes, 3-second minimum, angular motion, stream gaps, reference changes and invalid samples. The detector sees every unsmoothed fused/corrected orientation frame, rather than the smoothed 2 Hz display.
- GPS/dedup tests passed: reject fixes older than 10 seconds or less precise than 20 m, reject invalid coordinates, suppress nearby similar points, accept changed positions/angles/references.
- Mock native bridge integration passed: live frames plus GPS save a point, repeated frames do not duplicate it, native save failure is surfaced without claiming success, zero starts a distinct reference, missing GPS prevents saves, pause calls native GPS shutdown, menu navigation and point details work.
- Playwright browser preview at 390 × 844: local assets loaded without JavaScript errors; three explicitly labelled demo records restored through the mocked native bridge, markers projected, a marker tap displayed angle/grade/location details, no horizontal overflow. All 6 visible real OpenStreetMap tiles loaded. Screenshots: `tests/gps-measure-preview.png`, `tests/gps-map-preview.png`.
- Location and BLE stop in the background; GPS requires explicit opt-in per app launch and foreground precise permission. Records use native private SharedPreferences; the UI reports failed writes. Network access is restricted to standard HTTPS map-tile image paths; all application scripts remain packaged assets.

## Not completed

`adb devices` showed no attached Android phone. Actual installation/update, location permission dialogs (grant/deny/approximate), GPS callbacks/accuracy indoors and outdoors, native persistence after force-stop/restart, ESP32 BLE + GPS together, phone-specific WebView map loading and lifecycle recovery have not been tested on hardware. Browser mocks do not establish those native behaviors. No improvement to absolute angle accuracy is claimed.

## Phone acceptance test

1. Install `dist/LiveTilt-debug.apk` over the previous app; close the computer BLE viewer, connect MAO_SLOPE and confirm live readings.
2. Enable GPS recording, grant precise location while using the app, turn on Location, and wait outdoors for accuracy ≤20 m. Hold both angles within ±0.2° for 3 seconds; verify one saved point and no repeated point while stationary.
3. Open **02 · Map**; confirm base map, angle markers, tap details, pan, +/−, Latest point and My location. Move beyond 10 m (or reported accuracy, whichever is larger), stop and verify another point. A ≥0.5° angle change at the same location should also produce another point after stability.
4. Set/reset zero and check that new points identify relative/absolute values. Calibration and invalid/disconnected sensor readings must not create points.
5. Pause recording, deny location, choose approximate only, disable phone Location, go indoors or use stale fixes; verify waiting/error messages and no false saves. Use Retry GPS after restoring precise permission/Location.
6. Background/resume, force-stop/reopen and test without internet. Existing records must persist; GPS must be manually enabled after app restart. With no internet, saved markers/list remain usable while uncached base-map tiles may be unavailable.

Optional browser test: install Playwright with Chromium and run `node tests/map-preview.cjs`. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` can select an existing Chromium executable. Test GPS data is injected only in the browser test, never packaged into the APK.


## v1.10.0 — 2026-11-20

Passed: assembleDebug, lintDebug; tracking.test.cjs, mobile-ui.test.cjs (3-second gate, forced flag, automatic recording), sessions.test.cjs, map-zoom.test.cjs (pinch and pan transition). Offline raster MBTiles import and GPS/gesture behavior on physical Android hardware have not been validated in this change. No regional map pack is bundled.

APK SHA-256: 444a9b741a0e972fad3906720813718fb2c964db4afc6a0d1e4a690a14458fc5


## v1.11.0 — 2026-11-20

Passed assembleDebug/lintDebug; tracking, mobile-ui, sessions, map-zoom tests; Playwright app-flow browser test. Fetched a real OpenFreeMap vector tile using the application User-Agent and verified rendering with browser network disabled (372 sampled colors). Native OfflineTiles harness downloaded 69 tiles from a local HTTP fixture server, verified request identity, duplicate-download exclusion, durable reads from a new instance after server shutdown, and cancellation. Phone GPS and download lifecycle on physical Android hardware remain untested.

SHA-256: 27da177fdf0a276abbc6fe4119ef6ee148bba856697c21694164c48984cdc520


## v1.11.1 — English interface

Translated recording states, force recording, map controls, downloads, native progress/errors, and legacy import messages to English. Map labels prefer English where available. No Han characters remain in app HTML/JS/Java or Android resources. Passed assembleDebug, lintDebug, mobile-ui.test.cjs and Playwright app-flow.test.cjs.


## v1.11.2 — Map visibility fix

Root cause: packaged CSP connect-src none blocked vector fetch requests. Changed to self to allow only native same-origin tiles. Kept map canvas visible before GPS acquisition and added delayed tile retries. The new map-page.test.cjs reproduces the old timeout using actual packaged HTML/CSP and Android asset origin; after the fix it verifies vector requests, painting with a real downloaded tile, no CSP errors, and visible canvas without GPS. Passed mobile-ui, app-flow and map-zoom tests plus assembleDebug/lintDebug. Inspected map screenshot and verified final APK contains the fix. No physical phone connected for device testing.
