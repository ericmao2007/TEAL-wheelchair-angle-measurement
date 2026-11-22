## v1.11.0 — App 内直接下载离线地图

不需要手动导入地图包。地图默认联网获取 OpenFreeMap 矢量数据并保存到本地。定位或移动地图后点击“下载地图中心周边 5 公里”，下载该中心周边区域的 0–14 级地图，下载完成后可关闭在线补图、断网拖动和缩放。超过 14 级继续放大已有矢量内容，不新增更细数据。字体、绘制代码全部内置，不依赖在线脚本和字体。已存地图重启后保留；清除 App 数据或卸载会删除。失败后可重试，已下载瓦片会复用，支持取消。单次区域下载最多 3000 瓦片、50 MB，单线程请求，使用 App 专属 User-Agent。实际下载范围为以中心经纬度计算的约 10×10 公里矩形。范围外需要另外下载。

数据来源和许可：OpenFreeMap、OpenMapTiles、OpenStreetMap contributors。下载规范：https://openfreemap.org/tos/ 。地图内置基础道路、水域、建筑与地名样式；不提供路线导航。

## v1.10.0 — 3 秒稳定记录与离线地图

Start 后两轴在连续 3 秒内各自距离窗口均值不超过 ±0.2°，显示绿色并保存窗口均值，持续稳定时最多每 3 秒保存一次。未稳定显示红色及两轴最大偏差，可按“不建议记录 · 强制记录”保存当前值；强制标记、窗口偏差随 CSV/HTML 导出。波动不等于绝对误差。无有效传感器读数或校准中不能强制记录。无 GPS 仍保存角度，地图点需要有效 GPS，自动地图点仍去重。

地图支持双指以手势中心缩放和单指拖动。默认离线模式，测量、历史和测点可完全离线使用。点击“导入离线地图”选择所需区域的 **PNG/JPG 栅格 MBTiles（标准 TMS 行号）**；不支持 PBF 矢量 MBTiles。地图包复制到 App 本地，重启后保留；不包含地图包的区域或缩放等级无法显示街道底图。可选开启在线补图；无需联网使用已导入底图。App 未内置全球街道数据。手机 GPS 在无网时首次定位可能更慢。

以下为历史版本说明，当前记录规则以本节为准。

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

桌面应用名称及界面标题改为 **TEAL Tilt**。安装 `dist/TEAL-Tilt-debug.apk`，保留原应用 ID，可覆盖更新。构建、lint 及界面回归测试通过。

---

# v1.5.2 · 两次点击完成 180° 校准

1. 放稳设备，点 **Record first angle**，立即记录当前传感器 Pitch。
2. 在同一坡面、同一面贴地调头 180°，放稳后点 **Record opposite & apply**。
3. 立即应用零偏 `(第一次角度 + 第二次角度) / 2`，无需等待稳定窗口或再点确认。例如 −8°、+12° 得零偏 +2°，修正后分别为 −10°、+10°。

记录未经 App 显示平滑、相对归零或旧对向零偏修正的当前角度，重复校准不会叠加。仅要求在线有效读数且未处于 IMU/六面校准；不再设置 5 秒、角速度或质量等级门槛。请自行放稳后点击。角度、Grade、3D 和新 GPS 记录使用同一零偏。断线、传感器重启或校准变更后清除。

安装包已生成：`dist/LiveTilt-debug.apk`（v1.5.2，versionCode 8）。Debug 构建、lint 和 APK 签名验证通过；未做真实手机验证。以下为历史版本说明。

---

# v1.5.1 · 修复界面按键无响应

- 修复 Android WebView 本地资源白名单遗漏 `reversal.js` 导致脚本初始化中断的问题；连接、GPS、地图和对向校正事件现在能够完成绑定。
- 补充回归检查：HTML 引用的每个本地脚本必须存在，并被原生 WebView 白名单放行。
- 安装包：`app/build/outputs/apk/debug/app-debug.apk`，可覆盖安装。

