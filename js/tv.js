// Schermo della TV: il banditore, il palco con le carte, i giocatori, le animazioni.
import { CARTA, euro, img, conArticolo } from './dati.js';
import { el, esc, carta, cartaGirevole, sacco, coriandoli, qrSvg, vola, toast } from './comuni.js';
import { suona, setVoce, sbloccaAudio, sbloccaVoce, elencoVoci, impostaVoce, voceInUso, parla } from './suoni.js';

// pose che hanno anche un'animazione (video di Kling scontornato, in avatar/anim/)
const ANIMATE = ['martello', 'parla', 'occhiolino', 'saluta', 'festeggia', 'conta1', 'sussurra', 'triste', 'sorpreso', 'soldi',
  'carta', 'mercato', 'busta', 'pensa', 'indica', 'ride'];
// le pose senza animazione usano quella di una posa simile
const ANIM_SIMILE = { conta2: 'conta1', conta3: 'conta1', attesa: null, triste_b: 'triste', carta_b: 'carta', indica_b: 'indica' };

export class VistaTV {
  constructor(radice) {
    this.r = radice;
    this.b = null; // il banditore (impostato da main.js)
    this.animPronte = {}; // animazioni già scaricate
    this.chiavi = {};
    this.costruisci();
    this.cercaPose();
    addEventListener('resize', () => this.adatta());
    addEventListener('voci-cambiate', () => { this.chiavi.sala = ''; if (this.S) this.sala(this.S); });
    this.adatta();
  }

  // scarica in sottofondo le animazioni, una alla volta, così non rallentano l'avvio
  cercaPose() {
    const coda = [...ANIMATE];
    const prossima = () => {
      const p = coda.shift();
      if (!p) return;
      const i = new Image();
      i.onload = () => { this.animPronte[p] = true; setTimeout(prossima, 50); };
      i.onerror = () => setTimeout(prossima, 50);
      i.src = `avatar/anim/${p}.webp`;
    };
    setTimeout(prossima, 1500);
  }

  costruisci() {
    this.r.innerHTML = `
    <div class="tv">
      <div class="scena" id="scena">
        <div class="tenda"></div>
        <div class="luci">${Array.from({ length: 26 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
        <div class="neve" id="neve"></div>
        <header class="insegna"><h1>Mercante in Fiera</h1><div class="sotto">la grande fiera di Natale</div></header>
        <div class="comandi" id="comandi"></div>
        <div class="codice-mini" id="codiceMini"></div>
        <div class="banditore" id="banditore">
          <div class="fumetto" id="fumetto"><span></span></div>
          <div class="avatar-box"><div class="figura" id="figura"><img id="avatar" src="avatar/saluta.webp" onerror="this.onerror=null;this.src='avatar/base.webp'" alt="Il banditore"><img id="avatarAnim" class="anim" alt=""></div></div>
          <div class="bancone"><div class="targa">BANDITORE</div><div class="martelletto" id="martelletto"><i></i><b></b></div></div>
        </div>
        <main class="palco" id="palco"></main>
        <aside class="pannello" id="pannello"></aside>
        <div class="trattative" id="trattative"></div>
        <footer class="giocatori" id="giocatori"></footer>
        <div class="sala" id="sala"></div>
        <div class="risultati" id="risultati"></div>
        <div class="pausa-tv" id="pausaTv">IN PAUSA</div>
      </div>
    </div>`;
    this.$ = (id) => this.r.querySelector('#' + id);
    // fiocchi di neve disegnati (puntini sfumati, niente simboli)
    const neve = this.$('neve');
    for (let i = 0; i < 40; i++) {
      const f = el('i');
      f.style.left = Math.random() * 100 + '%';
      f.style.animationDelay = -Math.random() * 20 + 's';
      f.style.animationDuration = 12 + Math.random() * 14 + 's';
      f.style.setProperty('--d', 4 + Math.random() * 8 + 'px');
      neve.appendChild(f);
    }
  }

