const $ = id => document.getElementById(id);
const safeURL = value => { if (!value) return ''; const url = new URL(value, location.href); if (!['http:', 'https:', 'blob:'].includes(url.protocol)) throw Error('Unsupported URL'); return url.href; };
let videoURL;
$('choose-video').addEventListener('click', () => $('video-file').click());
function loadVideo(src, caption, poster = '') {
  const video = document.createElement('video'); video.controls = true; video.playsInline = true; video.preload = 'metadata'; video.src = safeURL(src);
  if (poster) video.poster = safeURL(poster);
  const fallback = document.createElement('a'); fallback.href = video.src; fallback.textContent = 'Download video'; video.append(fallback);
  video.addEventListener('error', () => { $('video-caption').textContent = 'Video could not load. Use a browser-compatible MP4 or WebM file.'; });
  $('video-stage').replaceChildren(video); $('video-caption').textContent = caption || 'Local video preview';
}
$('video-file').addEventListener('change', event => { const file = event.target.files[0]; if (!file) return; if (videoURL) URL.revokeObjectURL(videoURL); videoURL = URL.createObjectURL(file); loadVideo(videoURL, file.name); });
try {
  const response = await fetch('content.json'); if (!response.ok) throw Error('Content unavailable'); const content = await response.json();
  if (content.video?.src) loadVideo(content.video.src, content.video.caption, content.video.poster);
  if (content.paper?.url) { $('paper-link').href = safeURL(content.paper.url); $('paper-link').hidden = false; document.querySelector('.paper-note p').textContent = 'The manuscript is available using the Read paper button above.'; }
  for (const item of content.resources || []) { const a = document.createElement('a'); a.href = safeURL(item.url); a.textContent = item.title || 'Download resource'; $('extra-resources').append(a); }
  if (content.video?.src) document.querySelector('#demo .status').textContent = 'Demonstration';
} catch (error) { console.warn('Using default project placeholders:', error.message); }
