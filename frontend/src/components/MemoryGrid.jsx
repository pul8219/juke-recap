import MemoryCard from './MemoryCard';

export default function MemoryGrid({ memories, sortKey, onCardClick }) {
  if (!memories.length) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#666' }}>
        아직 Juke-recap이 없습니다. + 버튼을 눌러 첫 번째 recap을 만들어보세요.
      </div>
    );
  }

  return (
    <div className="memory-grid">
      {memories.map((m, i) => (
        <MemoryCard key={`${sortKey}-${m.id}`} memory={m} index={i} onClick={() => onCardClick(m.id)} />
      ))}
    </div>
  );
}