  adatta() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    const sc = this.$('scena');
    sc.style.transform = `translate(${(innerWidth - 1920 * s) / 2}px, ${(innerHeight - 1080 * s) / 2}px) scale(${s})`;
  }

  link(S) {
    const u = new URL(location.href);
    u.search = '';
    u.hash = '';
    u.searchParams.set('s', S.codice);
    const q = new URLSearchParams(location.search);
    if (q.get('rete')) u.searchParams.set('rete', q.get('rete'));
    return u.toString();
  }

  // ------------------------------------------------------------- disegno completo
  tutto(S) {
    this.chiavi = {};
    this.$('palco').innerHTML = '';
    this.aggiorna(S);
    this.banditore(S.banditore);
  }

  aggiorna(S) {
    if (!S) return;
    this.S = S;
    this.comandi(S);
    this.codiceMini(S);
    this.sala(S);
    this.palco(S);
    this.pannello(S);
    this.giocatori(S);
    this.trattative(S);
    this.risultati(S);
    this.$('pausaTv').classList.toggle('vis', !!S.pausa);
    if (S.pausa && !this._inPausa) { this._inPausa = true; clearTimeout(this._attesa); this.posa('pausa'); }
    else if (!S.pausa && this._inPausa) { this._inPausa = false; this.attesa(); }
  }

  comandi(S) {
    const k = [S.fase, S.pausa, S.cfg.voce, !!document.fullscreenElement].join();
    if (this.chiavi.comandi === k) return;
    this.chiavi.comandi = k;
    const c = this.$('comandi');
    const btn = (t, f, cls = '') => { const b = el('button', 'cmd ' + cls, t); b.onclick = (e) => { e.stopPropagation(); sbloccaAudio(); f(); }; c.appendChild(b); };
    c.innerHTML = '';
    if (S.fase !== 'attesa' && S.fase !== 'fine') {
      btn(S.pausa ? 'Riprendi' : 'Pausa', () => this.b.pausa());
      btn('Avanti', () => this.b.saltaAvanti());
    }
    btn(S.cfg.voce ? 'Voce: sì' : 'Voce: no', () => { const v = !this.b.S.cfg.voce; this.b.cfg('voce', v); setVoce(v); });
    btn('Schermo intero', () => {
      const d = document.documentElement;
      if (document.fullscreenElement) document.exitFullscreen?.();
      else (d.requestFullscreen || d.webkitRequestFullscreen)?.call(d);
    });
  }

  codiceMini(S) {
    const k = S.codice + S.fase;
    if (this.chiavi.cm === k) return;
    this.chiavi.cm = k;
    const c = this.$('codiceMini');
    c.style.display = S.fase === 'attesa' ? 'none' : '';
    c.innerHTML = `<div class="qr">${qrSvg(this.link(S))}</div><div><small>per entrare</small><b>${S.codice}</b></div>`;
  }

  // ------------------------------------------------------------- sala d'attesa
  sala(S) {
    const box = this.$('sala');
    box.classList.toggle('vis', S.fase === 'attesa');
    if (S.fase !== 'attesa') return;
    const gs = Object.entries(S.giocatori).sort((a, b) => a[1].ord - b[1].ord);
    const voci = elencoVoci();
    const k = JSON.stringify([S.cfg, gs.map(([u, g]) => g.nome + g.colore), voci.map((v) => v.name), voceInUso()]);
    if (this.chiavi.sala === k) return;
    this.chiavi.sala = k;
    const c = S.cfg;
    const passo = (v, d, min, max) => Math.min(max, Math.max(min, Math.round((v + d) * 100) / 100));
    box.innerHTML = `
      <div class="sala-qr">
        <h2>Inquadra e gioca!</h2>
        <div class="qr-grande">${qrSvg(this.link(S))}</div>
        <div class="codice-grande">codice <b>${S.codice}</b></div>
        <div class="url">${esc(this.link(S).replace(/^https?:\/\//, ''))}</div>
      </div>
      <div class="sala-gioc">
        <h2>Al banco (${gs.length})</h2>
        <div class="elenco">${gs.map(([u, g]) => `<div class="g" style="--c:${g.colore}"><span class="pallino"></span>${esc(g.nome)}<button class="togli" data-u="${u}">togli</button></div>`).join('') || '<p class="vuoto">Aspetto i primi clienti...</p>'}</div>
      </div>
      <div class="sala-cfg">
        <h2>Regole della casa</h2>
        ${this.riga('Posta a testa', euro(c.posta), 'posta', 50, 50, 2000)}
        ${this.riga("Base d'asta", euro(c.base), 'base', 10, 10, 500)}
        ${this.riga('Rilancio minimo', euro(c.passo), 'passo', 10, 10, 200)}
        ${this.riga('Carte in regalo', String(c.regalo), 'regalo', 1, 0, 3)}
        ${this.riga('Carte vincenti', c.vincenti ? String(c.vincenti) : 'automatico', 'vincenti', 1, 0, 6)}
        ${this.riga('Carte in gioco', (c.nCarte || 40) >= 40 ? 'tutte (40)' : String(c.nCarte), 'nCarte', 2, 6, 40)}
        ${this.riga('Ritmo', ['', 'calmo', 'normale', 'svelto'][c.velocita === 0.75 ? 1 : c.velocita === 1.35 ? 3 : 2], 'velocita', 0, 0, 0)}
        <div class="riga voce-riga"><span>Voce</span>${voci.length
          ? `<select id="sceltaVoce">${voci.map((v) => `<option value="${esc(v.name)}" ${v.name === voceInUso() ? 'selected' : ''}>${esc(v.name.replace(/\s*\((italiano|italian|italia|italy)\b.*$/i, ''))}</option>`).join('')}</select>`
          : '<em>nessuna voce italiana</em>'}<button id="provaVoce">prova</button></div>
        ${this.riga('Velocità voce', Math.round((c.voceVel || 1) * 100) + '%', 'voceVel', 0.05, 0.7, 1.4)}
        ${this.riga('Tono voce', Math.round((c.voceTono || 1) * 100) + '%', 'voceTono', 0.05, 0.6, 1.5)}
        <button class="apri" id="apri" ${gs.length ? '' : 'disabled'}>Apri la fiera!</button>
      </div>`;
    box.querySelectorAll('.togli').forEach((b) => { b.onclick = () => this.b.togliGiocatore(b.dataset.u); });
    box.querySelectorAll('[data-k]').forEach((b) => {
      b.onclick = () => {
        sbloccaAudio();
        const key = b.dataset.k, d = Number(b.dataset.d);
        if (key === 'velocita') {
          const l = [0.75, 1, 1.35], i = l.indexOf(c.velocita);
          this.b.cfg('velocita', l[(i + (d > 0 ? 1 : 2)) % 3]);
        } else if (key === 'vincenti') {
          let v = c.vincenti + d;
          if (v === 1 || v === 2) v = d > 0 ? 3 : 0;
          this.b.cfg('vincenti', Math.max(0, Math.min(6, v)));
        } else if (key === 'voceVel' || key === 'voceTono') {
          this.b.cfg(key, passo(c[key] || 1, d, Number(b.dataset.min), Number(b.dataset.max)));
          impostaVoce({ vel: this.b.S.cfg.voceVel || 1, tono: this.b.S.cfg.voceTono || 1 });
          this.provaVoce();
        } else if (key === 'nCarte') {
          this.b.cfg('nCarte', passo(c.nCarte || 40, d, 6, 40));
        } else this.b.cfg(key, passo(c[key], d, Number(b.dataset.min), Number(b.dataset.max)));
      };
    });
    this.$('apri').onclick = () => { sbloccaAudio(); sbloccaVoce(); this.b.inizia(); };
    const sel = box.querySelector('#sceltaVoce');
    if (sel) sel.onchange = () => { this.b.cfg('voceNome', sel.value); impostaVoce({ nome: sel.value }); this.provaVoce(); };
    box.querySelector('#provaVoce').onclick = () => this.provaVoce();
  }
  provaVoce() {
    sbloccaAudio();
    parla('Signore e signori, benvenuti alla grande fiera di Natale! Chi offre due euro e cinquanta?', { interrompi: true });
  }
  riga(t, v, k, d, min, max) {
    return `<div class="riga"><span>${t}</span><button data-k="${k}" data-d="${-d || -1}" data-min="${min}" data-max="${max}">meno</button><b>${v}</b><button data-k="${k}" data-d="${d || 1}" data-min="${min}" data-max="${max}">più</button></div>`;
  }

  // ------------------------------------------------------------- banditore
  banditore(b, fine) {
    if (!b) return;
    const f = this.$('fumetto');
    if (this.ultimoB === b.n) return;
    this.ultimoB = b.n;
    f.querySelector('span').textContent = b.testo;
    f.classList.remove('pop');
    void f.offsetWidth;
    f.classList.toggle('vis', !!b.testo);
    f.classList.add('pop');
    this.posa(b.posa, true);
    // finito di parlare, dopo qualche secondo il banditore si mette in attesa
    clearTimeout(this._attesa);
    const n = b.n;
    Promise.resolve(fine).then(() => {
      if (this.ultimoB === n) this._attesa = setTimeout(() => this.attesa(), 3500);
    });
  }

  // mostra una posa: l'animazione se c'è (e si è già scaricata), altrimenti l'immagine ferma
  posa(nome, salta = false) {
    clearInterval(this._ciglia);
    const box = this.$('figura').parentElement, a = this.$('avatar'), an = this.$('avatarAnim');
    const animNome = ANIMATE.includes(nome) ? nome : ANIM_SIMILE[nome];
    a.onerror = () => { a.onerror = null; a.src = 'avatar/base.webp'; };
    a.src = `avatar/${nome}.webp`;
    if (animNome && this.animPronte[animNome]) {
      if (an.dataset.n !== animNome) { an.src = `avatar/anim/${animNome}.webp`; an.dataset.n = animNome; }
      box.classList.add('animato');
    } else {
      box.classList.remove('animato');
      an.removeAttribute('src');
      an.dataset.n = '';
    }
    box.className = box.className.replace(/\bposa-\S+/g, '').trim() + ' posa-' + nome;
    if (salta) { box.classList.remove('parla'); void box.offsetWidth; box.classList.add('parla'); }
  }

  // il banditore aspetta: braccia conserte, ogni tanto sbatte le ciglia o inclina la testa
  attesa() {
    if (this.S?.pausa) return;
    this.posa('attesa');
    let t = 0;
    clearInterval(this._ciglia);
    this._ciglia = setInterval(() => {
      t++;
      const a = this.$('avatar');
      if (t % 7 === 3) { a.src = 'avatar/attesa_occhi.webp'; setTimeout(() => { if (a.src.includes('attesa_occhi')) a.src = 'avatar/attesa.webp'; }, 160); }
      else if (t % 11 === 6) a.src = 'avatar/attesa_b.webp';
      else if (t % 11 === 9) a.src = 'avatar/attesa.webp';
    }, 700);
  }

  martello() {
    const m = this.$('martelletto');
    m.classList.remove('colpo');
    void m.offsetWidth;
    m.classList.add('colpo');
    this.$('scena').classList.remove('trema');
    void this.$('scena').offsetWidth;
    this.$('scena').classList.add('trema');
  }

  // ------------------------------------------------------------- palco
  palco(S) {
    const p = this.$('palco');
    if (S.fase === 'regali' || S.fase === 'asta') {
      const L = S.lotto;
      const k = L ? `lotto${L.id}` : 'mazzo' + S.fase;
      if (this.chiavi.palco === k) {
        if (L && L.stato === 'aggiudicato') this.timbro('VENDUTO', S.giocatori[L.migliore.uid]?.colore);
        if (L && L.stato === 'invenduto') this.timbro('INVENDUTO', '#7d6b5d');
        return;
      }
      this.chiavi.palco = k;
      if (!L) {
        p.innerHTML = `<div class="titolo-palco">${S.fase === 'regali' ? 'I regali della casa' : 'Si prepara il prossimo lotto...'}</div>
          <div class="mazzo-centro" id="mazzoCentro"></div>`;
        const m = p.querySelector('#mazzoCentro');
        for (let i = 0; i < 5; i++) { const c = carta(null, { dorso: 'nero', cls: 'grande' }); c.style.transform = `translate(${i * 3}px, ${-i * 3}px)`; m.appendChild(c); }
        return;
      }
      this.lotto(L, S, true);
      return;
    }
    if (['premi', 'svela', 'finale'].includes(S.fase)) {
      const k = 'svela' + (S.rosse ? 1 : 0);
      if (this.chiavi.palco !== k) {
        this.chiavi.palco = k;
        p.innerHTML = `<div class="titolo-palco" id="titoloSvela">Le carte scoperte</div>
          <div class="ultime" id="ultime"></div>
          <div class="storia" id="storia"></div>`;
        const st = p.querySelector('#storia');
        for (const id of (S.rosse?.svelate || []).slice(-16)) st.appendChild(this.miniStoria(id, S));
        this.chiavi.mercato = '';
      }
      this.mercatoBox(S);
      return;
    }
    if (this.chiavi.palco !== S.fase) { this.chiavi.palco = S.fase; p.innerHTML = ''; }
  }

  miniStoria(id, S) {
    const c = carta(id, { mini: true, cls: 'storia-c' });
    const u = S.nere[id];
    if (u && S.giocatori[u]) { c.style.setProperty('--c', S.giocatori[u].colore); c.classList.add('colpita'); }
    return c;
  }

  mercatoBox(S) {
    const p = this.$('palco');
    let m = p.querySelector('.banner-mercato');
    const k = JSON.stringify([S.mercato, S.indizio]);
    if (this.chiavi.mercato === k) return;
    this.chiavi.mercato = k;
    if (!S.mercato && !S.indizio) { m?.remove(); return; }
    if (!m) { m = el('div', 'banner-mercato'); p.appendChild(m); }
    m.innerHTML = (S.indizio ? `<div class="indizio">Prossima carta: <b>${esc(S.indizio)}</b></div>` : '')
      + (S.mercato ? `<div class="mercato-t">MERCATO APERTO <span class="sec">${S.mercato.resto}</span></div><div class="mercato-s">vendete e comprate dal telefono!</div>
        <div class="mercato-fine"><button class="chiudi-mercato" id="chiudiMercato">Chiudi il mercato</button>
        ${this.passano(S)}</div>` : '');
    const bc = m.querySelector('#chiudiMercato');
    if (bc) bc.onclick = (e) => { e.stopPropagation(); sbloccaAudio(); bc.disabled = true; this.b.saltaAvanti(); };
  }

  passano(S) {
    const veri = Object.entries(S.giocatori).filter(([, g]) => !g.bot);
    const n = veri.filter(([u]) => S.mercato?.passo?.includes(u)).length;
    return n ? `<span class="passano">non trattano: ${n} su ${veri.length}</span>` : '';
  }

  lotto(L, S, ridisegna = false) {
    if (!ridisegna) { this.palco(S); return; }
    const p = this.$('palco');
    const tipi = { scoperta: L.k > 1 ? `${L.k} carte scoperte` : 'carta scoperta', coperta: L.k > 1 ? `${L.k} carte coperte` : '1 carta coperta', buio: 'asta al buio' };
    p.innerHTML = `<div class="titolo-palco">Lotto n. ${L.id} <span class="tipo tipo-${L.tipo}">${tipi[L.tipo]}</span></div><div class="lotto lotto-${L.tipo} n${L.k}" id="lottoCarte"></div>
      <div class="timbro" id="timbro"></div>`;
    const box = p.querySelector('#lottoCarte');
    if (L.tipo === 'buio' && !L.rivelate) {
      box.appendChild(sacco('grande entra'));
    } else {
      L.carte.forEach((id, i) => {
        const c = L.rivelate && L.tipo === 'scoperta' ? carta(id, { gira: L.k === 1, cls: 'grande entra' }) : cartaGirevole(id, 'nero', { cls: 'grande entra' + (L.rivelate ? ' girata' : ''), gira: L.k === 1 });
        c.style.animationDelay = i * 0.12 + 's';
        box.appendChild(c);
      });
    }
    if (L.stato === 'aggiudicato') this.timbro('VENDUTO', S.giocatori[L.migliore.uid]?.colore);
    if (L.stato === 'invenduto') this.timbro('INVENDUTO', '#7d6b5d');
  }

  timbro(t, col) {
    const tb = this.$('timbro');
    if (!tb || (tb.textContent === t && tb.classList.contains('vis'))) return;
    tb.textContent = t;
    tb.style.setProperty('--c', col || '#c0392b');
    tb.className = 'timbro vis';
  }

  rivela(L, S) {
    const box = this.$('lottoCarte');
    if (!box) return;
    if (L.tipo === 'buio') {
      const s = box.querySelector('.sacco');
      s?.classList.add('apre');
      setTimeout(() => {
        box.innerHTML = '';
        box.className = `lotto lotto-buio n${L.k}`;
        L.carte.forEach((id, i) => {
          const c = carta(id, { gira: L.k === 1, cls: 'grande esce' });
          c.style.animationDelay = i * 0.15 + 's';
          box.appendChild(c);
        });
        suona('gira');
      }, 500);
    } else {
      box.querySelectorAll('.girevole').forEach((c, i) => setTimeout(() => { c.classList.add('girata'); suona('gira'); }, i * 250));
    }
  }

  invenduto() { this.timbro('INVENDUTO', '#7d6b5d'); }

  offerta(L, S) {
    const o = this.$('pannello').querySelector('.offerta-cifra');
    if (o) { o.classList.remove('salta'); void o.offsetWidth; o.classList.add('salta'); }
    const chip = this.chip(L.migliore.uid);
    if (chip) { chip.classList.remove('offre'); void chip.offsetWidth; chip.classList.add('offre'); }
  }

  // ------------------------------------------------------------- pannello a destra
  pannello(S) {
    const p = this.$('pannello');
    let h = '';
    if (S.fase === 'asta' || S.fase === 'regali') {
      const L = S.lotto;
      const m = L?.migliore;
      const g = m ? S.giocatori[m.uid] : null;
      h = `<div class="etichetta">offerta</div>
        <div class="offerta-cifra">${m ? euro(m.v) : L ? euro(L.base) : '-'}</div>
        <div class="offerente" style="--c:${g?.colore || '#7d6b5d'}">${g ? esc(g.nome) : L ? "base d'asta" : ''}</div>
        <div class="conta">${['UNO', 'DUE', 'TRE'].map((t, i) => `<span class="${L && L.conta > i ? 'on' : ''}">${t}</span>`).join('')}</div>
        <div class="info"><div><small>carte nel mazzo</small><b>${S.mazzo.length}</b></div><div><small>salvadanaio</small><b>${euro(this.salvadanaio(S))}</b></div></div>`;
    } else if (S.rosse && ['premi', 'svela', 'finale', 'fine'].includes(S.fase)) {
      const R = S.rosse;
      const righe = R.vincenti.map((id, i) => ({ id, i, v: R.premi[i] })).reverse();
      h = `<div class="etichetta">montepremi</div><div class="monte">${euro(S.montepremi)}</div>
        <div class="premi">${righe.map((r) => {
          const fatto = R.premiate.includes(r.id);
          const vin = S.vincite.find((x) => x.carta === r.id);
          const g = vin ? S.giocatori[vin.uid] : null;
          return `<div class="premio ${fatto ? 'fatto' : ''} ${vin ? 'vinto' : ''}" data-i="${r.i}" style="--c:${g?.colore || '#fff'}">
            <div class="pc"><img src="${img(fatto ? r.id : 'dorso_rosso', true)}" alt=""></div>
            <div class="pv"><b>${euro(r.v)}</b><small>${r.i === R.vincenti.length - 1 ? 'primo premio' : (R.vincenti.length - r.i) + '° premio'}</small>${g ? `<span>${esc(g.nome)}</span>` : fatto ? '<span class="nessuno">nessuno</span>' : ''}</div>
          </div>`;
        }).join('')}</div>
        <div class="info"><div><small>da scoprire</small><b>${R.daSvelare.length}</b></div>${R.riporto ? `<div><small>riporto</small><b>${euro(R.riporto)}</b></div>` : ''}</div>`;
    }
    if (this.chiavi.pannelloH === h) return;
    this.chiavi.pannelloH = h;
    p.innerHTML = h;
  }
  salvadanaio(S) { return Object.values(S.conti).reduce((a, c) => a + c.posta + c.aste, 0); }

  // ------------------------------------------------------------- giocatori in basso
  vive(S, uid) {
    return Object.entries(S.nere).filter(([id, u]) => u === uid && !S.eliminate.includes(id)).map(([id]) => id).sort((a, b) => CARTA[a].n - CARTA[b].n);
  }
  giocatori(S) {
    const gs = Object.entries(S.giocatori).sort((a, b) => a[1].ord - b[1].ord);
    const box = this.$('giocatori');
    if (S.fase === 'attesa') { box.innerHTML = ''; this.chiavi.gioc = ''; return; }
    const k = JSON.stringify([gs.map(([u, g]) => [u, g.nome, this.vive(S, u)]), S.coperte]);
    if (this.chiavi.gioc === k) return;
    this.chiavi.gioc = k;
    box.className = 'giocatori n' + Math.min(gs.length, 12);
    box.innerHTML = gs.map(([u, g]) => {
      const v = this.vive(S, u);
      // le carte si sovrappongono quanto basta per stare nel riquadro
      const larg = Math.min(320, (1860 - 12 * (gs.length - 1)) / gs.length) - 26;
      const cw = gs.length >= 8 ? 50 : 64;
      v.sort((x, y) => (S.coperte?.[x] ? 1 : 0) - (S.coperte?.[y] ? 1 : 0));
      const vis = v.slice(0, 14);
      const m = vis.length > 1 ? Math.min(4, (larg - (v.length > 14 ? 40 : 0) - cw) / (vis.length - 1) - cw) : 0;
      return `<div class="chip" data-uid="${u}" style="--c:${g.colore};--m:${m}px">
        <div class="nome"><span class="pallino"></span>${esc(g.nome)}${v.length ? `<span class="quante">${v.length}</span>` : ''}</div>
        <div class="manina">${vis.map((id) => `<img src="${img(S.coperte?.[id] ? 'dorso_nero' : id, true)}" data-id="${id}" alt="">`).join('')}${v.length > 14 ? `<em>+${v.length - 14}</em>` : ''}${v.length ? '' : '<em class="nulla">nessuna carta</em>'}</div>
      </div>`;
    }).join('');
  }
  chip(uid) { return this.$('giocatori').querySelector(`.chip[data-uid="${uid}"]`); }

  trattative(S) {
    const box = this.$('trattative');
    const ps = Object.values(S.proposte || {}).slice(-3);
    const nomeC = (id) => (S.coperte?.[id] ? 'una carta coperta' : esc(conArticolo(id)));
    const h = ps.map((p) => {
      const da = S.giocatori[p.da], a = S.giocatori[p.a];
      if (!da || !a) return '';
      const testo = p.modo === 'vendo'
        ? `<b style="color:${da.colore}">${esc(da.nome)}</b> offre ${nomeC(p.carta)} a <b style="color:${a.colore}">${esc(a.nome)}</b> per ${euro(p.prezzo)}`
        : `<b style="color:${da.colore}">${esc(da.nome)}</b> vuole ${nomeC(p.carta)} di <b style="color:${a.colore}">${esc(a.nome)}</b> per ${euro(p.prezzo)}`;
      return `<div class="tratt"><img src="${img(S.coperte?.[p.carta] ? 'dorso_nero' : p.carta, true)}" alt="">${testo}</div>`;
    }).join('');
    if (this.chiavi.tratt === h) return;
    this.chiavi.tratt = h;
    box.innerHTML = h;
  }
  trattativa() { /* il riquadro si aggiorna da solo con lo stato */ }

  // ------------------------------------------------------------- risultati finali
  risultati(S) {
    const box = this.$('risultati');
    box.classList.toggle('vis', S.fase === 'fine');
    if (S.fase !== 'fine') { this.chiavi.ris = ''; return; }
    const k = JSON.stringify([S.conti, S.vincite]);
    if (this.chiavi.ris === k) return;
    this.chiavi.ris = k;
    const gs = Object.entries(S.giocatori).map(([u, g]) => {
      const c = S.conti[u];
      return { u, g, c, saldo: c.premi + c.scambi - c.posta - c.aste };
    }).sort((a, b) => b.c.premi - a.c.premi || b.saldo - a.saldo);
    box.innerHTML = `<h2>Com'è andata la fiera</h2>
      <table><thead><tr><th>Giocatore</th><th>Posta</th><th>Aste</th><th>Scambi</th><th>Premi</th><th>Saldo</th></tr></thead>
      <tbody>${gs.map(({ g, c, saldo }) => `<tr class="${c.premi ? 'vince' : ''}" style="--c:${g.colore}">
        <td><span class="pallino"></span>${esc(g.nome)}</td><td>${euro(c.posta)}</td><td>${euro(c.aste)}</td>
        <td>${c.scambi ? (c.scambi > 0 ? '+' : '') + euro(c.scambi) : '-'}</td><td>${c.premi ? euro(c.premi) : '-'}</td>
        <td class="${saldo >= 0 ? 'pos' : 'neg'}">${(saldo > 0 ? '+' : '') + euro(saldo)}</td></tr>`).join('')}</tbody></table>
      <p class="nota">Saldo: quanto ciascuno ci guadagna (+) o ci rimette (-) in tutta la fiera.${S.rosse?.riporto ? ` Restano nel salvadanaio ${euro(S.rosse.riporto)} per la prossima partita.` : ''}</p>
      <button class="apri" id="ancora">Un'altra partita!</button>`;
    box.querySelector('#ancora').onclick = () => this.b.nuovaPartita();
  }

  // ------------------------------------------------------------- eventi animati
  evento(e, S) {
    this.S = S;
    try {
      if (e.tipo === 'regalo' || e.tipo === 'aggiudicato') this.voloAlGiocatore(e, S);
      else if (e.tipo === 'svelata') this.svelata(e, S);
      else if (e.tipo === 'eliminata') this.eliminata(e, S);
      else if (e.tipo === 'premi') this.distribuisciPremi(S);
      else if (e.tipo === 'svelaPremio') this.svelaPremio(e, S);
      else if (e.tipo === 'vittoria') this.vittoria(e, S);
      else if (e.tipo === 'scambio') this.scambio(e, S);
      else if (e.tipo === 'rifiuto') { /* niente */ }
      else if (e.tipo === 'fine') coriandoli(6000, 220);
    } catch (err) { console.warn(err); }
  }

  // le carte volano verso il giocatore e poi fuori dallo schermo (atterrano sul suo telefono)
  voloAlGiocatore(e, S) {
    const g = S.giocatori[e.uid];
    if (!g) return;
    const chip = this.chip(e.uid);
    const partenze = e.tipo === 'aggiudicato'
      ? [...(this.$('lottoCarte')?.querySelectorAll('.carta') || [])]
      : [];
    const scena = this.$('scena').getBoundingClientRect();
    const s = scena.width / 1920;
    e.carte.forEach((id, i) => {
      let da;
      const src = partenze[i];
      if (src) { da = src.getBoundingClientRect(); src.style.visibility = 'hidden'; }
      else {
        const pr = this.$('palco').getBoundingClientRect();
        da = { left: pr.left + pr.width / 2 - 140 * s, top: pr.top + pr.height / 2 - 195 * s, width: 280 * s, height: 390 * s };
      }
      // carte orizzontali: il rettangolo ruotato va riportato in verticale
      if (da.width > da.height) da = { left: da.left + (da.width - da.height) / 2, top: da.top - (da.width - da.height) / 2, width: da.height, height: da.width };
      const nodo = S.coperte?.[id] ? carta(null, { dorso: 'nero', cls: 'volante' }) : carta(id, { cls: 'volante' });
      nodo.style.setProperty('--c', g.colore);
      const cr = chip ? chip.getBoundingClientRect() : { left: scena.left + scena.width / 2, top: scena.bottom, width: 10, height: 10 };
      const tappa = { left: cr.left + cr.width / 2 - 30 * s, top: cr.top - 40 * s, width: 60 * s, height: 84 * s };
      const fuori = { left: tappa.left, top: scena.bottom + 300 * s, width: tappa.width, height: tappa.height };
      setTimeout(() => {
        suona('volo');
        vola(nodo, da, tappa, { durata: 1000, ruota: -20 + Math.random() * 40, scala: tappa.width / da.width, easing: 'cubic-bezier(.4,-0.3,.4,1)' })
          .then(() => {
            nodo.style.left = tappa.left + 'px'; nodo.style.top = tappa.top + 'px'; nodo.style.width = tappa.width + 'px'; nodo.style.height = tappa.height + 'px';
            nodo.getAnimations().forEach((a) => a.cancel());
            if (chip) { chip.classList.remove('riceve'); void chip.offsetWidth; chip.classList.add('riceve'); }
            return vola(nodo, tappa, fuori, { durata: 600, ruota: 30, scala: 0.6, easing: 'cubic-bezier(.6,0,1,.6)', fine: 0.8 });
          })
          .then(() => nodo.remove());
      }, i * 260);
    });
    // aggiorna le carte del giocatore quando sono arrivate
    setTimeout(() => this.giocatori(this.S), 1300 + e.carte.length * 260);
  }

  svelata(e, S) {
    this.palco(S);
    const ult = this.$('ultime');
    if (!ult) return;
    // il gruppo precedente scende nella storia
    if (ult.dataset.g !== String(e.g)) this.svuotaUltime(S);
    ult.dataset.g = String(e.g);
    const c = cartaGirevole(e.carta, 'rosso', { cls: 'grande entra', gira: false });
    const w = el('div', 'ultima');
    w.appendChild(c);
    ult.appendChild(w);
    ult.className = 'ultime n' + ult.children.length;
    setTimeout(() => c.classList.add('girata'), 350);
    const t = this.$('titoloSvela');
    if (t) t.textContent = `Le carte scoperte: ${S.rosse.svelate.length} su ${S.rosse.svelate.length + S.rosse.daSvelare.length}`;
  }
  svuotaUltime(S) {
    const ult = this.$('ultime'), st = this.$('storia');
    if (!ult || !st) return;
    for (const w of [...ult.children]) {
      const id = w.querySelector('.carta')?.dataset.id;
      if (id) st.appendChild(this.miniStoria(id, S));
      w.remove();
    }
    while (st.children.length > 16) st.firstElementChild.remove();
  }

  eliminata(e, S) {
    const g = S.giocatori[e.uid];
    const ult = this.$('ultime');
    const w = ult && [...ult.children].find((x) => x.querySelector('.carta')?.dataset.id === e.carta);
    if (w && g) {
      const r = el('div', 'nastro', `${esc(g.nome)} la perde`);
      r.style.setProperty('--c', g.colore);
      w.appendChild(r);
    }
    const chip = this.chip(e.uid);
    if (chip) {
      chip.classList.remove('perde'); void chip.offsetWidth; chip.classList.add('perde');
      const im = chip.querySelector(`img[data-id="${e.carta}"]`);
      if (im) {
        const nodo = carta(e.carta, { mini: true, cls: 'volante' });
        const da = im.getBoundingClientRect();
        im.style.visibility = 'hidden';
        vola(nodo, da, { left: da.left, top: da.top + 400, width: da.width, height: da.height }, { durata: 1100, ruota: 120, scala: 0.5, fine: 0, easing: 'cubic-bezier(.5,-0.6,1,1)' }).then(() => nodo.remove());
      }
    }
    setTimeout(() => this.giocatori(this.S), 1200);
  }

  distribuisciPremi(S) {
    this.pannello(S);
    this.$('pannello').querySelectorAll('.premio').forEach((p, i) => {
      p.style.animation = `entraDestra .6s ${i * 0.15}s both`;
    });
    this.svuotaUltime(S);
  }

  svelaPremio(e, S) {
    this.palco(S);
    this.svuotaUltime(S);
    const ult = this.$('ultime');
    if (ult) {
      const w = el('div', 'ultima premio-grande');
      const c = cartaGirevole(e.carta, 'rosso', { cls: 'grande entra', gira: false });
      w.appendChild(c);
      w.appendChild(el('div', 'cartellino', euro(e.v)));
      ult.appendChild(w);
      ult.className = 'ultime n1';
      setTimeout(() => c.classList.add('girata'), 500);
      ult.dataset.g = 'premio';
      const t = this.$('titoloSvela');
      if (t) t.textContent = e.i === S.rosse.vincenti.length - 1 ? 'Il primo premio!' : 'Le carte vincenti';
    }
    this.chiavi.pannelloH = '';
    setTimeout(() => this.pannello(this.S), 600);
  }

  vittoria(e, S) {
    const g = S.giocatori[e.uid];
    coriandoli(4500);
    const ult = this.$('ultime');
    const w = ult?.lastElementChild;
    if (w && g) {
      const r = el('div', 'nastro oro', `vince ${esc(g.nome)}!`);
      r.style.setProperty('--c', g.colore);
      w.appendChild(r);
    }
    const chip = this.chip(e.uid);
    if (chip) chip.classList.add('vincitore');
  }

  scambio(e, S) {
    const a = this.chip(e.da), b = this.chip(e.a);
    if (!a || !b) { this.giocatori(S); return; }
    const im = a.querySelector(`img[data-id="${e.carta}"]`);
    const da = (im || a).getBoundingClientRect();
    const br = b.getBoundingClientRect();
    const nodo = S.coperte?.[e.carta] ? carta(null, { mini: true, dorso: 'nero', cls: 'volante' }) : carta(e.carta, { mini: true, cls: 'volante' });
    if (im) im.style.visibility = 'hidden';
    const w = da.width < 80 ? da.width : 50;
    vola(nodo, { left: da.left, top: da.top, width: w, height: w * 1.4 }, { left: br.left + br.width / 2 - 25, top: br.top + 10, width: 50, height: 70 }, { durata: 1100, ruota: 360 })
      .then(() => { nodo.remove(); this.chiavi.gioc = ''; this.giocatori(this.S); b.classList.remove('riceve'); void b.offsetWidth; });
    toast(`${S.giocatori[e.a]?.nome} compra ${S.coperte?.[e.carta] ? 'una carta coperta' : conArticolo(e.carta)} da ${S.giocatori[e.da]?.nome} per ${euro(e.prezzo)}`);
  }
}
