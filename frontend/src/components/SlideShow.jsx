import { useState, useEffect, useCallback, useRef } from 'react';

export default function SlideShow({ photos }) {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const [hovered, setHovered] = useState(false);
  const thumbRefs = useRef([]);

  const goTo = useCallback((idx) => {
    setFade(false);
    setTimeout(() => {
      setCurrent(idx);
      setFade(true);
    }, 300);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % photos.length);
  }, [current, photos.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + photos.length) % photos.length);
  }, [current, photos.length, goTo]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, photos.length]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev, photos.length]);

  useEffect(() => {
    thumbRefs.current[current]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [current]);

  if (!photos.length) return null;

  const arrowStyle = (side) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: 16,
    zIndex: 206,
    background: 'rgba(0,0,0,0.4)',
    border: 'none',
    color: '#fff',
    width: 44,
    height: 44,
    borderRadius: '50%',
    fontSize: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: hovered ? 1 : 0,
    transition: 'opacity 0.3s',
    backdropFilter: 'blur(10px)',
  });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'absolute', inset: 0, zIndex: 200 }}
    >
      <img
        src={photos[current].image_url}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(30px) brightness(0.4)',
          transform: 'scale(1.1)',
          opacity: fade ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      <img
        src={photos[current].image_url}
        alt=""
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: fade ? 1 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: 1,
        }}
      />

      {photos.length > 1 && (
        <>
          <button onClick={prev} style={arrowStyle('left')}>‹</button>
          <button onClick={next} style={arrowStyle('right')}>›</button>

          <div style={{
            position: 'absolute',
            bottom: 100,
            left: 0,
            right: 0,
            zIndex: 206,
            display: 'flex',
            justifyContent: 'center',
          }}>
            <div style={{
              display: 'flex',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 12,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              overflowX: 'auto',
              maxWidth: '90%',
            }}>
              {photos.map((photo, i) => (
                <button
                  key={i}
                  ref={(el) => (thumbRefs.current[i] = el)}
                  onClick={() => goTo(i)}
                  style={{
                    flex: '0 0 48px',
                    width: 48,
                    height: 48,
                    borderRadius: 6,
                    border: i === current ? '2px solid #fff' : '2px solid transparent',
                    padding: 0,
                    overflow: 'hidden',
                    opacity: i === current ? 1 : 0.5,
                    transition: 'all 0.3s',
                    background: 'none',
                  }}
                >
                  <img
                    src={photo.image_url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
