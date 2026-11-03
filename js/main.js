// Avvio: TV del banditore (?tv), telefono del giocatore (?s=CODICE) oppure pagina iniziale.
import { creaRete } from './rete.js';
import { esc, schermoAcceso } from './comuni.js';
import { sbloccaAudio, sbloccaVoce, setVoce, impostaVoce } from './suoni.js';

const q = new URLSearchParams(location.search);

// schermata d'avvio con la locandina: sparisce da sola o al tocco
function splash() {
  if (q.has('veloce') || sessionStorage.getItem('mif_splash')) return Promise.resolve();
  sessionStorage.setItem('mif_splash', '1');
  return new Promise((ok) => {
    const d = document.createElement('div');
    d.className = 'splash';
    d.innerHTML = '<img src="img/locandina.webp" alt="Mercante in Fiera"><div class="tocca">tocca per entrare</div>';
    document.body.appendChild(d);
    let chiusa = false;
    const chiudi = () => { if (chiusa) return; chiusa = true; d.classList.add('via'); setTimeout(() => d.remove(), 600); ok(); };
    d.onclick = chiudi;
    setTimeout(chiudi, 3200);
  });
}
const radice = document.getElementById('app');

function errore(e) {
  console.error(e);
  radice.innerHTML = `<div class="tel benvenuto"><h1>Mercante in Fiera</h1><div class="box"><h2>Ops, niente collegamento</h2>
    <p>Non riesco a collegarmi al server della fiera. Controlla la connessione e riprova.</p><p class="piccolo">${esc(e?.message || e)}</p>
    <a class="bottone" href="${esc(location.href)}">Riprova</a></div></div>`;
}

async function tv() {
  document.body.classList.add('modo-tv');
  const [{ VistaTV }, { Banditore }] = await Promise.all([import('./tv.js'), import('./banditore.js')]);
  const rete = creaRete();
  await rete.init();
  const salvata = localStorage.getItem('mif_tv');
  let stato = null;
  if (salvata) {
    try { stato = JSON.parse(await rete.get(`mercante/rooms/${salvata}/stato`) || 'null'); } catch (e) { stato = null; }
  }
  const riprendibile = stato && stato.fase !== 'attesa' && stato.fase !== 'fine' && Object.keys(stato.giocatori || {}).length;
  radice.innerHTML = `<div class="tel benvenuto tv-inizio"><img class="locandina" src="img/locandina.webp" alt="">
    <div class="tv-inizio-destra"><h1>Mercante in Fiera</h1><div class="sotto">la grande fiera di Natale</div>
    <div class="box"><h2>Il banco del banditore</h2>
    <p>Collega questo schermo alla TV, alza il volume e apri il banco.</p>
    <button class="bottone grande" id="nuova">Apri una nuova fiera</button>
    ${riprendibile ? `<button class="bottone" id="riprendi">Riprendi la fiera ${esc(salvata)}</button>` : ''}
    </div></div></div>`;
  await new Promise((ok) => {
    const via = (riprendi) => async () => {
      sbloccaAudio(); sbloccaVoce(); schermoAcceso();
      const d = document.documentElement;
      try { await (d.requestFullscreen || d.webkitRequestFullscreen)?.call(d); } catch (e) { /* ok */ }
      const vista = new VistaTV(radice);
      const b = new Banditore(rete, vista);
      vista.b = b;
      window.banditore = b;
      if (!(riprendi && await b.riprendi(salvata))) {
        await b.nuovaStanza();
        const nb = Number(q.get('bot') || 0);
        if (nb) b.aggiungiBot(nb);
      }
      setVoce(b.S.cfg.voce !== false);
      impostaVoce({ nome: b.S.cfg.voceNome || '', vel: b.S.cfg.voceVel || 1, tono: b.S.cfg.voceTono || 1 });
      ok();
    };
    radice.querySelector('#nuova').onclick = via(false);
    const r = radice.querySelector('#riprendi');
    if (r) r.onclick = via(true);
  });
}

async function telefono(codice) {
  document.body.classList.add('modo-tel');
  const { Telefono } = await import('./giocatore.js');
  const rete = creaRete();
  await rete.init();
  const t = new Telefono(rete, radice, codice.toUpperCase());
  window.telefono = t;
  await t.avvia();
}

function inizio() {
  document.body.classList.add('modo-tel');
  const ultima = localStorage.getItem('mif_ultima');
  radice.innerHTML = `<div class="tel benvenuto"><h1>Mercante in Fiera</h1><div class="sotto">la grande fiera di Natale</div>
    <div class="box"><h2>Entra nella fiera</h2>
      <input id="codice" maxlength="4" placeholder="CODICE" autocapitalize="characters" autocomplete="off">
      <button class="bottone grande" id="entra">Entra</button>
      ${ultima ? `<a class="piccolo link" href="?s=${esc(ultima)}">torna alla fiera ${esc(ultima)}</a>` : ''}
    </div>
    <div class="box"><h2>Sei il banditore?</h2><p>Apri il banco su iPad o computer collegato alla TV.</p>
      <a class="bottone" href="?tv">Apri il banco della TV</a></div>
    </div>`;
  const i = radice.querySelector('#codice');
  const vai = () => {
    const c = i.value.trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (c.length === 4) location.search = '?s=' + c + (q.get('rete') ? '&rete=' + q.get('rete') : '');
    else i.focus();
  };
  radice.querySelector('#entra').onclick = vai;
  i.onkeydown = (e) => { if (e.key === 'Enter') vai(); };
}

(async () => {
  try {
    await splash();
    if (q.has('tv')) await tv();
    else if (q.get('s')) await telefono(q.get('s'));
    else inizio();
  } catch (e) { errore(e); }
})();
