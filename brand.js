/* ===== BRAND – the only file ISS changes for each boarder (plus icons/ and manifest.webmanifest) =====
   Prices, hours, rules, bank details, payment link and capacity are NOT here:
   the boarder changes those on their admin page (Business settings). */
window.BRAND = {
  name: "Paws Relax Retreat",                  // full business name
  shortName: "Paws Relax",                     // under the app icon on phones
  tagline: "In-home comfort boarding for small dogs · Safe · Secure · Loving care",
  description: "Book in-home boarding for small dogs at Paws Relax Retreat. Nightly and long stays, pickup and drop-off, pay by EFT.",
  footer: "Owner provides food · Rates are per night · Pickup & drop-off service available",

  logo: { src: "icons/logo.webp", width: 900, height: 468 },   // wide logo at the top of the app
  refPrefix: "PAWS",                           // booking references start with this (letters only); also set ref_prefix in the database
  ledgerName: "Paws_Ledger",                   // sheet / file name for the ledger download

  whatsapp: "27790400809",                     // fallback until the app has loaded the boarder's settings
  phoneDisplay: "079 040 0809",

  colors: {                                    // light and dark mode
    light: { bg: "#FBF5EA", ink: "#2B1A0E", muted: "#7A5E46", line: "#EADBC4", brand: "#5A3216", brandInk: "#FFF8EC", accent: "#C8962E", accentSoft: "#F8EBCF", field: "#FFFBF4", surface: "#FFFFFF" },
    dark:  { bg: "#1B130D", ink: "#F3E6D3", muted: "#C2A98C", line: "#3C2C1F", brand: "#D9A65A", brandInk: "#1B130D", accent: "#E2B65E", accentSoft: "#3A2B17", field: "#2C1F15", surface: "#251A12" }
  },

  // The boarder's back office – fill in ONE of these (blank = WhatsApp-only mode):
  //  google:   the standard plan – the web app URL of the boarder's own Google Sheet back office (https://script.google.com/macros/s/…/exec)
  //  supabase: the upgrade (and Paws Relax Retreat itself)
  google: { url: "" },
  supabase: { url: "https://zyxwadchlypfkwkqprdm.supabase.co", key: "sb_publishable_mwmgwUsAB7cPI4F1T0AyjA_qOsVfe2A" },

  // Shown until the boarder's own settings have loaded (and when offline)
  bank: { bank: "Capitec Business", name: "Infinity Sparkle Studios", acc: "1052259146", branch: "470010", type: "Business" }
};

/* Apply the colours straight away so the page never flashes the wrong brand */
(function () {
  const c = window.BRAND.colors, v = o => `--bg:${o.bg};--surface:${o.surface};--ink:${o.ink};--muted:${o.muted};--line:${o.line};--brand:${o.brand};--brand-ink:${o.brandInk};--honey:${o.accent};--honey-soft:${o.accentSoft};--field:${o.field};`;
  const s = document.createElement("style");
  s.textContent = `:root{${v(c.light)}}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){color-scheme:dark;${v(c.dark)}}}:root[data-theme="dark"]{color-scheme:dark;${v(c.dark)}}`;
  document.head.appendChild(s);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = c.light.brand;
})();
