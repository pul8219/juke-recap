import { useState, useMemo } from 'react';

function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function YoutubePlayer({ url }) {
  const [muted, setMuted] = useState(false);
  const videoId = useMemo(() => extractVideoId(url), [url]);

  if (!videoId) return null;

  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1`;

  return (
    <>
      <iframe
        key={`${videoId}-${muted}`}
        src={src}
        title="YouTube"
        allow="autoplay; encrypted-media"
        allowFullScreen
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
      <button
        onClick={() => setMuted(!muted)}
        style={{
          position: 'absolute',
          bottom: 120,
          right: 20,
          zIndex: 210,
          background: 'rgba(0,0,0,0.5)',
          border: 'none',
          color: '#fff',
          width: 44,
          height: 44,
          borderRadius: '50%',
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
        }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </>
  );
}
