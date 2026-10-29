# Paws Relax Retreat – Going Live

The booking app saves everything in your **Infinity CRM** Supabase project, in its own Paws tables
(paws_settings, paws_bookings, paws_payments, paws_ledger). The database side is already set up.

- A booking is a **promise**: it lands in Bookings.
- A client's "I've paid" is a **claim**: it lands in Payments, with their proof of payment.
- Only when you confirm the money is in Capitec does it become a **fact**: a row in the Paws ledger.

## 1. Put the files on GitHub (once)

Upload everything in this folder to your `paws-relax-retreat` repository, replacing the old files.
Then open **Settings → Pages**, choose branch `main` and `/ (root)`, and click **Save**.

- Client app: `https://YOUR-USERNAME.github.io/paws-relax-retreat/`
- Your admin page: `https://YOUR-USERNAME.github.io/paws-relax-retreat/admin.html`

## 2. Sign in to the admin page

Open `admin.html` and sign in with your **Infinity CRM** email and password. Only the CRM owner or
a supervisor can open it. The page remembers its own address, so alert messages can link straight to it.

## 3. Check your business settings

On **Business settings**, fill in or change:

- prices (nightly, festive, day care) and the family discount
- hours
- house rules (one per line)
- bank details
- the WhatsApp number clients message

Click **Save settings**. The app picks up the changes the next time it opens.
If something doesn't look right (for example a letter in a price), it's not saved and the page tells you which field.

## 4. Everyday use

| What happens | Where |
|---|---|
| New booking | Alert + **Bookings** tab |
| Client says they paid | Alert + **Payments to check** (with their proof) |
| Money is in Capitec | Click **Money received – confirm**, then **Send receipt on WhatsApp** |
| Money never arrived | Click **Not received**. The booking stays a promise |
| Month-end | **Ledger → Download Excel (.xlsx)** (opens in Excel and LibreOffice) or **Download CSV**, then paste the rows into the Paws ledger. Downloaded rows are marked as exported |

## Alerts

Paws uses the CRM's alert system (WhatsApp, Telegram, email), with three new events:
*Paws: new booking*, *Paws: client says they have paid* and *Paws: payment confirmed*.
Alerts start arriving once the CRM's alert channels are activated (the CallMeBot / Telegram / Resend keys in Supabase Vault).
Until then, check the admin page.
