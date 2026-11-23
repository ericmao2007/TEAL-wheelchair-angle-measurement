## v1.12.2 — Explain mounting capture failures and accept gentle ramps

Keep the same level + uphill method. Accept a 2–30° separation between captured gravity vectors (previously 5–30°). This is a change from the first reference, independent of sensor mounting orientation. Shallow 2–5° captures are more sensitive to noise. The forward pose must still have no cross slope, which this algorithm cannot verify. Rejections now state the measured angle and actual limit; they no longer imply that cross slope was detected. Live feedback shows tilt from step 1, stable readiness, sample duration, gyro motion, and gravity validity. Sensor XYZ axes need not be aligned physically. Two poses differing only in flat-ground heading cannot determine forward.

Regression tests include arbitrary mounting at 4° forward tilt and a same-pose rejection followed by a successful gentle-ramp retry. Version 1.12.2 (25).

## v1.12.1 — Restore button initialization on Android

Allow the bundled `mount.js` through the native WebView resource allowlist. In 1.12.0 this script was blocked, aborting initialization before navigation and connection handlers were registered. The existing two-pose mounting calibration is unchanged. The browser flow test now checks all script references against the native allowlist and serves only allowed assets.

## v1.12.0 — Wheelchair mounting calibration

Calibrate → Wheelchair mounting · XYZ compensates an arbitrarily rotated, rigid sensor installation. First capture the empty, secured chair on a known level surface. Then capture it facing straight uphill on a supported 5–30° ramp, with no cross slope. Each capture requires at least 3 seconds of valid gravity and gyro samples, gyro magnitude ≤1°/s, gravity magnitude within 0.5 m/s² of standard gravity, and gravity direction within 0.2° of the window mean. These are stability checks, not an accuracy guarantee.

The level unit vector defines chair Z in sensor coordinates. Project uphill gravity into the plane perpendicular to Z and normalize to obtain forward X; Y = Z × X. The resulting right-handed orthonormal matrix transforms every gravity vector before angles, 3D, stability checks, maps, and recording. X is forward, Y left, Z up; uphill Pitch remains positive. No ramp angle is required. Lateral tilt during forward capture cannot be detected from these two poses and biases the forward axis. Check level and an independent straight slope after saving.

This determines all three *mounting* rotations, not compass heading or a live yaw measurement. Static gravity alone cannot determine forward from one pose. Linear acceleration can corrupt measurements; capture only while stationary. Use an empty chair and a supported ramp, not an occupied balancing maneuver.

The matrix is saved through the existing phone zero storage and restored after launch. A successful mounting capture clears previous relative/reversal zeros; optional Set zero then operates in chair coordinates. Reversal capture is disabled while mounting is applied; clear mounting first to use it. Stop recording before changing mounting. Repositioning the sensor or changing chip calibration requires repeating mounting calibration. Firmware and BLE protocol are unchanged. Recorded samples include `zeroMethod: mount` and a matrix snapshot; CSV/HTML identify the zero method.

Build: `./gradlew assembleDebug`; version 1.12.0 (23). Mathematical tests: `node tests/mount.test.cjs`. Hardware validation on the actual wheelchair is still required.

## v1.11.0 — Download offline maps in the app

No manual map-package import is required. By default, the map fetches OpenFreeMap vector data online and stores it locally. After locating yourself or moving the map, select the control to download the area within 5 km of the map center at zoom levels 0–14. Once downloaded, you can disable online tile loading and pan or zoom offline. Zooming beyond level 14 magnifies existing vector content without adding detail. Fonts and rendering code are bundled; no online scripts or fonts are needed. Saved maps survive app restarts, but clearing app data or uninstalling deletes them. Failed downloads can be retried, existing tiles are reused, and downloads can be cancelled. Each area download is limited to 3,000 tiles and 50 MB, uses one request thread and an application-specific User-Agent. The actual coverage is an approximately 10 × 10 km rectangle calculated around the center coordinates. Download additional areas separately.

Data sources and licensing: OpenFreeMap, OpenMapTiles, and OpenStreetMap contributors. Download policy: https://openfreemap.org/tos/ . The bundled map style includes basic roads, water, buildings, and place labels; it does not provide route navigation.

