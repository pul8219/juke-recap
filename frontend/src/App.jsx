import { useState, useEffect, useCallback } from 'react';
import LockScreen from './components/LockScreen';
import MemoryGrid from './components/MemoryGrid';
import MemoryViewer from './components/MemoryViewer';
import AddMemoryModal from './components/AddMemoryModal';
import { fetchMemories, fetchMemory, deleteMemory } from './api/memoryApi';

const SESSION_KEY = 'unlock_ts';
const SESSION_TTL = 30 * 60 * 1000;

function isSessionValid() {
  const ts = sessionStorage.getItem(SESSION_KEY);
  if (!ts) return false;
  return Date.now() - Number(ts) < SESSION_TTL;
}

export default function App() {
  const [unlocked, setUnlocked] = useState(isSessionValid);
  const [memories, setMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('newest');

  const loadMemories = useCallback(async () => {
    try {
      const data = await fetchMemories();
      setMemories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const handleCardClick = async (id) => {
    try {
      const data = await fetchMemory(id);
      setSelectedMemory(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMemory(id);
      setSelectedMemory(null);
      loadMemories();
    } catch (e) {
      console.error(e);
    }
  };

  const sortedMemories = [...memories].sort((a, b) => {
    const dateA = a.memory_date || a.created_at;
    const dateB = b.memory_date || b.created_at;
    return sortOrder === 'newest'
      ? dateB.localeCompare(dateA)
      : dateA.localeCompare(dateB);
  });

  const handleCreated = () => {
    setShowModal(false);
    loadMemories();
  };

  if (!unlocked) {
    return <LockScreen onUnlock={() => {
      sessionStorage.setItem(SESSION_KEY, String(Date.now()));
      setUnlocked(true);
    }} />;
  }

  if (selectedMemory) {
    return (
      <MemoryViewer
        memory={selectedMemory}
        onBack={() => setSelectedMemory(null)}
        onDelete={() => handleDelete(selectedMemory.id)}
        onUpdated={(updated) => {
          setSelectedMemory(updated);
          loadMemories();
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        padding: '20px 24px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>
          Juke-recap 📀
        </span>
        <button
          onClick={() => setSortOrder((o) => o === 'newest' ? 'oldest' : 'newest')}
          style={{
            background: '#1c1c1e',
            border: '1px solid #3a3a3c',
            color: '#fff',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {sortOrder === 'newest' ? '↓ 최신순' : '↑ 오래된순'}
        </button>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#666' }}>
          불러오는 중...
        </div>
      ) : (
        <MemoryGrid memories={sortedMemories} sortKey={sortOrder} onCardClick={handleCardClick} />
      )}

      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          background: '#0a84ff',
          color: '#fff',
          fontSize: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(10,132,255,0.4)',
          zIndex: 100,
        }}
      >
        +
      </button>

      {showModal && (
        <AddMemoryModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
