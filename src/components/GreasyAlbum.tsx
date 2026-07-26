'use client';

import {
  Check,
  ChevronDown,
  Download,
  Edit3,
  Eye,
  Image as ImageIcon,
  Images,
  LoaderCircle,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { ChangeEvent, DragEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Category = 'Workshop Life' | 'Customer Rides' | 'Before & After' | 'Engine Builds';
type SortOption = 'newest' | 'oldest' | 'title';

type GreasyPhotoRecord = {
  id: string;
  title: string;
  caption: string;
  altText: string;
  category: Category;
  featured: boolean;
  createdAt: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  blob: Blob;
};

type PhotoView = Omit<GreasyPhotoRecord, 'blob'> & { url: string };

type EditDraft = {
  title: string;
  caption: string;
  altText: string;
  category: Category;
  featured: boolean;
};

const DB_NAME = 'j1-greasy-album';
const STORE_NAME = 'photos';
const DB_VERSION = 1;
const categories: Category[] = ['Workshop Life', 'Customer Rides', 'Before & After', 'Engine Builds'];

const uploadMessages = [
  '🔧 Certified greasy.',
  '🛢️ Another oily beauty.',
  '🔥 Fresh off the hoist.',
  '🤙 Sheetzzz.',
  '☕ Tea break earned.',
  '⚙️ Mechanic approved.',
  '🏁 Another one for the wall.',
  '🚗 Looks expensive…',
  '🧽 Still didn’t clean the phone, huh?',
];

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open the photo database.'));
  });
}

async function readAllPhotos(): Promise<GreasyPhotoRecord[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as GreasyPhotoRecord[]);
    request.onerror = () => reject(request.error ?? new Error('Unable to load photos.'));
    tx.oncomplete = () => db.close();
  });
}

async function writePhoto(photo: GreasyPhotoRecord): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(photo);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error ?? new Error('Unable to save photo.'));
  });
}

async function removePhoto(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error ?? new Error('Unable to delete photo.'));
  });
}