## v1.10.0 — Three-second stable recording and offline maps

After Start, both axes must remain within ±0.2° of their respective window means for three consecutive seconds. The indicator turns green and the window means are saved; while stability continues, recording occurs at most once every three seconds. Unstable readings show red and the maximum deviation for each axis. Force recording saves the current values despite the unstable state; the forced flag and window deviations are included in CSV/HTML exports. Fluctuation is not absolute error. Force recording is unavailable without valid sensor readings or during calibration. Angles can be saved without GPS; map points require valid GPS, and automatic map points remain deduplicated.

The map supports pinch zoom centered on the gesture and one-finger panning. In this version, offline mode is the default; measurements, history, and saved points work entirely offline. Use the offline-map import control to select **PNG/JPG raster MBTiles with standard TMS row numbering**; PBF vector MBTiles are unsupported. The package is copied into app-local storage and survives restarts. Street base maps are unavailable outside the package coverage or zoom levels. Online tile loading is optional; imported base maps do not require an internet connection. Global street data is not bundled. The first phone GPS fix may take longer offline.

The following sections document historical releases. The recording rules above take precedence over older descriptions.

# v1.9.0 · Direct readings, simple calibration, phone location

Install `dist/TEAL-Tilt-1.9.0-debug.apk` (versionCode 18).

- Connecting opens readings and 3D immediately. No calibration or Set Zero prerequisite.
- Calibration starts with three buttons: Sensor calibration, 180° zero, Set zero. Each opens a separate guide; manual steps replace automatic playback by default.
- Sensor profiles remain stored on the sensor. 180° offsets and reference zero are saved automatically on the phone and restored next launch. The two-click arithmetic remains `(first + second) / 2` without motion/stability/calibration gates.
- Map requests phone location independently of recording, accepts approximate location for map centering, displays a blue You marker, and avoids a default world view while waiting for the first fix. GPS recording still requires the existing precise-fix rules.
- BLE survives brief activity pauses (30-second grace), resume avoids redundant scanning, and telemetry timeout uses incoming packet activity with a 30-second tolerance. GATT disconnect codes appear in status/logcat. Longer backgrounding still pauses BLE; continuous background recording is not implemented.

# v1.8.2 · Direct two-click reversal zero

180° zero records the latest raw Pitch at each click and immediately applies `(first + second) / 2` as the zero offset. No stability, movement, freshness, turn, calibration-profile or sensor-state gate is used for the two clicks. Offset remains until manually cleared, replaced or app restart; disconnect/calibration changes no longer cancel the pair or clear the offset. Missing/non-numeric angle data cannot supply a sample.

APK: `dist/TEAL-Tilt-1.8.2-debug.apk` (versionCode 17).

# v1.8.1 · Optional calibration

Calibration is optional after connecting. Select **Skip calibration · Set Zero** to continue without a saved calibration. An active calibration must finish or be cancelled before zeroing. Connection and Set Zero remain required before live readings appear.

APK: `dist/TEAL-Tilt-1.8.1-debug.apk` (versionCode 16).

# v1.8.0 · Guided device setup

Install `dist/TEAL-Tilt-1.8.0-debug.apk` (versionCode 15).

Start offers **Connect Device** and **View History**. Connection, saved sensor calibration, and explicit Set Zero are required before readings or 3D appear. An existing saved calibration can be reused via Continue. Disconnect/restart/calibration changes reset setup. History works offline and each session has View data and a GPS map shortcut. Delete now uses an Android confirmation dialog. Empty maps request a world base map; map tiles require internet.

# v1.7.1 · Upright 2D wheelchair reversal guide

Replaced the rotating block with two 2D wheelchair side views: measure facing uphill, then facing downhill. Both poses keep wheels on the same slope and the rider upright. Playback switches between the two illustrations; no intermediate flip is drawn. Step captions explain turning around on the ground, holding still and preserving the sensor mounting. Existing two-click calibration math/commands are unchanged.

APK: `dist/TEAL-Tilt-1.7.1-A16-debug.apk` (versionCode 14).

# v1.7.0 · Dedicated calibration page and animated guides

