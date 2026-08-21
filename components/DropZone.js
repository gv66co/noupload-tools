'use client';
import { useRef, useState } from 'react';

export default function DropZone({ accept, multiple, onFiles, hint }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const handle = (list) => {
    const files = Array.from(list || []);
    if (files.length) onFiles(files);
  };

  return (
    <div
      className={'dropzone' + (drag ? ' drag' : '')}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
    >
      <p className="big">Drop files here or tap to choose</p>
      <p>{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => { handle(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}
