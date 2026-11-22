# Project website / 项目展示页

GitHub Pages serves this `docs/` directory. Edit `content.json` to publish your own media; all paths are relative to this directory. Commit and push to `main` to deploy automatically.

## 添加内容

1. 把模型放到 `docs/assets/device.glb`（推荐自包含 GLB；也支持 glTF，但须一起提交其依赖文件）。
2. 把演示视频放到 `docs/assets/demo.mp4`（也支持 WebM）。大文件建议托管在外部 HTTPS 地址，GitHub 单文件须小于 100 MB。
3. 把论文放到 `docs/assets/paper.pdf`。
4. 修改 `docs/content.json`：

```json
{
  "model": {"src": "assets/device.glb", "poster": "", "caption": "Device enclosure", "autoRotate": true},
  "video": {"src": "assets/demo.mp4", "poster": "", "caption": "Field demonstration"},
  "paper": {"url": "assets/paper.pdf"},
  "resources": [{"title": "Download CAD", "url": "assets/device.step"}]
}
```

留空 `src` / `url` 会保留占位或隐藏论文按钮。模型支持旋转、缩放、自动旋转开关、重置视角。预览本地 GLB/视频只在当前浏览器生效，不会上传或替换公开内容。网页不包含虚构实验数据或论文引用。

3D viewer 按需从 unpkg 加载固定版本 `@google/model-viewer`，需要联网；字体无法加载时使用系统字体。网页正文、视频占位无需第三方脚本。

本地预览：在仓库根目录执行 `python3 -m http.server 8000 --directory docs`，访问 http://localhost:8000 。不要直接双击 HTML（浏览器会限制读取 JSON）。