Calibrate is now a separate bottom-navigation page. Measure keeps readings, reference zero and optional 3D only. Calibration controls and status remain connected to the existing BLE commands.

Four bundled, offline CSS demonstrations explain reversal zero (same-face 180° turn), BNO086 IMU orientation changes, legacy six-face axis-up placement, and relative zero. Each has Play/Pause and Previous/Next controls with step captions. Motion advances only on the active calibration page in expanded, sensor-appropriate sections. Reduced-motion preference disables automatic playback by default and removes transitions; manual stepping remains available. Demonstration steps never send calibration commands or infer live placement. Sensor profile controls remain gated by actual validity and accuracy.

APK: `dist/TEAL-Tilt-1.7.0-A16-debug.apk`, versionCode 13.

# v1.6.2 · Dual-axis readings and close-up map

Removed the oversized single Pitch reading. Measure now shows X/Y columns with Gradient (%) first and Angle (°) second. Gradient is slightly larger. X ↔ Y swaps both rows and their axis labels without changing calibration, recording or exported axes. X uses Pitch and Y uses Roll; each gradient is 100 × tan(the corresponding displayed angle). Relative zero and reversal correction still apply. 3D is collapsed by default.

Map zoom now reaches 26 (previously 19): up to 128× further linear magnification, with native zoom-19 tiles scaled locally. No unsupported zoom-20+ OSM tile requests are made. Saved marker positions remain coordinate-based; magnification does not improve GPS accuracy or add base-map detail. Map canvas height also increased.

Install `dist/TEAL-Tilt-1.6.2-A16-debug.apk` (versionCode 12).

# v1.6.1 · Galaxy A16 layout (2026-11-13)

Phone-first responsive layout: prominent Start/Stop at the top, collapsible GPS options, large angle readout, shorter 3D canvas, two-column actions, full-width destructive action, and 48px minimum button targets. History rows are large checkbox labels. Simplified Measure/Map/History navigation adapts to narrow screens and landscape. Existing native system-bar/cutout insets remain in use. Layout follows logical CSS viewport size rather than hardcoding panel resolution.

Install `dist/TEAL-Tilt-1.6.1-A16-debug.apk` (versionCode 11, same app ID/signature). Browser checks covered 360/384/412/432px portrait and 780×360 landscape, each page, 48px touch heights, no horizontal overflow, and increased control font size. Functional tests, Android build and lint passed. Physical Galaxy A16 verification remains outstanding.

# v1.6.0 · Sessions and export (2026-11-13)

- Start / Stop creates independent sessions, saving valid angles once per second. Start enables phone GPS. Stop disables GPS. Missing/stale/imprecise GPS is stored as blank coordinates; BLE disconnect/background pauses samples. No background recording service is introduced.
- History supports multi-selection, CSV/standalone HTML export of all or selected sessions, and confirmed deletion of selected stopped sessions together with their map points. Files are saved through the Android system file picker. Data remains local. Previous saved map points import as one legacy session.
- Export includes session ID/start/stop, sample time, Pitch/Roll/Grade, GPS latitude/longitude/accuracy/time, reference type, IMU-saved flag and reversal offset. Samples are limited to 50,000 across history; export/delete older sessions when full.
- Reversal calibration accepts valid fused gravity even if the separate diagnostic measurement state is zero. Snapshot failures show feedback, and applying the offset immediately refreshes the filtered display. Two clicks use raw current angles; IMU calibration is unchanged. Physical 180° placement still requires user verification.
- APK: `dist/TEAL-Tilt-1.6.0-debug.apk`, same application ID, versionCode 10.

# v1.5.3 · TEAL Tilt

The launcher name and interface title are now **TEAL Tilt**. Install `dist/TEAL-Tilt-debug.apk`; the application ID is unchanged, allowing an in-place update. Build, lint, and UI regression checks passed.

---

# v1.5.2 · Two-click 180° calibration

1. Hold the device still and select **Record first angle** to capture the current sensor Pitch immediately.
2. Turn 180° on the same slope, keeping the same face against the ground. Hold still and select **Record opposite & apply**.
3. The zero offset `(first angle + second angle) / 2` is applied immediately, without waiting for a stability window or another confirmation. For example, −8° and +12° produce a +2° offset and corrected readings of −10° and +10°.

