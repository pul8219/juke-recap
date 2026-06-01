import { useState, useRef, useMemo, useEffect, useCallback } from 'react';

function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

let apiReady = !!window.YT?.Player;
const apiCallbacks = [];

function loadYouTubeAPI() {
  if (apiReady) return;
  if (document.getElementById('yt-api-script')) return;
  const tag = document.createElement('script');
  tag.id = 'yt-api-script';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
  window.onYouTubeIframeAPIReady = () => {
    apiReady = true;
    apiCallbacks.forEach((cb) => cb());
    apiCallbacks.length = 0;
  };
}

function onAPIReady(cb) {
  if (apiReady) cb();
  else apiCallbacks.push(cb);
}

export default function YoutubePlayer({ url }) {
  const [muted, setMuted] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [playError, setPlayError] = useState(false);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const videoId = useMemo(() => extractVideoId(url), [url]);

  useEffect(() => {
    if (!videoId) return;
    setPlayError(false);
    loadYouTubeAPI();

    onAPIReady(() => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: videoId,
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (e) => {
            e.target.playVideo();
          },
          onError: (e) => {
            const code = e.data;
            // 101, 150: embed restricted / not allowed
            // 2: invalid video ID, 5: HTML5 player error, 100: removed/private
            if (code === 101 || code === 150 || code === 100) {
              setPlayError(true);
            }
          },
        },
      });
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  const handleUnmute = useCallback(() => {
    if (playerRef.current?.unMute) {
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
    }
    setMuted(false);
    setShowHint(false);
  }, []);

  const handleMute = useCallback(() => {
    if (playerRef.current?.mute) {
      playerRef.current.mute();
    }
    setMuted(true);
    setShowHint(false);
  }, []);

  if (!videoId) return null;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <div ref={containerRef} />
      </div>
      {playError && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute',
            bottom: 120,
            right: 20,
            zIndex: 210,
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            borderRadius: 22,
            padding: '8px 16px',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backdropFilter: 'blur(10px)',
            textDecoration: 'none',
            animation: 'fadeIn 0.5s ease',
          }}
        >
          <span style={{ fontSize: 16 }}>⚠️</span>
          임베드 제한 영상 — 탭하여 YouTube에서 듣기
        </a>
      )}
      {!playError && muted && showHint && (
        <button
          onClick={handleUnmute}
          style={{
            position: 'absolute',
            bottom: 120,
            right: 20,
            zIndex: 210,
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            borderRadius: 22,
            padding: '8px 16px',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.5s ease',
          }}
        >
          <span style={{ fontSize: 18 }}>🔇</span>
          탭하여 소리 켜기
        </button>
      )}
      {!playError && muted && !showHint && (
        <button
          onClick={handleUnmute}
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
          🔇
        </button>
      )}
      {!playError && !muted && (
        <button
          onClick={handleMute}
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
          🔊
        </button>
      )}
    </>
  );
}
