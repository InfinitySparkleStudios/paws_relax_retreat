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

  // Subscription: last day online bookings work (YYYY-MM-DD). Blank = no end (Paws Relax Retreat).
  activeUntil: "",

  // Shown until the boarder's own settings have loaded (and when offline)
  bank: { bank: "Capitec Business", name: "Infinity Sparkle Studios", acc: "1052259146", branch: "470010", type: "Business" }
};

/* Colours. The boarder can change the main and accent colour themselves (Business settings);
   the light/dark versions and readable text colours are worked out here. */
window.applyBrandColors = function (brand, accent) {
  const c = JSON.parse(JSON.stringify(window.BRAND.colors));
  const hex = x => /^#[0-9a-f]{6}$/i.test(String(x || "")) ? String(x) : null;
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const toHex = a => "#" + a.map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
  const mix = (h, w, t) => toHex(rgb(h).map((x, i) => x + (rgb(w)[i] - x) * t));
  const lum = h => { const [r, g, b] = rgb(h).map(x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const ink = bgc => contrast(bgc, "#FFFFFF") >= contrast(bgc, "#1A1405") ? "#FFFFFF" : "#1A1405";
  if (hex(brand) && hex(brand).toLowerCase() !== String(c.light.brand).toLowerCase()) {
    // a new main colour: tint the page background, lines and text to match it
    const b0 = hex(brand);
    Object.assign(c.light, { bg: mix(b0, "#FFFFFF", .95), surface: "#FFFFFF", field: mix(b0, "#FFFFFF", .975), line: mix(b0, "#FFFFFF", .82), ink: mix(b0, "#000000", .82) });
    let mu = mix(b0, "#5A5A5A", .55); while (contrast(mu, c.light.bg) < 4.5) mu = mix(mu, "#000000", .1); c.light.muted = mu;
    Object.assign(c.dark, { bg: mix(b0, "#000000", .9), surface: mix(b0, "#000000", .84), field: mix(b0, "#000000", .8), line: mix(b0, "#000000", .66), ink: mix(b0, "#FFFFFF", .9) });
    let md = mix(b0, "#FFFFFF", .55); while (contrast(md, c.dark.bg) < 4.5) md = mix(md, "#FFFFFF", .1); c.dark.muted = md;
  }
  if (hex(brand)) {
    let b = hex(brand); while (contrast(b, c.light.bg) < 4.5 && lum(b) > .02) b = mix(b, "#000000", .12);   // stays readable on the page
    c.light.brand = b; c.light.brandInk = ink(b);
    let d = b; let n = 0; while (contrast(d, c.dark.bg) < 4.5 && n++ < 12) d = mix(d, "#FFFFFF", .15);       // lighter for dark mode
    c.dark.brand = d; c.dark.brandInk = ink(d);
  }
  if (hex(accent)) {
    const a = hex(accent);
    c.light.accent = a; c.light.accentSoft = mix(a, c.light.bg, .8);
    let d = a; let n = 0; while (contrast(d, c.dark.bg) < 4.5 && n++ < 12) d = mix(d, "#FFFFFF", .15);
    c.dark.accent = d; c.dark.accentSoft = mix(a, c.dark.bg, .75);
  }
  const v = o => `--bg:${o.bg};--surface:${o.surface};--ink:${o.ink};--muted:${o.muted};--line:${o.line};--brand:${o.brand};--brand-ink:${o.brandInk};--honey:${o.accent};--honey-soft:${o.accentSoft};--field:${o.field};`;
  let s = document.getElementById("brandColors");
  if (!s) { s = document.createElement("style"); s.id = "brandColors"; document.head.appendChild(s); }
  s.textContent = `:root{${v(c.light)}}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){color-scheme:dark;${v(c.dark)}}}:root[data-theme="dark"]{color-scheme:dark;${v(c.dark)}}`;
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = c.light.brand;
};
/* Apply straight away (with the boarder's last saved colours, if any) so the page never flashes the wrong brand */
(function () {
  let saved = null; try { saved = JSON.parse(localStorage.getItem("brand-look") || "null"); } catch (e) {}
  window.applyBrandColors(saved && saved.brand, saved && saved.accent);
})();