Snapshots use current angles before app display smoothing, relative zeroing, or a previous reversal correction, so repeating calibration does not compound offsets. This version only requires valid connected readings outside IMU/six-face calibration; the five-second, angular-velocity, and quality gates have been removed. Hold the device still before clicking. Angle, Grade, 3D, and new GPS records use the same offset. It clears after disconnect, sensor restart, or calibration changes.

Package generated: `dist/LiveTilt-debug.apk` (v1.5.2, versionCode 8). Debug build, lint, and APK signature verification passed; no physical phone validation was performed. Older release notes follow.

---

# v1.5.1 · Fix unresponsive interface buttons

- Added the missing `reversal.js` entry to the Android WebView local-asset allowlist. The omission interrupted script initialization; connection, GPS, map, and reversal event handlers can now finish binding.
- Added regression checks requiring every local script referenced by HTML to exist and be permitted by the native WebView allowlist.
- Package: `app/build/outputs/apk/debug/app-debug.apk`, suitable for an in-place update.

---

# v1.5 · One decimal place and longer averaging (2026-10-30)

- Main Pitch, Roll, Grade, reversal offset/slope, and map angles display one decimal place. Calculations, BLE, calibration coefficients, and saved records retain full precision; coordinates retain their existing precision.
- Stationary BNO086 display uses a three-frame median, a 1.5-second rolling vector average, and a low-pass time constant of 0.35 seconds. Above 1°/s, the long window is cleared and averaging is bypassed, retaining the 0.035-second motion low-pass. After rotation stops, accumulation restarts at the current orientation to avoid mixing previous poses.
- Stable reversal sampling increases from three to five seconds per direction. GPS stable averaging and the ESP32 stability window also become five seconds. Existing ±0.2°, gyro, and data-validity criteria remain.
- Chip fusion, saved IMU calibration, reversal zeroing, and 20 Hz updates remain in use. Longer averaging increases stationary settling time; it cannot eliminate soldering stress, temperature drift, or persistent offset changes.
- The app APK was updated. The firmware stability-window change requires reflashing the ESP32; app display smoothing and the reversal/GPS five-second windows take effect after installing the updated app.

---

# v1.4 · Reversal difference / Pitch zero-offset correction (2026-10-30)

Install `dist/LiveTilt-debug.apk` as an in-place update. ESP32 firmware, wiring, chip DCD, and existing six-face NVS calibration remain unchanged.

1. After connecting, expand **180° reversal zero · Pitch**. Keep the same face against the slope, face downhill, and select **Capture first direction**.
2. Remain stable for at least three seconds: unsmoothed six-axis angles must remain within ±0.2° of the window mean, angular speed must be ≤1°/s, and frame gaps must be ≤250 ms. Chip fusion/Gyro quality must be at least Medium; sampling is disabled during calibration.
3. Turn 180° on the same slope, preserving the contact face and location; do not flip the device. Select **Capture opposite · 180°** and collect another three-second stable sample.
4. Review the two means, offset, and slope. After confirming the directions were opposite, select **Apply Pitch zero**. `zero=(first+opposite)/2`, `slope=abs(first-opposite)/2`. For example, −8° and +12° produce a +2° offset and 10° slope, with corrected readings of −10° and +10°.
5. Main Pitch, Grade, 3D, relative Set zero, and new GPS records use the same corrected vector; lateral Roll receives no zero-offset correction. Map records additionally retain the offset and original directional means for traceability. Existing records retain their original values.
6. Cancel preserves the previously applied reversal offset; Clear reversal zero removes it. The offset lasts only for this connection and clears on disconnect, sensor uptime rollback, or changes to IMU/six-face calibration state or coefficients. Repeat after reconnecting. Sensor calibration is neither written nor cleared. Six-axis mode provides no heading, so the app cannot verify a 180° turn. Different slopes or contact locations introduce systematic error. Sampling is prohibited near vertical or when inverted.

Six-axis chip fusion, 20 Hz updates, stationary median spike rejection, and adaptive low-pass filtering remain. The measurement page adds live processing status: IMU profile saved/not saved, Fusion quality, and the current filter chain. A saved profile indicates a stored record, not verified absolute error. Calibration still shows Accel/Gyro/Fusion quality. As in v1.3, legacy six-face coefficients affect acceleration diagnostics only.

