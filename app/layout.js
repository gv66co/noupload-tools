import './globals.css';

export const metadata = {
  title: 'NoUpload Tools - convert and edit files without uploading them',
  description:
    'Free PDF and video tools that run entirely in your browser. Merge PDFs, split PDFs, extract MP3 audio and compress video. Your files never leave your device.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a href="/" className="brand">
            <span className="brand-mark">⛨</span> NoUpload<span className="brand-dim">.tools</span>
          </a>
          <nav className="site-nav">
            <a href="/pdf-merge/">Merge PDF</a>
            <a href="/pdf-split/">Split PDF</a>
            <a href="/video-to-mp3/">Video to MP3</a>
            <a href="/compress-video/">Compress video</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>
            Every tool on this site runs inside your browser. Files are processed on your
            device and are never uploaded to any server. Close the tab and nothing remains.
          </p>
          <p className="footer-dim">NoUpload Tools by GV66 INC</p>
        </footer>
      </body>
    </html>
  );
}
