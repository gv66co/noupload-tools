'use client';
import { useState } from 'react';
import DropZone from '../../components/DropZone';
import { getFFmpeg, downloadBlob, fmtSize } from '../../lib/ffmpeg';

export default function VideoToMp3() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);

  const convert = async () => {
    setBusy(true);
    setProgress(0);
    setStatus({ kind: '', text: 'Loading the audio engine (first time only, about 30 MB)...' });
    try {
      const ff = await getFFmpeg(setProgress);
      setStatus({ kind: '', text: 'Extracting audio on your device...' });
      const inName = 'in_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      await ff.writeFile(inName, new Uint8Array(await file.arrayBuffer()));
      await ff.exec(['-i', inName, '-vn', '-b:a', '192k', 'out.mp3']);
      const data = await ff.readFile('out.mp3');
      await ff.deleteFile(inName).catch(() => {});
      await ff.deleteFile('out.mp3').catch(() => {});
      const base = file.name.replace(/\.[^.]+$/, '');
      downloadBlob(data, base + '.mp3', 'audio/mpeg');
      setStatus({ kind: 'ok', text: 'Done. Your MP3 is in the downloads folder. Nothing was uploaded.' });
    } catch (e) {
      setStatus({ kind: 'error', text: 'Could not convert: ' + (e?.message || e) });
    }
    setBusy(false);
    setProgress(0);
  };

  return (
    <div className="tool-page">
      <h1>Video to MP3</h1>
      <p className="tool-sub">Extract the audio track from a video as an MP3, without uploading the video.</p>

      <DropZone accept="video/*" onFiles={(f) => { setFile(f[0]); setStatus(null); }} hint="MP4, WebM, MOV and most other formats. Larger files take longer." />

      {file && (
        <div className="file-list">
          <div className="file-row">
            <span className="name">{file.name}</span>
            <span className="meta">{fmtSize(file.size)}</span>
            <button onClick={() => setFile(null)}>✕</button>
          </div>
        </div>
      )}

      <div className="actions">
        <button className="btn" disabled={!file || busy} onClick={convert}>
          {busy ? 'Working...' : 'Extract MP3'}
        </button>
      </div>

      {busy && progress > 0 && (
        <div className="progress-wrap"><div className="progress-bar" style={{ width: Math.round(progress * 100) + '%' }} /></div>
      )}
      {status && <p className={'status ' + status.kind}>{status.text}</p>}

      <div className="seo-block">
        <h2>Honest notes</h2>
        <p>
          The converter is the real FFmpeg, compiled to run inside your browser. The first
          use downloads the engine (about 30 MB), after that it is cached. Conversion
          speed depends on your device: a phone will be slower than a laptop, and very
          long videos take a while. The trade you get in return is total privacy: the
          video never leaves your hands.
        </p>
      </div>
    </div>
  );
}
