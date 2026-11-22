# Project website

GitHub Pages serves this `docs/` directory. Edit `content.json` to publish your own media; all paths are relative to this directory. Commit and push to `main` to deploy automatically.

## Add content

1. Save the hardware model as `docs/assets/device.glb`. A self-contained GLB is recommended. glTF is also supported if all referenced files are committed together.
2. Save the demonstration video as `docs/assets/demo.mp4` (WebM is also supported). Host large files at an external HTTPS URL. Keep individual GitHub files below 100 MB.
3. Save the paper as `docs/assets/paper.pdf`.
4. Update `docs/content.json`:

```json
{
  "model": {"src": "assets/device.glb", "poster": "", "caption": "Device enclosure", "autoRotate": true},
  "video": {"src": "assets/demo.mp4", "poster": "", "caption": "Field demonstration"},
  "paper": {"url": "assets/paper.pdf"},
  "resources": [{"title": "Download CAD", "url": "assets/device.step"}]
}
```

Empty `src` / `url` values preserve placeholders or hide the paper button. The model viewer supports rotation, zoom, automatic-rotation controls, and view reset. Local GLB/video previews remain in the current browser; they do not upload files or replace published content. The page contains no fabricated experimental results or paper citations.

The 3D viewer loads the pinned `@google/model-viewer` version from unpkg on demand and requires internet access. System fonts are used if web fonts cannot load. Page text and video placeholders do not require third-party scripts.

For local preview, run `python3 -m http.server 8000 --directory docs` from the repository root and visit http://localhost:8000 . Do not open the HTML file directly, because browser restrictions prevent loading its JSON configuration.
