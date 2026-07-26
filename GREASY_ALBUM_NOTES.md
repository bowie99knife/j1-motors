# Greasy Album

Route: `/admin/greasy-album`

## Included
- Main admin-sidebar integration
- Drag-and-drop and multi-photo upload
- Client-side image resizing/compression
- IndexedDB persistence (does not place uploads in `/public`)
- Search, categories, sorting and featured filter
- Premium photo grid with preview, edit, feature, download and delete controls
- Funny J1 Motors upload and empty-state messages
- Responsive mobile/desktop layout

## Storage architecture
Photos are currently stored in the browser using IndexedDB so the module works before Supabase is connected. The UI and metadata structure are ready to swap to Supabase Storage later.

## Packaging safety
There is no `public/src` folder. Source code exists only under root `/src`, and `/public` remains static assets only.
