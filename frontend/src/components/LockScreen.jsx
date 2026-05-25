import { useState, useEffect, useCallback } from 'react';

export default function LockScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const verify = useCallback(async (code) => {
    setChecking(true);
    try {
      const res = await fetch('/api/verify-pin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: code }),
      });
      if (res.ok) {
        setUnlocked(true);
        setTimeout(() => onUnlock(), 1500);
      } else {
        setError(true);
        setTimeout(() => { setPin(''); setError(false); }, 600);
      }
    } catch {
      setError(true);
      setTimeout(() => { setPin(''); setError(false); }, 600);
    } finally {
      setChecking(false);
    }
  }, [onUnlock]);

  const handleDigit = useCallback((digit) => {
    if (error || checking || unlocked) return;
    const next = pin + digit;
    if (next.length >= 6) {
      setPin(next);
      verify(next);
    } else {
      setPin(next);
    }
  }, [pin, error, checking, unlocked, verify]);

  const handleDelete = useCallback(() => {
    if (error || checking || unlocked) return;
    setPin((p) => p.slice(0, -1));
  }, [error, checking, unlocked]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
      if (e.key === 'Backspace') handleDelete();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleDigit, handleDelete]);

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [null, '0', 'del'],
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 999,
      userSelect: 'none',
      opacity: unlocked ? 0 : 1,
      transition: 'opacity 0.6s ease 0.8s',
    }}>
      <div style={{
        fontSize: 48, marginBottom: 16,
        transition: 'all 0.5s ease',
        transform: unlocked ? 'scale(1.3)' : 'scale(1)',
        opacity: unlocked ? 0 : 1,
      }}>
        {unlocked ? '🔓' : '🔒'}
      </div>
      <div style={{
        fontSize: 20, fontWeight: 600, color: '#fff',
        marginBottom: 8,
        transition: 'opacity 0.4s ease',
        opacity: unlocked ? 0 : 1,
      }}>
        Juke-recap 📀
      </div>
      <div style={{
        fontSize: 14, color: '#8e8e93',
        marginBottom: 28,
        transition: 'opacity 0.3s ease',
        opacity: unlocked ? 0 : 1,
      }}>
        암호를 입력하세요
      </div>

      <div style={{
        display: 'flex', gap: 14,
        marginBottom: 40,
        transition: 'opacity 0.3s ease',
        opacity: unlocked ? 0 : 1,
      }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 14, height: 14,
              borderRadius: '50%',
              border: '2px solid #fff',
              background: i < pin.length ? '#fff' : 'transparent',
              transition: 'background 0.15s',
              animation: error ? 'shake 0.4s ease' : 'none',
            }}
          />
        ))}
      </div>

      {error && (
        <div style={{
          fontSize: 14, color: '#ff453a',
          marginTop: -28, marginBottom: 16,
          animation: 'fadeIn 0.2s ease',
        }}>
          암호가 올바르지 않습니다
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 80px)',
        gap: 16,
        justifyContent: 'center',
        transition: 'opacity 0.3s ease',
        opacity: unlocked ? 0 : 1,
      }}>
        {keys.flat().map((key, i) => {
          if (key === null) return <div key={i} />;
          if (key === 'del') {
            return (
              <button
                key={i}
                onClick={handleDelete}
                style={{
                  width: 80, height: 80,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  color: '#fff',
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ⌫
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => handleDigit(key)}
              style={{
                width: 80, height: 80,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: 32,
                fontWeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseDown={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseUp={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