---

# v1.5 · 一位小数与更长平均（2026-10-30）

- 主 Pitch、Roll、Grade、对向零偏/坡度以及地图角度均显示小数点后 1 位；计算、BLE、校准系数和保存记录保持完整精度，经纬度不降精度。
- BNO086 静止显示采用三帧中值、1.5 秒滚动向量平均和时间常数 0.35 秒的低通。gyro >1°/s 时清空长窗并绕过平均，沿用 0.035 秒运动低通；停止转动后从当前位置重新累积，避免混入上次姿态。
- 对向测量每方向的稳定采样由 3 秒延长至 5 秒；GPS 稳定平均及 ESP32 的稳定窗口也改为 5 秒。原有 ±0.2° / gyro / 数据有效性判据保留。
- 芯片融合、IMU 校准保存、对向求零点和 20 Hz 更新继续使用。更长平均会增加静止读数的收敛时间；不能消除焊接应力、温漂或持续零偏变化。
- App APK 已更新；固件稳定窗口的变化需要重新烧录 ESP32 才生效。App 的显示平滑和对向/GPS 5 秒窗口安装新版后即可生效。

---

# v1.4 · 对向求差 / Pitch 零偏校正（2026-10-30）

安装 dist/LiveTilt-debug.apk，可覆盖更新；ESP32 固件、接线、芯片 DCD 和原有六面 NVS 校准均不修改。

1. 连接后展开 **180° reversal zero · Pitch**，同一面贴着坡面，朝坡下点 **Capture first direction**。
2. 保持至少 3 秒稳定：未经过 App 显示平滑的六轴角度在窗口均值 ±0.2° 内，角速度 ≤1°/s，帧间隔 ≤250 ms。芯片融合/Gyro 质量须至少 Medium；校准期间不采样。
3. 沿同一坡面调头 180°，同一面贴地，保持相同接触位置；不要翻面。点 **Capture opposite · 180°**，再稳定采样 3 秒。
4. 查看两次均值、零偏及坡度，确认确实是相反方向后点 **Apply Pitch zero**。`zero=(first+opposite)/2`，`slope=abs(first-opposite)/2`。例如 −8°、+12° 得零偏 +2°、坡度 10°；应用后两向分别为 −10°、+10°。
5. 主 Pitch、Grade、3D、相对 Set zero 和新 GPS 记录都使用同一修正向量；横向 Roll 不作零偏校正。地图记录额外保存零偏和原始两向均值，以便追溯。已有地图记录保持原值。
6. Cancel 保留先前已应用的对向零偏；Clear reversal zero 撤销它。此零偏只用于本次连接：断线、传感器 uptime 回退、IMU/六面校准状态或系数改变时清除；重新连接后需重做。不会写入或清除传感器校准。六轴模式不提供航向，App 无法自动验证 180°；正反两次若不在同一坡面/位置，结果会有系统误差。接近竖直或翻面不允许采样。

六轴芯片融合、20 Hz 更新、静止中值去尖峰和自适应低通保留。测量页新增实时处理状态：可看 IMU profile saved/not saved、Fusion 质量与当前滤波链路。`saved` 表示保存记录，不等同于绝对误差已验证；Calibration 内仍显示 Accel/Gyro/Fusion 等级。旧六面系数按 v1.3 设计仅用于加速度诊断。

新增 `node tests/reversal.test.cjs`；`node tests/mobile-ui.test.cjs` 同时验证两向采样、应用/取消/清除、相对零点、地图保存、断线/重启/校准变更失效，及芯片融合路径静态去抖、尖峰抑制、运动响应。合成噪声 SD 比约 0.401，不能当作实际精度提升。

---

# v1.3 · BNO086 内置六轴融合

使用新版 ESP32 mode=6 固件。蓝牙数据及显示以名义 20 Hz 更新；芯片六轴 Game Rotation Vector 替代旧 ESP32 互补融合。App 对芯片结果只做中值去尖峰和随运动调整的轻量低通，跳过旧的半秒均值与卡尔曼链路。保留 v1.2 的 X/Y 显示映射。

