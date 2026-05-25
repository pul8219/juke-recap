import { useState } from 'react';

export default function MemoryCard({ memory, index = 0, onClick }) {
  const [hover, setHover] = useState(false);
  const dateStr = memory.memory_date || memory.created_at;
  const date = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const delay = Math.min(index * 60, 600);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 8,
        overflow: 'hidden',
        background: '#1c1c1e',
        cursor: 'pointer',
        transform: hover ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.2s ease',
        animation: `cardAppear 0.4s ease ${delay}ms both`,
      }}
    >
      <div style={{
        width: '100%',
        aspectRatio: '1',
        background: '#2c2c2e',
        overflow: 'hidden',
      }}>
        {memory.thumbnail ? (
          <img
            src={memory.thumbnail}
            alt={memory.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#666', fontSize: 28,
          }}>
            🖼
          </div>
        )}
      </div>
      <div style={{ padding: '6px 8px' }}>
        <div style={{
          fontSize: 12, fontWeight: 600,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {memory.title}
        </div>
        <div style={{ fontSize: 10, color: '#8e8e93', marginTop: 2 }}>
          {date}
        </div>
      </div>
    </div>
  );
}
