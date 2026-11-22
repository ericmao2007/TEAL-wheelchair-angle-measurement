# Validation record (2026-10-16)

## Completed software validation

- Default ACCONLY and optional ACCGYRO both compiled with PlatformIO. The final ACCONLY build was flashed to `/dev/cu.usbserial-0001`; upload hash verification passed.
- Native C++ `tests/inclinometer_test.cpp` passed: angle signs/grade, inversion, same-direction remeasurement after repeated flips, measurement of a genuinely new angle after vibration, invalid data/stream interruption, rejection of slow tilting at 1g, rejection of sustained rotation when gyro is available, the ±180° branch, optional low-pass filtering, six-face bias/scale solving, and resolution of 0.001° direction changes.
- Fifteen Python unit tests passed: legacy/new BLE fragments and field mapping, missing/out-of-order/cross-version rejection, logging, marker grouping, preventing initial stability from being reported as recovery, preventing log overwrites, analysis reports, and limits on absolute-error claims. Historical math-helper tests remain; this does not mean the main program still uses fusion.
- The page loaded in Chrome without script-console errors. Checks covered valid readings, withdrawal of current results while awaiting stability, timestamped last-valid measurements, separation of relative zero from absolute readings, and calibration-button states.

## Completed limited hardware checks

- Hardware metadata was `STATIC2:ACCONLY`; reported mode=1, SYS_STATUS=6, SYS_ERR=0. Gyro was unavailable; fused orientation, gravity, and linear acceleration were not read.
- The first independent WebSocket check received 191 frames and ended with zero incomplete fragments reported by the bridge. Fragment loss occurred in later phases; the bridge discarded those fragments correctly without cross-frame assembly.
- Six-face control checks: CALSTART waited for stability; SAVE with incomplete faces returned 3; F0 with a mismatched orientation returned 2; CALCANCEL returned 6. **No real six-face samples were collected and no fabricated calibration was written. NVS six-face calibration was empty.**
- Confirmed that browser relative zero only updates the in-page relative direction; absolute readings were not set to zero.

### Initial short observation (not an absolute-accuracy test)

`initial-static.csv` / `initial-report.json` are independent development snapshots without six-face calibration: 281 stable samples over 29.546 seconds.

- Mean total tilt approximately 74.5905°, peak-to-peak **0.02634°**, SD **0.00441°**, and maximum deviation from the segment mean approximately 0.01403°.
- Internal temperature readings: 23–24°C.
- This short observation had no confirmed reference orientation. Samples were low-pass filtered and used overlapping windows, so they were not independent. These values do not establish accuracy, confidence intervals, or long-term drift.
- The final version also improved small-direction diagnostics with atan2(cross,dot), avoiding float acos resolution loss near zero. The tilt pipeline still used acceleration-vector low-pass filtering and averaging.

### Dynamic/waiting-state checks with the final firmware

`final-static.csv` / `final-report.json` span approximately 20.282 seconds. Only 13 of 140 frames passed stability criteria; the others were moving/waiting/sampling states with empty current angles. Raw acceleration direction changed noticeably, so **this is not a fixed-pose stationary test**. No accuracy claim is made from the 13 selected samples. Final hardware status remained mode=1, status=6, error=0; incomplete-fragment counts increased during transitions.

Development logs `static-session.csv` / `static-live.csv` mix calibration, firmware restarts, and possible orientation changes; they are not long stationary experiments. When the first connection is already stable, no recovery starting point is observed, so the analyzer does not report it as recovery time. Reported recovery times describe receiver state changes, not precise mechanical placement times.

## Incomplete checks and limits on claims

- Real six-face sampling, NVS saving, and reload after power cycling require placement in six orientations. Only synthetic coefficient-solving tests and hardware rejection/cancellation checks were completed.
- Controlled repeated lifting, flipping, and returning to the same locating base, with a manual marker for each return.
- A 10–30 minute temperature/drift test without moving the base. Continuous logging and per-minute analysis are supported, but this controlled experiment was not completed.
- Absolute accuracy against a known-angle reference instrument. **±0.1° absolute accuracy is unverified. No zero-error or drift-free-after-all-vibration guarantee is made.**
- Hardware motion-threshold tuning for ACCGYRO. ACCONLY was the default at the time; ACCGYRO received compilation and native algorithm tests only.
- Six-face calibration cannot fully correct nonorthogonal axes, arbitrary mounting error, temperature drift, or actual mechanical position changes.

## Runtime state and retesting at the time of this record

Final viewer: http://127.0.0.1:8765 . The new formal logging session wrote to `diagnostics/measurements.csv`; the adjacent `.meta.json` contains a startup source-configuration snapshot, units, and other metadata, rather than device-certified configuration. Keep the device and base stationary to continue logging. Do not calibrate, zero, restart, or flash during a stationary experiment.

See the root README.md for full steps and formulas. After 10–30 minutes, run:

```sh
.venv/bin/python laptop/analyze_log.py diagnostics/measurements.csv --output diagnostics/measurements-report.json
```

For manual return-position experiments, mark `moving` before lifting. After returning to the same base in the same direction, mark `return-1`, `return-2`, and so on. Different directions or bases must not be compared as the same return-position error.
