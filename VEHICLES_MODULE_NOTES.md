# J1 Workshop OS — Polished Vehicles Module

## Added
- Professional vehicle dashboard with summary cards, search, filters, sorting and grid/list views.
- Vehicle profile with owner details, specifications, active job, service history, recommendations and internal notes.
- Working navigation to customer profiles, job cards, quotes and bookings.
- Responsive dark UI matching the existing J1 Workshop OS admin shell.

## Routes
- `/admin/vehicles`
- `/admin/vehicles/[id]`

## Demo records
Vehicle data is currently stored in `src/components/vehicleData.ts` and is structured for later replacement with Supabase queries.

## Packaging checks
- No `public/src` directory.
- No duplicated source tree.
- No `.next` output.
- No `node_modules`.
