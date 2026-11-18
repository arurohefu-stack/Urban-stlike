const CACHE='urban-strike-v5';
const THREE='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const FILES=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(async c=>{
    await c.addAll(FILES);
    try{await c.add(THREE)}catch(err){}
  }).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  const mine=u.origin===location.origin||u.href===THREE;
  if(!mine)return;
  // ページ本体は最新を優先（オフライン時はキャッシュ）、それ以外はキャッシュ優先
  if(e.request.mode==='navigate'||u.pathname.endsWith('index.html')){
    e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{const cp=n.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return n})));
});
