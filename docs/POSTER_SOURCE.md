# Website source alignment

Reference: [Wheelchair Slope Incline Measurement for ADA Compliance](https://docs.google.com/presentation/d/1u4u2loXcCnUZt13ERQBUPNVVRGNxF7v4/edit), inspected on 2026-11-22.

The website follows the poster's title, authors, Duke project context, prototype development, hardware/software description, design criteria, reported results, future work, and acknowledgements. Teal section accents follow the poster's visual direction. Prototype, PCB, and app images are extracted from the supplied poster.

## Interpretation details

- The poster reports approximately 0.14% angle measurement error and qualifies it as a grade difference. The website preserves that qualification and does not convert it to degrees or independently verified absolute accuracy.
- The combined accuracy row remains Marginal because the reported GPS mean error of 23.08 m exceeds the target of less than 10 m. Other outcomes remain as reported.
- The poster describes an ESP32-S3 Mini. The repository uses XIAO ESP32S3. The website distinguishes the poster's ESP32-S3 design from this firmware implementation.
- The second intermediate-prototype description names a BNO086, but its outcome text repeats the earlier BNO055 statement. The website describes the stated hardware and mounting objective without repeating that inconsistent sensor outcome.
- The source includes an unfilled final-hardware photograph placeholder and a repeated PCB caption under an app screenshot. The website uses descriptive image captions and does not present the intermediate wheelchair photo as a completed final assembly.
- 3D and video sections remain placeholders with the existing local-preview and configured-media functionality.
- The ADA project title expresses the intended surveying application. It does not certify compliance.
