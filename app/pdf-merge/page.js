'use client';
import { useState } from 'react';
import DropZone from '../../components/DropZone';
import { downloadBlob, fmtSize } from '../../lib/ffmpeg';

export default function PdfMerge() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  const move = (i, dir) => {
    const next = [...files];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setFiles(next);
  };

  const merge = async () => {
    setBusy(true);
    setStatus({ kind: '', text: 'Merging on your device...' });
    try {
      const { PDFDocument } = await import('pdf-lib');
      const out = await PDFDocument.create();
      for (const f of files) {
        const src = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const bytes = await out.save();
      downloadBlob(bytes, 'merged.pdf', 'application/pdf');
      setStatus({ kind: 'ok', text: 'Done. merged.pdf is in your downloads. Nothing was uploaded.' });
    } catch (e) {
      setStatus({ kind: 'error', text: 'Could not merge: ' + (e?.message || e) });
    }
    setBusy(false);
  };

  return (
    <div className="tool-page">
      <h1>Merge PDF files</h1>
      <p className="tool-sub">Combine PDFs into one file, in your order, without uploading them anywhere.</p>

      <DropZone accept="application/pdf" multiple onFiles={(f) => setFiles((p) => [...p, ...f])} hint="PDF files, any size your device can handle" />

      {files.length > 0 && (
        <div className="file-list">
          {files.map((f, i) => (
            <div className="file-row" key={i}>
              <span className="name">{i + 1}. {f.name}</span>
              <span className="meta">{fmtSize(f.size)}</span>
              <span>
                <button onClick={() => move(i, -1)} title="Move up">↑</button>
                <button onClick={() => move(i, 1)} title="Move down">↓</button>
                <button onClick={() => setFiles(files.filter((_, k) => k !== i))} title="Remove">✕</button>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="actions">
        <button className="btn" disabled={files.length < 2 || busy} onClick={merge}>
          {busy ? 'Working...' : 'Merge ' + (files.length || '') + ' PDFs'}
        </button>
        {files.length > 0 && (
          <button className="btn secondary" disabled={busy} onClick={() => setFiles([])}>Clear</button>
        )}
      </div>

      {status && <p className={'status ' + status.kind}>{status.text}</p>}

      <div className="seo-block">
        <h2>How this works</h2>
        <p>
          The merging happens in your browser using an open source PDF engine. The files
          you pick are read from your disk into your browser&apos;s memory, combined there,
          and the result is saved straight back to your downloads folder. There is no
          upload step, no server, no account and no file size limit beyond your
          device&apos;s memory.
        </p>
        <h2>When to use it</h2>
        <p>
          Contracts with signature pages, scans that arrived as separate files, chapters
          of a report, invoices for one claim. Anything you would rather not hand to a
          random converter site: the whole point of this tool is that nobody else ever
          sees the document.
        </p>
      </div>
    </div>
  );
}
