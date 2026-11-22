Based on Adafruit BNO08x 1.2.5 (BSD license in license.txt).
Upstream: https://github.com/adafruit/Adafruit_BNO08x

Local SPI changes for the XIAO ESP32S3 / SparkFun BNO086 eight-wire setup:

- Read each SHTP header and body under one CS assertion; timestamp the transfer.
- Poll headers without waiting 500 ms/resetting an idle sensor. Empty or invalid
  lengths are rejected; no synthetic sensor values are generated.
- Before writes, accept active INT or a valid pending header as readiness.
  Preserve CS high spacing and give SH-2 2 ms between configuration commands.
  Return a negative error on readiness timeout (SHTP retries zero forever).
- Start Game Rotation Vector at 100 Hz before the product query, keeping
  periodic transfer opportunities available without adding a WAKE wire.
- Close the previous SH-2 session before retrying initialization so the finite
  SHTP instance pool is not exhausted.
- Bound product-ID and calibration-config response waits to two seconds.

The normal application configures acceleration/gyro at 50 Hz and game rotation
at 100 Hz, then gyro calibration. The application consumes the reset flag already
handled by initialization. Existing freshness checks still reject stale readings.

This is validated on the connected development board, not a general replacement
for the datasheet's WAKE-controlled SPI design on other hardware.
