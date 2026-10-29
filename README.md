# Paws Relax Retreat – Booking App

Installable booking app for Paws Relax Retreat (in-home boarding for small dogs).
Clients book nightly stays, long stays or day care (full or half day), add pickup/drop-off, extend a stay, and send the booking on WhatsApp to 079 040 0809.

## Prices, hours, rules and bank details
Change them on the admin page (admin.html → Business settings). No code changes needed.
After any change to index.html, also change VERSION in sw.js so installed apps update.

## Hosting
Hosted free with GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.

## Back office
Supabase (Infinity CRM project, paws_* tables). See SETUP.md. The database migrations are in supabase/.
