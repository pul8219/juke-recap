import { useState, useEffect } from 'react';
import SlideShow from './SlideShow';
import YoutubePlayer from './YoutubePlayer';

export default function MemoryViewer({ memory, onBack, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [songTitle, setSongTitle] = useState('');

  useEffect(() => {
    if (!memory.youtube_url) return;
    fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(memory.youtube_url)}&format=json`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.title) setSongTitle(data.title); })
      .catch(() => {});
  }, [memory.youtube_url]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (showConfirm) setShowConfirm(false);
        else onBack();
      }
      if (e.key === 'Enter' && showConfirm) onDelete();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showConfirm, onBack, onDelete]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000', zIndex: 200,
      animation: 'fadeIn 0.3s ease',
    }}>
      {memory.photos?.length > 0 && (
        <SlideShow photos={memory.photos} />
      )}

      {memory.youtube_url && (
        <YoutubePlayer url={memory.youtube_url} />
      )}

      <button
        onClick={onBack}
        style={{
          position: 'absolute', top: 16, left: 16, zIndex: 210,
          background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
          width: 44, height: 44, borderRadius: '50%',
          fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)',
        }}
      >
        ←
      </button>

      {songTitle && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: 68,
          right: 80,
          zIndex: 210,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          animation: 'fadeIn 0.5s ease',
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: 20,
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            maxWidth: '100%',
          }}>
            <span style={{ fontSize: 14, animation: 'musicBounce 1s ease infinite' }}>♪</span>
            <span style={{
              fontSize: 13,
              color: '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {songTitle}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowConfirm(true)}
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 210,
          background: 'rgba(255,59,48,0.6)', border: 'none', color: '#fff',
          padding: '8px 16px', borderRadius: 20,
          fontSize: 14, backdropFilter: 'blur(10px)',
        }}
      >
        삭제
      </button>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 205,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        padding: '40px 24px 24px',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          {memory.title}
        </h2>
        {memory.description && (
          <p style={{ fontSize: 15, color: '#ccc', lineHeight: 1.5 }}>
            {memory.description}
          </p>
        )}
      </div>

      {showConfirm && (
        <div
          onClick={() => setShowConfirm(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#2c2c2e',
              borderRadius: 16,
              width: 300,
              overflow: 'hidden',
              textAlign: 'center',
            }}
          >
            <div style={{ padding: '24px 20px 16px' }}>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
                Juke-recap 삭제
              </div>
              <div style={{ fontSize: 14, color: '#8e8e93', lineHeight: 1.5 }}>
                "{memory.title}"을(를) 삭제하시겠습니까?<br />
                사진과 음악이 함께 영구적으로 삭제됩니다.
              </div>
            </div>

            <div style={{ borderTop: '1px solid #3a3a3c' }}>
              <button
                onClick={onDelete}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  border: 'none',
                  borderBottom: '1px solid #3a3a3c',
                  background: 'transparent',
                  color: '#ff453a',
                  fontSize: 17,
                  fontWeight: 600,
                }}
              >
                삭제
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  border: 'none',
                  background: 'transparent',
                  color: '#0a84ff',
                  fontSize: 17,
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
