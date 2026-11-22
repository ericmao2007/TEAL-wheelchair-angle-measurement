# XIAO ESP32S3 / SparkFun BNO086 SPI check

Hardware: ESP32-S3 MAC 1c:db:d4:5c:a4:78, /dev/cu.usbmodem101.
Pins: CS GPIO1, INT GPIO2, RST GPIO4, SCK GPIO7, MISO GPIO8, MOSI GPIO9.
User confirmed INT continuity and requested keeping the eight-wire connection.
SparkFun PS0/PS1 jumpers are closed; no extra BOOT or WAK connection was added.

## Findings

SPI at 100 kHz and 1 MHz returned valid startup headers and packets.
Reading complete packets showed INT transitions of 0/1/0 before/during/after CS.
The earlier interpretation of a broken INT wire based on pull tests was too
strong and is superseded by these measurements. Other boots sampled INT high
while valid packets were still available.

A direct-write experiment read product IDs but subsequent calibration config
received no reply. Sending commands without checking readiness also failed.
Starting game rotation reports before querying IDs, waiting for active INT or a
pending SHTP header, and spacing command transfers resolved the observed startup
failure on this board. Removing diagnostic prints initially exposed a timing
dependency; explicit CS spacing and a 2 ms post-command delay were added and
verified with diagnostic prints removed. The exact electrical cause of the
intermittently high INT samples has not been established.

## Final firmware and verification

- Local patched Adafruit 1.2.5 source: `lib/Adafruit_BNO08x`; see LOCAL_CHANGES.md.
- Application starts reports before gyro calibration and consumes the startup
  reset flag already handled during initialization.
- Build passed, no-stub upload completed, flash hash verified.
- Three hardware resets: all initialized successfully on the first attempt.
- Logged status samples: 12 + 12 + 30 = 54; all `ok=1`, `error=0`.
- Zero failed reinitializations and zero sensor decode errors in the final
  three-reset test. Stable state was observed in runs 1 and 3.
- Final sample: `STATIC t=30293 ok=1 state=5 norm=9.7361 noise=0.02247 drift=0.0079 roll=-3.8310 pitch=-24.6052 slope=24.8833 temp=-128 status=59 error=0`.
- Quaternion host tests passed (tilt signs, yaw independence, inversion, invalid input).

Raw results: `xiao-spi-restart-test.log`, summary `xiao-spi-restart-test.json`.
These are 1 Hz serial status samples, not a claim that every BLE frame was
captured or that absolute angle accuracy was verified. True power cycling,
phone BLE operation, and long-duration drift were not tested here.
The final firmware remains flashed and running, without intrusive raw-packet
diagnostics or additional wiring.
