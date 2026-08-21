// Vienas ffmpeg.wasm egzempliorius visai svetainei. Single-thread branduolys:
// letesnis uz multi-thread, bet nereikalauja COOP/COEP antrasciu, todel veikia
// ir statiniame hostinge, ir TWA viduje.
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const CORE_VERSION = '0.12.6';
const BASE = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

let instance = null;
let loading = null;

export async function getFFmpeg(onProgress) {
  if (instance) {
    if (onProgress) attachProgress(instance, onProgress);
    return instance;
  }
  if (!loading) {
    loading = (async () => {
      const ff = new FFmpeg();
      await ff.load({
        coreURL: await toBlobURL(`${BASE}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${BASE}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      instance = ff;
      return ff;
    })();
  }
  const ff = await loading;
  if (onProgress) attachProgress(ff, onProgress);
  return ff;
}

function attachProgress(ff, cb) {
  ff.on('progress', ({ progress }) => {
    cb(Math.max(0, Math.min(1, progress)));
  });
}

export function downloadBlob(data, name, type) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function fmtSize(bytes) {
  if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  return Math.round(bytes / 1024) + ' KB';
}
