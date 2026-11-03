// Pezzi in comune tra TV e telefono: carte, coriandoli, schermo sempre acceso, QR code.
import { CARTA, img } from './dati.js';

export function el(tag, cls = '', html = '') {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}
export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Una carta: faccia (id) o dorso ('nero' / 'rosso'); mini = immagine piccola.
// gira = mostra le figure orizzontali coricate (sulla TV, quando la carta è grande)
export function carta(id, { mini = false, dorso = null, gira = false, cls = '' } = {}) {
  const c = el('div', 'carta ' + cls);
  const src = dorso ? img('dorso_' + dorso, mini) : img(id, mini);
  if (gira && !dorso && CARTA[id]?.orizz) c.classList.add('orizz');
  c.innerHTML = `<img src="${src}" alt="" draggable="false">`;
  if (id) c.dataset.id = id;
  return c;
}
// Carta che si gira: dorso davanti, faccia dietro
export function cartaGirevole(id, dorso, opz = {}) {
  const c = el('div', 'carta girevole ' + (opz.cls || ''));
  if (opz.gira && CARTA[id]?.orizz) c.classList.add('orizz');
  c.innerHTML = `<div class="lato dorso"><img src="${img('dorso_' + dorso, opz.mini)}" alt="" draggable="false"></div>`
    + `<div class="lato faccia"><img src="${img(id, opz.mini)}" alt="" draggable="false"></div>`;
  c.dataset.id = id;
  return c;
}

// Sacco a sorpresa per l'asta al buio (disegnato, niente simboli speciali)
export function sacco(cls = '') {
  const d = el('div', 'sacco ' + cls);
  d.innerHTML = `<svg viewBox="0 0 200 220" aria-hidden="true">
    <defs><radialGradient id="sg" cx="40%" cy="40%" r="70%"><stop offset="0" stop-color="#c8955a"/><stop offset="1" stop-color="#7a4a22"/></radialGradient></defs>
    <path d="M70 40 Q100 55 130 40 L120 70 Q190 95 180 165 Q170 215 100 215 Q30 215 20 165 Q10 95 80 70 Z" fill="url(#sg)" stroke="#4a2a10" stroke-width="5"/>
    <path d="M78 68 Q100 80 122 68" fill="none" stroke="#c0392b" stroke-width="9" stroke-linecap="round"/>
    <path d="M64 36 Q100 10 136 36" fill="#a8743f" stroke="#4a2a10" stroke-width="5"/>
    <text x="100" y="175" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="104" fill="#ffe08a" stroke="#4a2a10" stroke-width="3">?</text>
  </svg>`;
  return d;
}

// ------------------------------------------------------------------ coriandoli
export function coriandoli(durata = 4000, quanti = 160) {
  const cv = el('canvas', 'coriandoli');
  document.body.appendChild(cv);
  const W = (cv.width = innerWidth * devicePixelRatio), H = (cv.height = innerHeight * devicePixelRatio);
  const g = cv.getContext('2d');
  const col = ['#e63946', '#ffd166', '#06d6a0', '#118ab2', '#f15bb5', '#ffffff', '#ffb703'];
  const p = Array.from({ length: quanti }, () => ({
    x: Math.random() * W, y: -Math.random() * H * 0.6, vx: (Math.random() - 0.5) * 6, vy: 3 + Math.random() * 6,
    r: (4 + Math.random() * 7) * devicePixelRatio, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3, c: col[Math.floor(Math.random() * col.length)],
  }));
  const t0 = performance.now();
  (function passo(t) {
    g.clearRect(0, 0, W, H);
    for (const q of p) {
      q.x += q.vx; q.y += q.vy * devicePixelRatio; q.a += q.va; q.vx *= 0.99;
      g.save(); g.translate(q.x, q.y); g.rotate(q.a); g.fillStyle = q.c; g.fillRect(-q.r, -q.r / 2, q.r * 2, q.r); g.restore();
    }
    if (t - t0 < durata) requestAnimationFrame(passo);
    else cv.remove();
  })(t0);
}

// ------------------------------------------------------------------ schermo acceso
let blocco = null;
export async function schermoAcceso() {
  try {
    if ('wakeLock' in navigator) {
      blocco = await navigator.wakeLock.request('screen');
      document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible') { try { blocco = await navigator.wakeLock.request('screen'); } catch (e) { /* ok */ } }
      });
    }
  } catch (e) { /* non supportato */ }
}

// ------------------------------------------------------------------ QR code
export function qrSvg(testo, colore = '#2b1300') {
  /* global qrcode */
  const q = qrcode(0, 'M');
  q.addData(testo);
  q.make();
  const n = q.getModuleCount();
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) d += `M${x + 2} ${y + 2}h1v1h-1z`;
  return `<svg viewBox="0 0 ${n + 4} ${n + 4}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="${colore}"/></svg>`;
}

export function toast(testo, cls = '') {
  let box = document.getElementById('toasts');
  if (!box) { box = el('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const t = el('div', 'toast ' + cls);
  t.textContent = testo;
  box.appendChild(t);
  setTimeout(() => t.classList.add('via'), 3200);
  setTimeout(() => t.remove(), 3800);
}

// Movimento di un elemento da A a B (rettangoli dello schermo) con Web Animations
export function vola(nodo, da, a, { durata = 900, ruota = 0, scala = 1, easing = 'cubic-bezier(.5,0,.3,1)', fine = 1 } = {}) {
  nodo.style.position = 'fixed';
  nodo.style.left = da.left + 'px';
  nodo.style.top = da.top + 'px';
  nodo.style.width = da.width + 'px';
  nodo.style.height = da.height + 'px';
  nodo.style.zIndex = 900;
  nodo.style.margin = 0;
  document.body.appendChild(nodo);
  const dx = a.left + a.width / 2 - (da.left + da.width / 2), dy = a.top + a.height / 2 - (da.top + da.height / 2);
  const an = nodo.animate([
    { transform: 'translate(0,0) rotate(0) scale(1)', opacity: 1 },
    { transform: `translate(${dx * 0.3}px,${dy * 0.3 - 80}px) rotate(${ruota / 2}deg) scale(${(1 + scala) / 2 + 0.15})`, opacity: 1, offset: 0.35 },
    { transform: `translate(${dx}px,${dy}px) rotate(${ruota}deg) scale(${scala})`, opacity: fine },
  ], { duration: durata, easing, fill: 'forwards' });
  return an.finished.then(() => nodo);
}
