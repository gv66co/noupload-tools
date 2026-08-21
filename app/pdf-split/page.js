'use client';
import { useState } from 'react';
import DropZone from '../../components/DropZone';
import { downloadBlob, fmtSize } from '../../lib/ffmpeg';

export default function PdfSplit() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  const pick = async (files) => {
    const f = files[0];
    setFile(f);
    setStatus(null);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
      const n = doc.getPageCount();
      setPageCount(n);
      setFrom(1);
      setTo(n);
    } catch (e) {
      setStatus({ kind: 'error', text: 'Could not read this PDF: ' + (e?.message || e) });
      setFile(null);
    }
  };

  const extract = async () => {
    setBusy(true);
    setStatus({ kind: '', text: 'Extracting pages on your device...' });
    try {
      const { PDFDocument } = await import('pdf-lib');
      const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const a = Math.max(1, Math.min(from, pageCount));
      const b = Math.max(a, Math.min(to, pageCount));
      const out = await PDFDocument.create();
      const idx = [];
      for (let i = a - 1; i <= b - 1; i++) idx.push(i);
      const pages = await out.copyPages(src, idx);
      pages.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      const base = file.name.replace(/\.pdf$/i, '');
      downloadBlob(bytes, `${base}_p${a}-${b}.pdf`, 'application/pdf');
      setStatus({ kind: 'ok', text: `Done. Pages ${a} to ${b} saved as a new PDF. Nothing was uploaded.` });
    } catch (e) {
      setStatus({ kind: 'error', text: 'Could not split: ' + (e?.message || e) });
    }
    setBusy(false);
  };

  return (
    <div className="tool-page">
      <h1>Split a PDF</h1>
      <p className="tool-sub">Pull a page range out of a PDF into a new file, entirely on your device.</p>

      <DropZone accept="application/pdf" onFiles={pick} hint="One PDF file" />

      {file && (
        <>
          <div className="file-list">
            <div className="file-row">
              <span className="name">{file.name}</span>
              <span className="meta">{fmtSize(file.size)} · {pageCount} pages</span>
              <button onClick={() => { setFile(null); setPageCount(0); }}>✕</button>
            </div>
          </div>
          <div className="field-row">
            <label>Pages from</label>
            <input type="number" min="1" max={pageCount} value={from} onChange={(e) => setFrom(+e.target.value)} style={{ width: 80 }} />
            <label>to</label>
            <input type="number" min="1" max={pageCount} value={to} onChange={(e) => setTo(+e.target.value)} style={{ width: 80 }} />
          </div>
        </>
      )}

      <div className="actions">
        <button className="btn" disabled={!file || busy || pageCount === 0} onClick={extract}>
          {busy ? 'Working...' : 'Extract pages'}
        </button>
      </div>

      {status && <p className={'status ' + status.kind}>{status.text}</p>}

      <div className="seo-block">
        <h2>Private by construction</h2>
        <p>
          This page loads a PDF engine into your browser and does all the work there.
          Your document never crosses the network. That makes it safe for the documents
          people most often need to split: contracts, bank statements, medical records,
          court filings.
        </p>
      </div>
    </div>
  );
}
