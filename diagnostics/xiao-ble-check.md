# XIAO ESP32S3 BLE discovery check

Initial full firmware produced live IMU logs but a local 8-second BLE scan did
not find MAO_SLOPE. Explicit raw advertising configured successfully but was
still not discovered in that scan. A BLE-only comparison using +9 dBm power and
30–60 ms advertising intervals was found at -42 dBm. The external antenna was
confirmed connected by the user. The exact contribution of power, intervals,
and advertisement layout was not independently isolated.

Final full firmware retains the sensor and adds:

- A 21-byte advertisement containing flags and the 128-bit service UUID.
- An 11-byte scan response containing the complete MAO_SLOPE name.
- +9 dBm BLE transmit power and 30–60 ms advertising intervals.
- GAP configuration/start completion status logs (all returned status 0).

Full firmware was built and flashed with hash verification. The computer then
found the exact service/name, connected, read SH-2 metadata, and subscribed to
telemetry. In five seconds: 729 notifications, 81 complete frames, 80 valid.
After disconnecting, the same service was discovered again. No commands were
sent and no calibration was changed. The computer test client disconnected.

See xiao-ble-integration-test.json for measured results. This is a computer BLE
test, not a completed Android phone test. App name remains TEAL Tilt; BLE device
name remains MAO_SLOPE for compatibility with the installed app.