function cleanTitle(fileName: string) {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

async function optimiseImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image.`);
  if (file.type === 'image/gif') return file;

  const bitmap = await createImageBitmap(file);
  const maxDimension = 1800;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/webp', 0.84);
  });
}

const panelClass = 'rounded-[28px] border border-white/8 bg-[#101216] shadow-[0_20px_70px_rgba(0,0,0,.22)]';
const inputClass =
  'h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-red-500/70 focus:ring-4 focus:ring-red-500/10';

function ModalShell({ children, onClose, wide = false }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:p-6" onMouseDown={onClose}>
      <div
        className={`my-auto w-full ${wide ? 'max-w-6xl' : 'max-w-xl'} overflow-hidden rounded-[30px] border border-white/10 bg-[#111318] shadow-[0_40px_140px_rgba(0,0,0,.7)]`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default function GreasyAlbum() {
  const [photos, setPhotos] = useState<PhotoView[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | Category>('All');
  const [sort, setSort] = useState<SortOption>('newest');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<Category>('Workshop Life');
  const [selected, setSelected] = useState<PhotoView | null>(null);
  const [editing, setEditing] = useState<PhotoView | null>(null);
  const [deleting, setDeleting] = useState<PhotoView | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  }, []);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const records = await readAllPhotos();
      setPhotos((current) => {
        current.forEach((photo) => URL.revokeObjectURL(photo.url));
        return records.map(({ blob, ...photo }) => ({ ...photo, url: URL.createObjectURL(blob) }));
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load Greasy Album.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPhotos();
    return () => {
      setPhotos((current) => {
        current.forEach((photo) => URL.revokeObjectURL(photo.url));
        return current;
      });
    };
  }, [loadPhotos]);

  const filteredPhotos = useMemo(() => {
    const query = search.trim().toLowerCase();
    return photos
      .filter((photo) => {
        const matchesQuery = !query || [photo.title, photo.caption, photo.category, photo.fileName].some((value) => value.toLowerCase().includes(query));
        const matchesCategory = category === 'All' || photo.category === category;
        const matchesFeatured = !featuredOnly || photo.featured;
        return matchesQuery && matchesCategory && matchesFeatured;
      })
      .sort((a, b) => {
        if (sort === 'title') return a.title.localeCompare(b.title);
        const difference = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sort === 'oldest' ? difference : -difference;
      });
  }, [photos, search, category, featuredOnly, sort]);

  const storageUsed = useMemo(() => photos.reduce((total, photo) => total + photo.fileSize, 0), [photos]);
  const featuredCount = useMemo(() => photos.filter((photo) => photo.featured).length, [photos]);

  async function processFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    if (!files.length) {
      setError('Drop image files here — the greasy kind, not paperwork.');
      return;
    }
    if (files.length > 30) {
      setError('Upload a maximum of 30 photos at a time. Even photographers need a break.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');
    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const blob = await optimiseImage(file);
        const record: GreasyPhotoRecord = {
          id: crypto.randomUUID(),
          title: cleanTitle(file.name) || 'Greasy Masterpiece',
          caption: '',
          altText: cleanTitle(file.name) || 'Workshop photo',
          category: uploadCategory,
          featured: false,
          createdAt: new Date().toISOString(),
          fileName: file.name,
          fileType: blob.type || file.type,
          fileSize: blob.size,
          blob,
        };
        await writePhoto(record);
        setUploadProgress(Math.round(((index + 1) / files.length) * 100));
      }
      await loadPhotos();
      showToast(uploadMessages[Math.floor(Math.random() * uploadMessages.length)]);
      if (files.length >= 20) window.setTimeout(() => showToast('📸 Bro… fixing cars or becoming a photographer?'), 3200);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'The upload got stuck on the hoist. Try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void processFiles(event.target.files);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void processFiles(event.dataTransfer.files);
  }

  function beginEdit(photo: PhotoView) {
    setEditing(photo);
    setEditDraft({
      title: photo.title,
      caption: photo.caption,
      altText: photo.altText,
      category: photo.category,
      featured: photo.featured,
    });
  }

  async function saveEdit() {
    if (!editing || !editDraft) return;
    const db = await openDatabase();
    const existing = await new Promise<GreasyPhotoRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(editing.id);
      request.onsuccess = () => resolve(request.result as GreasyPhotoRecord | undefined);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
    if (!existing) return;
    await writePhoto({ ...existing, ...editDraft });
    setEditing(null);
    setEditDraft(null);
    await loadPhotos();
    showToast('⚙️ Greasy masterpiece tuned up.');
  }

  async function toggleFeatured(photo: PhotoView) {
    const db = await openDatabase();
    const existing = await new Promise<GreasyPhotoRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(photo.id);
      request.onsuccess = () => resolve(request.result as GreasyPhotoRecord | undefined);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
    if (!existing) return;
    await writePhoto({ ...existing, featured: !existing.featured });
    await loadPhotos();
    showToast(existing.featured ? 'Removed from the front row.' : '⭐ Hall-of-fame material.');
  }

  async function confirmDelete() {
    if (!deleting) return;
    await removePhoto(deleting.id);
    setDeleting(null);
    if (selected?.id === deleting.id) setSelected(null);
    await loadPhotos();
    showToast('Greasy masterpiece deleted. No Ctrl+Z in the workshop.');
  }

  function downloadPhoto(photo: PhotoView) {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.fileName || `${photo.title}.webp`;
    link.click();
  }

  return (
    <div className="pb-16">
      <section className="relative mb-7 overflow-hidden rounded-[32px] border border-white/10 bg-[#101216] p-6 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-red-600/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-amber-500/8 blur-3xl" />
        <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-red-400">
              <Sparkles size={14} /> J1 workshop gallery
            </div>
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-[-0.045em] sm:text-5xl">
              <Images className="text-red-500" size={42} /> Greasy Album
            </h1>
            <p className="mt-5 text-lg font-bold text-white/75">Hands dirty? Phone dirty? Upload it anyway.</p>
            <p className="mt-1 text-sm text-white/40">Captured with 70% oil, 30% skill. <span className="font-black text-red-400">Sheetzzz. 🤙</span></p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 text-sm font-black shadow-[0_15px_40px_rgba(220,38,38,.28)] transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? <LoaderCircle className="animate-spin" size={19} /> : <UploadCloud size={20} />}
            {uploading ? `Uploading ${uploadProgress}%` : 'Upload photos'}
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />
        </div>
      </section>

      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="rounded-lg p-1 hover:bg-white/10"><X size={17} /></button>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Greasy masterpieces', value: photos.length.toString(), icon: Images },
          { label: 'Featured', value: featuredCount.toString(), icon: Star },
          { label: 'Storage used', value: formatBytes(storageUsed), icon: ImageIcon },
          { label: 'Categories', value: categories.length.toString(), icon: SlidersHorizontal },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`${panelClass} flex items-center gap-4 p-5`}>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-500/10 text-red-400"><Icon size={22} /></div>
              <div><p className="text-2xl font-black tracking-tight">{stat.value}</p><p className="mt-0.5 text-xs font-semibold text-white/35">{stat.label}</p></div>
            </div>
          );
        })}
      </div>

      <div
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false); }}
        onDrop={handleDrop}
        className={`mb-6 overflow-hidden rounded-[28px] border border-dashed p-5 transition sm:p-7 ${dragging ? 'border-red-400 bg-red-500/10' : 'border-white/12 bg-white/[0.022]'}`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-4 text-left">
            <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${dragging ? 'bg-red-500 text-white' : 'bg-white/[0.05] text-white/50'}`}><UploadCloud size={25} /></div>
            <div><p className="font-black">Drop your greasy masterpieces here</p><p className="mt-1 text-sm text-white/35">or click to browse · multiple photos supported · automatically compressed</p></div>
          </button>
          <label className="flex items-center gap-3 text-sm font-semibold text-white/55">
            Upload into
            <span className="relative">
              <select value={uploadCategory} onChange={(event) => setUploadCategory(event.target.value as Category)} className="h-11 appearance-none rounded-xl border border-white/10 bg-black/25 pl-4 pr-10 text-sm font-bold text-white outline-none focus:border-red-500/70">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            </span>
          </label>
        </div>
        {uploading && (
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs font-bold"><span className="text-white/50">Hopefully you wiped the camera first…</span><span className="text-red-400">{uploadProgress}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-white/6"><div className="h-full rounded-full bg-red-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} /></div>
          </div>
        )}
      </div>

      <section className={panelClass}>
        <div className="flex flex-col gap-4 border-b border-white/8 p-4 sm:p-5 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input className={`${inputClass} pl-11`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, caption or filename…" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={category} onChange={(event) => setCategory(event.target.value as 'All' | Category)} className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-bold text-white outline-none focus:border-red-500/70">
              <option value="All">All categories</option>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-bold text-white outline-none focus:border-red-500/70">
              <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option>
            </select>
            <button type="button" onClick={() => setFeaturedOnly((value) => !value)} className={`inline-flex h-12 items-center gap-2 rounded-2xl border px-4 text-sm font-bold transition ${featuredOnly ? 'border-amber-400/40 bg-amber-400/12 text-amber-300' : 'border-white/10 bg-black/25 text-white/55 hover:text-white'}`}><Star size={17} fill={featuredOnly ? 'currentColor' : 'none'} /> Featured</button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {loading ? (
            <div className="grid min-h-72 place-items-center"><div className="text-center"><LoaderCircle className="mx-auto animate-spin text-red-500" size={32} /><p className="mt-3 text-sm font-semibold text-white/35">Opening the greasy vault…</p></div></div>
          ) : filteredPhotos.length === 0 ? (
            <div className="grid min-h-[420px] place-items-center rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 text-center">
              <div><div className="mx-auto grid h-20 w-20 place-items-center rounded-[26px] bg-white/[0.04] text-white/25"><ImageIcon size={34} /></div><h2 className="mt-5 text-xl font-black">{photos.length ? 'Nothing greasy matches that search.' : 'No greasy masterpieces yet.'}</h2><p className="mt-2 text-sm text-white/35">{photos.length ? 'Clear the filters and try again.' : 'Go fix a car first. 😎'}</p>{!photos.length && <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-black hover:bg-red-500"><UploadCloud size={18} /> Upload the first one</button>}</div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filteredPhotos.map((photo) => (
                <article key={photo.id} className="group overflow-hidden rounded-[24px] border border-white/8 bg-[#0b0d10] transition hover:-translate-y-1 hover:border-white/16 hover:shadow-[0_24px_70px_rgba(0,0,0,.4)]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-black">
                    {/* IndexedDB object URLs are intentionally rendered with a native image element. */}
                    <img src={photo.url} alt={photo.altText || photo.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/15 opacity-70 transition group-hover:opacity-100" />
                    <div className="absolute left-3 top-3 flex gap-2">
                      <span className="rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] backdrop-blur-md">{photo.category}</span>
                      {photo.featured && <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-400 text-black shadow-lg"><Star size={14} fill="currentColor" /></span>}
                    </div>
                    <div className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                      <button type="button" onClick={() => setSelected(photo)} title="View" className="grid h-10 w-10 place-items-center rounded-xl bg-white text-black shadow-lg transition hover:scale-105"><Eye size={17} /></button>
                      <button type="button" onClick={() => beginEdit(photo)} title="Edit" className="grid h-10 w-10 place-items-center rounded-xl bg-black/70 text-white backdrop-blur transition hover:bg-red-600"><Edit3 size={17} /></button>
                      <button type="button" onClick={() => void toggleFeatured(photo)} title="Feature" className={`grid h-10 w-10 place-items-center rounded-xl backdrop-blur transition ${photo.featured ? 'bg-amber-400 text-black' : 'bg-black/70 text-white hover:bg-amber-400 hover:text-black'}`}><Star size={17} fill={photo.featured ? 'currentColor' : 'none'} /></button>
                      <button type="button" onClick={() => setDeleting(photo)} title="Delete" className="grid h-10 w-10 place-items-center rounded-xl bg-black/70 text-white backdrop-blur transition hover:bg-red-600"><Trash2 size={17} /></button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-3"><div className="min-w-0 flex-1"><h3 className="truncate font-black">{photo.title}</h3><p className="mt-1 truncate text-xs text-white/35">{photo.caption || 'No caption — the photo says enough.'}</p></div><button type="button" onClick={() => beginEdit(photo)} className="rounded-lg p-1.5 text-white/30 hover:bg-white/5 hover:text-white"><MoreHorizontal size={18} /></button></div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/7 pt-3 text-[11px] font-semibold text-white/28"><span>{formatDate(photo.createdAt)}</span><span>{formatBytes(photo.fileSize)}</span></div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {selected && (
        <ModalShell wide onClose={() => setSelected(null)}>
          <div className="grid lg:grid-cols-[minmax(0,1.55fr)_380px]">
            <div className="relative grid min-h-[360px] place-items-center bg-black lg:min-h-[680px]"><img src={selected.url} alt={selected.altText || selected.title} className="max-h-[75vh] w-full object-contain" /><button type="button" onClick={() => setSelected(null)} className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-black/55 text-white backdrop-blur hover:bg-black"><X size={19} /></button></div>
            <div className="flex flex-col p-6 sm:p-7"><div className="flex items-start justify-between gap-4"><div><span className="text-[10px] font-black uppercase tracking-[0.18em] text-red-400">{selected.category}</span><h2 className="mt-2 text-2xl font-black tracking-tight">{selected.title}</h2></div>{selected.featured && <Star className="text-amber-400" fill="currentColor" size={23} />}</div><p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-white/50">{selected.caption || 'No caption — just pure workshop art.'}</p><dl className="mt-7 space-y-4 border-y border-white/8 py-5 text-sm"><div className="flex justify-between gap-4"><dt className="text-white/35">Uploaded</dt><dd className="font-bold">{formatDate(selected.createdAt)}</dd></div><div className="flex justify-between gap-4"><dt className="text-white/35">Original file</dt><dd className="max-w-[210px] truncate font-bold">{selected.fileName}</dd></div><div className="flex justify-between gap-4"><dt className="text-white/35">Optimised size</dt><dd className="font-bold">{formatBytes(selected.fileSize)}</dd></div></dl><div className="mt-auto grid grid-cols-2 gap-3 pt-7"><button type="button" onClick={() => { setSelected(null); beginEdit(selected); }} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-black hover:bg-white/[0.08]"><Edit3 size={17} /> Edit</button><button type="button" onClick={() => downloadPhoto(selected)} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 text-sm font-black hover:bg-red-500"><Download size={17} /> Download</button></div></div>
          </div>
        </ModalShell>
      )}

      {editing && editDraft && (
        <ModalShell onClose={() => { setEditing(null); setEditDraft(null); }}>
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-5"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-400">Photo details</p><h2 className="mt-1 text-xl font-black">Tune the masterpiece</h2></div><button type="button" onClick={() => { setEditing(null); setEditDraft(null); }} className="rounded-xl p-2 text-white/40 hover:bg-white/5 hover:text-white"><X size={20} /></button></div>
          <div className="space-y-5 p-6">
            <div className="overflow-hidden rounded-2xl bg-black"><img src={editing.url} alt="Edit preview" className="h-48 w-full object-cover" /></div>
            <label className="block"><span className="mb-2 block text-sm font-bold text-white/70">Title</span><input className={inputClass} value={editDraft.title} onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value })} /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-white/70">Caption</span><textarea className="min-h-24 w-full resize-y rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-red-500/70 focus:ring-4 focus:ring-red-500/10" value={editDraft.caption} onChange={(event) => setEditDraft({ ...editDraft, caption: event.target.value })} placeholder='e.g. “Customer said it only needed an oil change.”' /></label>
            <div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-bold text-white/70">Category</span><select className={inputClass} value={editDraft.category} onChange={(event) => setEditDraft({ ...editDraft, category: event.target.value as Category })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="block"><span className="mb-2 block text-sm font-bold text-white/70">Alt text</span><input className={inputClass} value={editDraft.altText} onChange={(event) => setEditDraft({ ...editDraft, altText: event.target.value })} /></label></div>
            <button type="button" onClick={() => setEditDraft({ ...editDraft, featured: !editDraft.featured })} className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${editDraft.featured ? 'border-amber-400/30 bg-amber-400/10' : 'border-white/10 bg-white/[0.025]'}`}><div><p className="text-sm font-black">Feature this photo</p><p className="mt-1 text-xs text-white/35">Ready for homepage integration when Supabase is connected.</p></div><div className={`grid h-8 w-8 place-items-center rounded-xl ${editDraft.featured ? 'bg-amber-400 text-black' : 'bg-white/5 text-white/25'}`}>{editDraft.featured ? <Check size={17} /> : <Star size={17} />}</div></button>
          </div>
          <div className="flex justify-end gap-3 border-t border-white/8 px-6 py-5"><button type="button" onClick={() => { setEditing(null); setEditDraft(null); }} className="h-11 rounded-xl px-4 text-sm font-bold text-white/45 hover:bg-white/5 hover:text-white">Cancel</button><button type="button" onClick={() => void saveEdit()} disabled={!editDraft.title.trim()} className="h-11 rounded-xl bg-red-600 px-5 text-sm font-black hover:bg-red-500 disabled:opacity-40">Save changes</button></div>
        </ModalShell>
      )}

      {deleting && (
        <ModalShell onClose={() => setDeleting(null)}>
          <div className="p-7 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-500/12 text-red-400"><Trash2 size={27} /></div><h2 className="mt-5 text-2xl font-black">Delete this greasy masterpiece?</h2><p className="mt-2 text-sm leading-6 text-white/40">“{deleting.title}” will be permanently removed.<br />No Ctrl+Z in the workshop.</p><div className="mt-7 grid grid-cols-2 gap-3"><button type="button" onClick={() => setDeleting(null)} className="h-12 rounded-2xl border border-white/10 bg-white/[0.035] text-sm font-black hover:bg-white/[0.07]">Keep it</button><button type="button" onClick={() => void confirmDelete()} className="h-12 rounded-2xl bg-red-600 text-sm font-black hover:bg-red-500">Delete it</button></div></div>
        </ModalShell>
      )}

      {toast && <div className="fixed bottom-5 right-5 z-[100] flex max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-[#181b20] px-5 py-4 text-sm font-black shadow-[0_24px_80px_rgba(0,0,0,.55)]"><div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400"><Check size={17} /></div>{toast}</div>}
    </div>
  );
}
