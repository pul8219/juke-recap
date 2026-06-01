import { useState, useRef, useEffect } from 'react';
import { updateMemory } from '../api/memoryApi';

function getYoutubeThumbnail(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
}

export default function EditMemoryModal({ memory, onClose, onUpdated }) {
  const [title, setTitle] = useState(memory.title);
  const [memoryDate, setMemoryDate] = useState(memory.memory_date || '');
  const [description, setDescription] = useState(memory.description || '');
  const [youtubeUrl, setYoutubeUrl] = useState(memory.youtube_url || '');
  const [ytThumb, setYtThumb] = useState(getYoutubeThumbnail(memory.youtube_url));
  const [existingPhotos, setExistingPhotos] = useState(memory.photos || []);
  const [deletePhotoIds, setDeletePhotoIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [thumbIdx, setThumbIdx] = useState(() => {
    const idx = (memory.photos || []).findIndex((p) => p.image_url === memory.thumbnail);
    return idx >= 0 ? idx : 0;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();
  const dropRef = useRef();

  const allPhotos = [
    ...existingPhotos.map((p) => ({ type: 'existing', id: p.id, src: p.image_url })),
    ...newPreviews.map((p, i) => ({ type: 'new', idx: i, src: p.src })),
  ];

  const handleNewFiles = (files) => {
    const arr = Array.from(files);
    setNewFiles((prev) => [...prev, ...arr]);
    const previews = arr.map((f) => ({ name: f.name, src: URL.createObjectURL(f) }));
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const removeExistingPhoto = (photoId, photoIdx) => {
    setDeletePhotoIds((prev) => [...prev, photoId]);
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    if (thumbIdx === photoIdx) setThumbIdx(0);
    else if (thumbIdx > photoIdx) setThumbIdx((prev) => prev - 1);
  };

  const removeNewPhoto = (newIdx) => {
    const allIdx = existingPhotos.length + newIdx;
    setNewFiles((prev) => prev.filter((_, i) => i !== newIdx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== newIdx));
    if (thumbIdx === allIdx) setThumbIdx(0);
    else if (thumbIdx > allIdx) setThumbIdx((prev) => prev - 1);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropRef.current.style.borderColor = '#3a3a3c';
    if (e.dataTransfer.files.length) handleNewFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) { setError('제목을 입력해주세요.'); return; }
    if (allPhotos.length === 0) { setError('사진이 한 장 이상 필요합니다.'); return; }
    setSaving(true);
    try {
      const updated = await updateMemory(memory.id, {
        title,
        description,
        youtube_url: youtubeUrl,
        memory_date: memoryDate,
        thumbnail_index: thumbIdx,
        delete_photo_ids: deletePhotoIds,
        new_photos: newFiles,
      });
      onUpdated(updated);
    } catch (e) {
      setError('수정에 실패했습니다. 다시 시도해주세요.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [saving, onClose]);

  const inputStyle = {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #3a3a3c',
    background: '#1c1c1e',
    color: '#fff',
    fontSize: 15,
    outline: 'none',
    WebkitAppearance: 'none',
    appearance: 'none',
  };

  const labelStyle = {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: -6,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#2c2c2e',
          borderRadius: 16,
          width: '90%',
          maxWidth: 480,
          maxHeight: '85vh',
          overflowX: 'hidden',
          overflowY: 'auto',
          padding: 24,
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Juke-recap 수정</h2>

        {error && (
          <div style={{
            background: 'rgba(255,59,48,0.15)',
            border: '1px solid rgba(255,59,48,0.3)',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 14,
            fontSize: 14,
            color: '#ff6961',
            animation: 'fadeIn 0.2s ease',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={labelStyle}>제목</div>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              style={{ ...inputStyle, marginTop: 6 }}
            />
          </div>

          <div>
            <div style={labelStyle}>날짜</div>
            <input
              type="date"
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
              style={{ ...inputStyle, marginTop: 6 }}
            />
          </div>

          <div>
            <div style={labelStyle}>설명 (선택)</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', marginTop: 6 }}
            />
          </div>

          <div>
            <div style={labelStyle}>배경 음악 (선택)</div>
            <input
              type="url"
              placeholder="YouTube 음악 링크를 붙여넣으세요"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onBlur={() => setYtThumb(getYoutubeThumbnail(youtubeUrl))}
              style={{ ...inputStyle, marginTop: 6 }}
            />
          </div>
          {ytThumb && (
            <img
              src={ytThumb}
              alt="YouTube thumbnail"
              style={{ width: '100%', borderRadius: 8 }}
            />
          )}

          <div>
            <div style={labelStyle}>사진 추가</div>
            <div
              ref={dropRef}
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => {
                e.preventDefault();
                dropRef.current.style.borderColor = '#0a84ff';
              }}
              onDragLeave={() => {
                dropRef.current.style.borderColor = '#3a3a3c';
              }}
              onDrop={handleDrop}
              style={{
                border: '2px dashed #3a3a3c',
                borderRadius: 12,
                padding: '20px 16px',
                textAlign: 'center',
                color: '#8e8e93',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                marginTop: 6,
                fontSize: 14,
              }}
            >
              클릭 또는 드래그하여 사진 추가
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => { handleNewFiles(e.target.files); setError(''); }}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {allPhotos.length > 0 && (
            <>
              <div style={{ fontSize: 12, color: '#8e8e93' }}>
                사진을 클릭하면 대표 썸네일로 지정됩니다
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
              }}>
                {allPhotos.map((p, i) => (
                  <div
                    key={p.type === 'existing' ? p.id : `new-${p.idx}`}
                    onClick={() => setThumbIdx(i)}
                    style={{
                      position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
                      cursor: 'pointer',
                      border: i === thumbIdx ? '2px solid #0a84ff' : '2px solid transparent',
                    }}
                  >
                    <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {i === thumbIdx && (
                      <div style={{
                        position: 'absolute', bottom: 4, left: 4,
                        background: '#0a84ff', borderRadius: 4,
                        padding: '2px 6px', fontSize: 10, color: '#fff', fontWeight: 600,
                      }}>
                        대표
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (p.type === 'existing') {
                          const existIdx = existingPhotos.findIndex((ep) => ep.id === p.id);
                          removeExistingPhoto(p.id, i);
                        } else {
                          removeNewPhoto(p.idx);
                        }
                      }}
                      style={{
                        position: 'absolute', top: 4, right: 4,
                        width: 24, height: 24, borderRadius: '50%',
                        border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff',
                        fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              padding: '10px 24px', borderRadius: 10,
              border: '1px solid #3a3a3c', background: 'transparent',
              color: '#fff', fontSize: 15,
              opacity: saving ? 0.5 : 1,
            }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: '10px 24px', borderRadius: 10,
              border: 'none', background: '#0a84ff',
              color: '#fff', fontSize: 15,
              opacity: saving ? 0.5 : 1,
              minWidth: 100,
            }}
          >
            {saving ? '저장 중...' : '수정'}
          </button>
        </div>

        {saving && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            borderRadius: 16,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
            backdropFilter: 'blur(2px)',
            animation: 'fadeIn 0.2s ease',
          }}>
            <div style={{
              width: 36, height: 36,
              border: '3px solid rgba(255,255,255,0.2)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{ marginTop: 14, fontSize: 15, color: '#fff' }}>
              수정 사항을 저장하고 있어요...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