安装 dist/LiveTilt-debug.apk 后，在 Calibration 点 Start IMU calibration：静置几秒，在 4–6 个不同方向各保持几秒，再放稳。Accel、Gyro 均 High 且稳定后点 Save IMU calibration。校准保存在 BNO086 中。旧六面系数只影响诊断加速度；不校正芯片四元数。旧版固件仍可走旧显示路径。

实际转动和归位重复性需使用固定夹具验证。Saved profile 只表示保存记录，当前质量由 Accel/Gyro/Fusion 等级显示。下文 0.5 s 刷新及旧六面校准描述仅适用于历史版本。

---

# Live Tilt · Android

独立 Android App，直接通过 BLE 连接 **MAO_SLOPE**。不需要电脑转发、网页服务器或联网账号。实时测量和保存 GPS 点可离线使用；地图底图需要手机联网。支持 Android 8.0 及以上。

## 使用

1. 安装 `dist/LiveTilt-debug.apk`，打开 **Live Tilt**。
2. 接通 ESP32 电源，先退出电脑上的 `laptop/viewer.py`，让电脑释放 MAO_SLOPE 的蓝牙连接。
3. 手机开启蓝牙，在 App 点击 **Connect**，允许“附近的设备”权限。Android 8–11 还要求位置权限和系统 Location 服务，用于 BLE 扫描；GPS 地图记录另外申请精确位置权限。
4. 连接后显示 **Live · 6-axis**。角度、Grade 和 3D 每 0.5 秒刷新一次，后台持续处理所有帧。
5. 点击 **Set zero** 归零，**Reset zero** 恢复绝对值。临时零点不写入设备；关闭/重建 App 后需重新设置。
6. 校准在折叠的 **Calibration** 中：开始、六面逐一朝上停稳后选面、全部完成后保存。校准保存在 ESP32，六轴固件无需修改。

断线时撤下旧读数并自动重连。扫描中可点击 Cancel，连接后可点击 Disconnect。App 转入后台会断开 BLE；返回前台后恢复连接。仅在连接显示页保持屏幕点亮，不持续后台采样。

## GPS 自动记录与地图（v1.1）

1. 在 **01 · Measure** 点击 **Enable GPS recording**，允许“使用 App 时”的**精确位置**，打开手机 Location。拒绝后可在系统设置授权，再点 **Retry GPS**。
2. 连接传感器并停稳：连续至少 **3 秒**，每帧的 Roll 和 Pitch 都在各自窗口均值 **±0.2°** 内时，自动保存一次。检测使用未经手机显示平滑的融合/校正向量，保存窗口平均角度；显示算法保持原样。
3. 仅接受报告精度 **≤20 m**、年龄 **≤10 秒**的定位；等待 GPS 时不保存。保存经纬度、定位精度、时间、Pitch、Roll 和归零/校准状态；Grade 在查看时按 `100 × tan(Pitch)` 计算。
4. **02 · Map** 显示地图与彩色坡度点。可拖动、用 +/− 缩放、点标记或最近 100 条记录看详情；地图仍绘制所有已存点。**Latest point** 定位最后一个点，**My location** 定位当前有效 GPS。
5. 相对上一条记录，移动至少 `max(10 m, 两次定位精度)`，或任一角度变化 ≥0.5°，才保存新点。归零、恢复绝对值或校准变更会建立新的参考，避免混淆。
6. 记录写入手机本地存储，重启 App 后仍保留，最多 10,000 条；达到上限后保留旧记录并暂停新增。**Pause GPS recording** 停止定位；进入后台会暂停 GPS 与 BLE，回前台重新等待稳定与新定位。

GPS 来自手机，ESP32 固件与接线无需修改。App 启动后需手动开启本次 GPS 记录。室内可能一直等不到足够精确的定位。断网时已存点与列表仍可看，未缓存的底图无法加载。经纬度是坐标，不做街道地址反查。

