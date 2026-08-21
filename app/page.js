export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>File tools that never see your files</h1>
        <p>
          Merge PDFs, split PDFs, pull MP3 audio out of a video, shrink a video for
          sharing. Everything runs <span className="promise">inside your browser</span>.
          Nothing is uploaded. There is no server that could keep a copy.
        </p>
      </section>

      <div className="tool-grid">
        <a className="tool-card" href="/pdf-merge/">
          <h3>Merge PDF</h3>
          <p>Combine several PDFs into one file, in the order you choose.</p>
        </a>
        <a className="tool-card" href="/pdf-split/">
          <h3>Split PDF</h3>
          <p>Pull out a page range or break a PDF into separate pages.</p>
        </a>
        <a className="tool-card" href="/video-to-mp3/">
          <h3>Video to MP3</h3>
          <p>Extract the audio track from any video as an MP3.</p>
        </a>
        <a className="tool-card" href="/compress-video/">
          <h3>Compress video</h3>
          <p>Shrink a video so it fits in an email or a chat message.</p>
        </a>
      </div>

      <div className="privacy-note">
        Why this matters: the usual online converters upload your file to their servers,
        process it there and keep logs. Contracts, IDs, family videos, medical scans all
        pass through someone else&apos;s machine. Here the work happens on your device,
        powered by the same technology those servers use, compiled to run in your browser.
        Disconnect from the internet after the page loads and every tool still works.
      </div>
    </>
  );
}
