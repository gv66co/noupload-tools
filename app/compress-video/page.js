'use client';
import { useState } from 'react';
import DropZone from '../../components/DropZone';
import { getFFmpeg, downloadBlob, fmtSize } from '../../lib/ffmpeg';

const PRESETS = {
  chat: { label: 'Chat / messenger (smallest, 480p)', args: ['-vf', 'scale=-2:480', '-c:v', 'libx264', '-crf', '32', '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '96k'] },
  email: { label: 'Email attachment (balanced, 720p)', args: ['-vf', 'scale=-2:720', '-c:v', 'libx264', '-crf', '28', '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '128k'] },
  quality: { label: 'Keep quality (just smaller file)', args: ['-c:v', 'libx264', '-crf', '24', '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '128k'] },
};

export default function CompressVideo() {
  const [file, setFile] = useState(null);
  const [preset, setPreset] = useState('email');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);

  const compress = async () => {
    setBusy(true);
    setProgress(0);
    setStatus({ kind: '', text: 'Loading the video engine (first time only, about 30 MB)...' });
    try {
      const ff = await getFFmpeg(setProgress);
      setStatus({ kind: '', text: 'Compressing on your device. Long videos take a while, the tab must stay open.' });
      const inName = 'in_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      await ff.writeFile(inName, new Uint8Array(await file.arrayBuffer()));
      await ff.exec(['-i', inName, ...PRESETS[preset].args, 'out.mp4']);
      const data = await ff.readFile('out.mp4');
      await ff.deleteFile(inName).catch(() => {});
      await ff.deleteFile('out.mp4').catch(() => {});
      const base = file.name.replace(/\.[^.]+$/, '');
      downloadBlob(data, base + '_compressed.mp4', 'video/mp4');
      const ratio = data.length && file.size ? Math.round((1 - data.length / file.size) * 100) : 0;
      const sizeNote = ratio > 0
        ? `${fmtSize(file.size)} became ${fmtSize(data.length)} (${ratio}% smaller)`
        : `${fmtSize(file.size)} became ${fmtSize(data.length)}; this clip was already tiny, real videos shrink a lot more`;
      setStatus({ kind: 'ok', text: `Done. ${sizeNote}. Nothing was uploaded.` });
    } catch (e) {
      setStatus({ kind: 'error', text: 'Could not compress: ' + (e?.message || e) });
    }
    setBusy(false);
    setProgress(0);
  };

  return (
    <div className="tool-page">
      <h1>Compress a video</h1>
      <p className="tool-sub">Shrink a video for chat or email, without handing it to a server.</p>

      <DropZone accept="video/*" onFiles={(f) => { setFile(f[0]); setStatus(null); }} hint="Works best for clips up to a few hundred MB" />

      {file && (
        <div className="file-list">
          <div className="file-row">
            <span className="name">{file.name}</span>
            <span className="meta">{fmtSize(file.size)}</span>
            <button onClick={() => setFile(null)}>✕</button>
          </div>
        </div>
      )}

      <div className="field-row">
        <label>Target</label>
        <select value={preset} onChange={(e) => setPreset(e.target.value)}>
          {Object.entries(PRESETS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="actions">
        <button className="btn" disabled={!file || busy} onClick={compress}>
          {busy ? 'Working...' : 'Compress video'}
        </button>
      </div>

      {busy && progress > 0 && (
        <div className="progress-wrap"><div className="progress-bar" style={{ width: Math.round(progress * 100) + '%' }} /></div>
      )}
      {status && <p className={'status ' + status.kind}>{status.text}</p>}

      <div className="seo-block">
        <h2>What to expect</h2>
        <p>
          Compression runs on your own processor, so it is slower than a paid server
          farm: roughly real time or slower depending on your device. What you gain is
          that a private video stays private. For a two minute clip that is usually a
          fair trade; for an hour of footage you may want a desktop app instead, and
          that is an honest limit of running in a browser.
        </p>
      </div>
    </div>
  );
}