Added `node tests/reversal.test.cjs`. `node tests/mobile-ui.test.cjs` also checks directional sampling, apply/cancel/clear, relative zero, map saving, invalidation on disconnect/restart/calibration changes, and stationary smoothing, spike rejection, and motion response in the chip-fusion path. The synthetic noise SD ratio is approximately 0.401; it does not establish a physical accuracy improvement.

---

# v1.3 · BNO086 internal six-axis fusion

Use the updated ESP32 mode=6 firmware. BLE data and display updates run at a nominal 20 Hz. The chip six-axis Game Rotation Vector replaces the older ESP32 complementary fusion. The app applies only median spike rejection and a lightweight motion-adaptive low-pass filter to chip results, bypassing the older half-second average and Kalman chain. The v1.2 X/Y display mapping is retained.

After installing `dist/LiveTilt-debug.apk`, select Start IMU calibration in Calibration. Rest for a few seconds, hold four to six different orientations for a few seconds each, then rest again. Select Save IMU calibration when Accel and Gyro are both High and the device is stable. Calibration is saved in the BNO086. Legacy six-face coefficients affect diagnostic acceleration only, not the chip quaternion. Older firmware can still use the legacy display path.

Physical rotation and return-position repeatability require a fixed fixture for validation. Saved profile indicates only a stored record; current quality is shown by Accel/Gyro/Fusion ratings. The 0.5-second refresh and legacy six-face descriptions below apply only to historical releases.

---

# Live Tilt · Android

A standalone Android app that connects directly to **MAO_SLOPE** over BLE. No computer relay, web server, or online account is required. Live measurements and GPS point storage work offline; base maps in this historical version require internet. Android 8.0 or later is supported.

## Usage

1. Install `dist/LiveTilt-debug.apk` and open **Live Tilt**.
2. Power on the ESP32. First quit `laptop/viewer.py` on the computer to release its MAO_SLOPE BLE connection.
3. Enable Bluetooth on the phone, select **Connect**, and grant Nearby devices permission. Android 8–11 additionally requires location permission and the system Location service for BLE scanning. GPS map recording requests precise location separately.
4. After connection, **Live · 6-axis** appears. Angle, Grade, and 3D refresh every 0.5 seconds while all incoming frames continue to be processed.
5. Select **Set zero** to establish a relative zero and **Reset zero** to restore absolute readings. The temporary zero is not written to the device; set it again after closing or recreating the app.
6. Expand **Calibration**, start capture, hold each of the six faces upward until stable, select the corresponding face, and save when all are complete. Calibration is stored on the ESP32; no six-axis firmware change is required.

On disconnect, old readings are withdrawn and reconnection starts automatically. Select Cancel during scanning or Disconnect after connecting. BLE disconnects in the background and reconnects on returning to the foreground. The screen stays awake only on the connected measurement page; continuous background sampling is not implemented.

## Automatic GPS recording and map (v1.1)

1. On **01 · Measure**, select **Enable GPS recording**, grant **precise location** while using the app, and enable phone Location. If denied, grant permission in system settings, then select **Retry GPS**.
2. Connect the sensor and hold still. A point saves automatically when every frame of Roll and Pitch stays within **±0.2°** of its respective window mean for at least **three seconds**. Detection uses fusion/corrected vectors before phone display smoothing and saves window-average angles; the display algorithm remains unchanged.
3. Only fixes with reported accuracy **≤20 m** and age **≤10 seconds** are accepted. Nothing saves while waiting for GPS. Records include coordinates, accuracy, time, Pitch, Roll, and zero/calibration status. Grade is calculated on viewing as `100 × tan(Pitch)`.
4. **02 · Map** shows the base map and colored slope points. Pan, zoom with +/−, and select markers or the latest 100 records for details; all saved points are still drawn. **Latest point** centers the last saved point; **My location** centers the current valid GPS fix.
5. A new point requires movement of at least `max(10 m, both fixes' reported accuracies)` from the previous record, or a change of ≥0.5° in either angle. Setting zero, restoring absolute readings, or changing calibration establishes a new reference.
6. Records are stored locally and survive restarts, up to 10,000 points. At the limit, existing records are preserved and new saves pause. **Pause GPS recording** stops location updates. Backgrounding pauses GPS and BLE; returning to the foreground waits for stability and a fresh fix.