地图使用 [OpenStreetMap 标准瓦片](https://operations.osmfoundation.org/policies/tiles/)，只加载当前视口，保留默认 HTTP 缓存和可见署名。瓦片请求会向地图服务器透露所查看的地图区域；记录本身不上传。定位按 [Android 前台精确位置权限](https://developer.android.com/develop/sensors-and-location/location/permissions) 实现。

## 与电脑版本一致的功能

- 三轴加速度 + 三轴陀螺仪融合来自现有 ESP32 固件。
- 中值去尖峰、0.5 秒滚动平均、自适应卡尔曼显示平滑。
- BNO086 显示已交换旧版 Roll/Pitch 数值：Pitch 随 X 倾斜变化，Roll 随 Y 倾斜变化；保留各数值原有符号。主 Pitch、Grade 和新 GPS 记录使用同一映射。已有地图记录保留原值。
- Grade = 100 × tan(显示的 Pitch)，角度和百分比均为两位小数。
- 3D 图的投影方向已调整：X/Y 在屏幕中的方向互换。校准面按钮仍对应传感器本体轴，不能按图示屏幕方向摆放。
- 当前界面保持英文和精简风格。

## 构建

这是标准的 Android Gradle 工程，原生 Java 处理 BLE，打包在 App 内的 HTML/Canvas 负责显示。不依赖手机浏览器的 Web Bluetooth。

用 Android Studio 打开本文件夹，安装 Android SDK 35，选择 JDK 17+（Gradle 9.1 支持本机 JDK 25），执行：

```sh
./gradlew :app:assembleDebug :app:lintDebug
```

APK 位于 `app/build/outputs/apk/debug/app-debug.apk`。Debug 签名供本地安装测试，不是 Play Store 发布签名。

使用命令行时，设置 `ANDROID_HOME` 为已安装的 SDK 路径，或在未提交的 `local.properties` 中设置 `sdk.dir=...`。构建需联网下载 Gradle/Google 官方依赖；App 的 INTERNET 权限用于 OpenStreetMap 地图底图。

## 测试

```sh
python3 tests/create_fixture.py
node tests/mobile-ui.test.cjs
node tests/tracking.test.cjs
mkdir -p tests/.classes
javac -d tests/.classes app/src/main/java/com/maoslope/livetilt/FrameAssembler.java tests/FrameAssemblerTest.java
java -cp tests/.classes com.maoslope.livetilt.FrameAssemblerTest
```

自动测试验证 STATIC2 二进制字段、丢片/乱序/超时/断流恢复、500 ms 刷新、归零和 Grade、X/Y 图示及滤波器。`VALIDATION.md` 记录实际完成的构建和验证范围。未连接真实 Android 手机之前，不能把桌面预览或自动测试当作手机 BLE 实测。

## 文件

- `app/src/main/java/.../BleClient.java`：扫描、连接、通知订阅、校准命令、重连和生命周期。
- `FrameAssembler.java`：严格校验 0xA6 分片，避免拼接跨帧数据。
- `MainActivity.java`：权限、原生蓝牙桥和加载本地界面及限定地图瓦片图片的 WebView。
- `app/src/main/assets/index.html`：当前显示算法及手机界面。
- `app/src/main/assets/tracking.js`：稳定检测、定位有效性与记录去重。
- `app/src/main/assets/map.js`：本地 Canvas 地图、瓦片、标记与拖动缩放。
- `app/src/main/assets/protocol.js`：136-byte STATIC2 解码，包括六轴融合标志。

BLE UUID、数据帧和命令与根项目现有固件一致。没有修改设备协议，也没有启用磁力计。

参考：[Android BLE 权限](https://developer.android.com/develop/connectivity/bluetooth/bt-permissions)、[GATT 数据传输](https://developer.android.com/develop/connectivity/bluetooth/ble/transfer-ble-data)。
