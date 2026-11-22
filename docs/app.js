const $ = id => document.getElementById(id);
const safeURL = value => { if (!value) return ''; const url = new URL(value, location.href); if (!['http:', 'https:', 'blob:'].includes(url.protocol)) throw Error('Unsupported URL'); return url.href; };
let model, modelURL, videoURL, modelLibrary;
$('choose-model').addEventListener('click', () => $('model-file').click());
$('choose-video').addEventListener('click', () => $('video-file').click());
async function loadModel(src, caption, autoRotate = true, poster = '') {
  $('model-feedback').textContent = 'Loading 3D viewer…';
  try {
    modelLibrary ||= import('https://unpkg.com/@google/model-viewer@4.1.0/dist/model-viewer.min.js').catch(error => { modelLibrary = undefined; throw error; });
    await modelLibrary;
    model = document.createElement('model-viewer');
    model.setAttribute('camera-controls', ''); model.setAttribute('touch-action', 'pan-y');
    model.setAttribute('alt', caption || 'Interactive hardware model');
    model.setAttribute('shadow-intensity', '1');
    if (autoRotate && !matchMedia('(prefers-reduced-motion: reduce)').matches) model.setAttribute('auto-rotate', '');
    if (poster) model.poster = safeURL(poster);
    model.addEventListener('load', () => { $('model-feedback').textContent = 'Drag to rotate · scroll or pinch to zoom. Local previews are not published.'; });
    model.addEventListener('error', () => { $('model-feedback').textContent = 'Unable to load this model. Use a valid GLB, or glTF with accessible linked assets.'; });
    model.src = safeURL(src); $('model-stage').replaceChildren(model);
    $('model-caption').textContent = caption || 'Local model preview';
    $('rotate-model').hidden = $('reset-model').hidden = false;
    $('rotate-model').textContent = model.hasAttribute('auto-rotate') ? 'Pause rotation' : 'Start rotation';
  } catch { $('model-feedback').textContent = 'The 3D viewer could not load. Check your internet connection and try selecting the model again.'; }
}
function loadVideo(src, caption, poster = '') {
  const video = document.createElement('video'); video.controls = true; video.playsInline = true; video.preload = 'metadata'; video.src = safeURL(src);
  if (poster) video.poster = safeURL(poster);
  const fallback = document.createElement('a'); fallback.href = video.src; fallback.textContent = 'Download video'; video.append(fallback);
  video.addEventListener('error', () => { $('video-caption').textContent = 'Video could not load. Use a browser-compatible MP4 or WebM file.'; });
  $('video-stage').replaceChildren(video); $('video-caption').textContent = caption || 'Local video preview';
}
$('model-file').addEventListener('change', async event => { const file = event.target.files[0]; if (!file) return; if (!/\.glb$/i.test(file.name)) { $('model-feedback').textContent = 'Choose a .glb file for a self-contained local preview.'; return; } if (modelURL) URL.revokeObjectURL(modelURL); modelURL = URL.createObjectURL(file); await loadModel(modelURL, file.name); });
$('video-file').addEventListener('change', event => { const file = event.target.files[0]; if (!file) return; if (videoURL) URL.revokeObjectURL(videoURL); videoURL = URL.createObjectURL(file); loadVideo(videoURL, file.name); });
$('rotate-model').addEventListener('click', () => { if (!model) return; model.toggleAttribute('auto-rotate'); $('rotate-model').textContent = model.hasAttribute('auto-rotate') ? 'Pause rotation' : 'Start rotation'; });
$('reset-model').addEventListener('click', () => { if (model) { model.cameraOrbit = '0deg 75deg 105%'; model.cameraTarget = 'auto auto auto'; model.fieldOfView = 'auto'; } });
try {
  const response = await fetch('content.json'); if (!response.ok) throw Error('Content unavailable'); const content = await response.json();
  if (content.model?.src) loadModel(content.model.src, content.model.caption, content.model.autoRotate !== false, content.model.poster);
  if (content.video?.src) loadVideo(content.video.src, content.video.caption, content.video.poster);
  if (content.paper?.url) { $('paper-link').href = safeURL(content.paper.url); $('paper-link').hidden = false; document.querySelector('.paper-note p').textContent = 'The manuscript is available using the Read paper button above.'; }
  for (const item of content.resources || []) { const a = document.createElement('a'); a.href = safeURL(item.url); a.textContent = item.title || 'Download resource'; $('extra-resources').append(a); }
  if (content.model?.src) document.querySelector('#model .status').textContent = 'Interactive model';
  if (content.video?.src) document.querySelector('#demo .status').textContent = 'Demonstration';
} catch (error) { console.warn('Using default project placeholders:', error.message); }