GPS comes from the phone; ESP32 firmware and wiring remain unchanged. Enable GPS recording manually after app launch. Indoor positioning may never reach the required accuracy. Offline, saved points and lists remain accessible, but uncached base maps cannot load. Coordinates are not reverse-geocoded to street addresses.

The map uses [standard OpenStreetMap tiles](https://operations.osmfoundation.org/policies/tiles/), loads only the current viewport, and retains default HTTP caching and visible attribution. Tile requests reveal the viewed map area to the map server; measurement records themselves are not uploaded. Location follows [Android foreground precise-location permissions](https://developer.android.com/develop/sensors-and-location/location/permissions).

## Features shared with the computer version

- Three-axis acceleration and three-axis gyroscope fusion from the existing ESP32 firmware.
- Median spike rejection, a 0.5-second rolling average, and adaptive Kalman display smoothing.
- BNO086 display swaps the older Roll/Pitch values: Pitch follows X tilt and Roll follows Y tilt, preserving the original signs. Main Pitch, Grade, and new GPS records use the same mapping. Existing map records retain their original values.
- Grade = 100 × tan(displayed Pitch); angles and percentages display two decimal places in this historical version.
- The 3D projection swaps the screen directions of X/Y. Calibration face buttons still refer to physical sensor axes; do not position the device using the illustrated screen directions.
- A compact English-language interface.

## Build

This is a standard Android Gradle project. Native Java handles BLE, while bundled HTML/Canvas implements the display. It does not rely on Web Bluetooth in a mobile browser.

Open this folder in Android Studio, install Android SDK 35, select JDK 17+ (Gradle 9.1 supports the local JDK 25), and run:

```sh
./gradlew :app:assembleDebug :app:lintDebug
```

The APK is at `app/build/outputs/apk/debug/app-debug.apk`. Debug signing is for local installation and testing, not Play Store release signing.

For command-line builds, set `ANDROID_HOME` to the installed SDK path or set `sdk.dir=...` in the untracked `local.properties`. Building requires internet to download official Gradle/Google dependencies. The app INTERNET permission supports OpenStreetMap base maps.

## Tests

```sh
python3 tests/create_fixture.py
node tests/mobile-ui.test.cjs
node tests/tracking.test.cjs
mkdir -p tests/.classes
javac -d tests/.classes app/src/main/java/com/maoslope/livetilt/FrameAssembler.java tests/FrameAssemblerTest.java
java -cp tests/.classes com.maoslope.livetilt.FrameAssemblerTest
```

Automated tests cover STATIC2 binary fields, missing/out-of-order fragments, timeout/stream recovery, 500 ms refresh, zero and Grade, X/Y graphics, and filtering. `VALIDATION.md` records the builds and checks actually completed. Desktop previews and automated tests do not establish real phone BLE behavior without a connected Android device.

## Files

- `app/src/main/java/.../BleClient.java`: scanning, connection, notification subscriptions, calibration commands, reconnection, and lifecycle.
- `FrameAssembler.java`: strict 0xA6 fragment validation to prevent cross-frame assembly.
- `MainActivity.java`: permissions, native Bluetooth bridge, and WebView loading of the local interface with restricted map-tile images.
- `app/src/main/assets/index.html`: display algorithms and mobile interface.
- `app/src/main/assets/tracking.js`: stability detection, location validity, and record deduplication.
- `app/src/main/assets/map.js`: local Canvas map, tiles, markers, panning, and zooming.
- `app/src/main/assets/protocol.js`: 136-byte STATIC2 decoding, including six-axis fusion flags.

BLE UUIDs, frames, and commands match the existing firmware in the root project. The device protocol is unchanged, and the magnetometer remains disabled.

References: [Android BLE permissions](https://developer.android.com/develop/connectivity/bluetooth/bt-permissions), [GATT data transfer](https://developer.android.com/develop/connectivity/bluetooth/ble/transfer-ble-data).
