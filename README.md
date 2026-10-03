# Paws Relax Retreat – Booking App

Installable booking app for Paws Relax Retreat (in-home boarding for small dogs).
Clients book nightly or long stays, add pickup/drop-off, extend a stay, and send the booking on WhatsApp to 079 040 0809.

## Changing prices and payment details
Open `index.html`, find the `SETTINGS` block near the bottom, and edit:
- `rates` – nightly prices (small / medium)
- `festive.rates` – festive season prices (1 Dec – 10 Jan)
- `payLink` – your Yoco / PayFast / SnapScan link
- `bank` – your EFT bank details

After any change to `index.html`, also change `VERSION` in `sw.js` (e.g. `prr-v4`) so installed apps pick up the update.

## Hosting
Hosted free with GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.
