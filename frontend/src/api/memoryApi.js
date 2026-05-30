const BASE = '/api';

export async function fetchMemories() {
  const res = await fetch(`${BASE}/memories/`);
  if (!res.ok) throw new Error('Failed to fetch memories');
  return res.json();
}

export async function fetchMemory(id) {
  const res = await fetch(`${BASE}/memories/${id}/`);
  if (!res.ok) throw new Error('Failed to fetch memory');
  return res.json();
}

export async function createMemory({ title, description, youtube_url, memory_date, thumbnail_index, photos }) {
  const form = new FormData();
  form.append('title', title);
  if (description) form.append('description', description);
  if (youtube_url) form.append('youtube_url', youtube_url);
  if (memory_date) form.append('memory_date', memory_date);
  if (thumbnail_index != null) form.append('thumbnail_index', thumbnail_index);
  photos.forEach((file) => form.append('photos', file));

  const res = await fetch(`${BASE}/memories/`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Failed to create memory');
  return res.json();
}

export async function updateMemory(id, { title, description, youtube_url, memory_date, thumbnail_index, delete_photo_ids, new_photos }) {
  const form = new FormData();
  if (title != null) form.append('title', title);
  if (description != null) form.append('description', description);
  if (youtube_url != null) form.append('youtube_url', youtube_url);
  if (memory_date != null) form.append('memory_date', memory_date);
  if (thumbnail_index != null) form.append('thumbnail_index', thumbnail_index);
  if (delete_photo_ids) delete_photo_ids.forEach((id) => form.append('delete_photo_ids', id));
  if (new_photos) new_photos.forEach((file) => form.append('new_photos', file));

  const res = await fetch(`${BASE}/memories/${id}/`, { method: 'PATCH', body: form });
  if (!res.ok) throw new Error('Failed to update memory');
  return res.json();
}

export async function deleteMemory(id) {
  const res = await fetch(`${BASE}/memories/${id}/`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete memory');
}

export async function addPhotos(memoryId, photos) {
  const form = new FormData();
  photos.forEach((file) => form.append('photos', file));

  const res = await fetch(`${BASE}/memories/${memoryId}/photos/`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Failed to add photos');
  return res.json();
}

export async function deletePhoto(photoId) {
  const res = await fetch(`${BASE}/photos/${photoId}/`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete photo');
}
