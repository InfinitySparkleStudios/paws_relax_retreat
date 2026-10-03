// Paws Relax Retreat – offline support. Bump VERSION whenever you change index.html.
const VERSION = "prr-v3";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./icons/favicon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  // Pages: try the network first so updates show, fall back to the saved copy offline
  if (req.mode === "navigate") { e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put("./index.html", c)); return r; }).catch(() => caches.match("./index.html"))); return; }
  // Everything else (icons, fonts): saved copy first
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok && (req.url.startsWith(self.location.origin) || req.url.includes("fonts.g"))) { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); } return r; })));
});
