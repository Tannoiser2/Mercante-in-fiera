// Il telefono del giocatore: offerte all'asta, le proprie carte, compravendite, vittoria.
import { RADICE } from './rete.js';
import { CARTA, euro, img, conArticolo } from './dati.js';
import { el, esc, carta, sacco, coriandoli, toast, schermoAcceso } from './comuni.js';
import { suona, sbloccaAudio } from './suoni.js';

export class Telefono {
  constructor(rete, radice, codice) {
    this.rete = rete;
    this.r = radice;
    this.codice = codice;
    this.me = rete.uid;
    this.p = `${RADICE}/${codice}`;
    this.S = null;
    this.visto = null; // ultimo evento già mostrato
    this.risposte = new Set();
    this.foglioAperto = null;
    this.inviata = null;
  }

  async avvia() {
    const host = await this.rete.get(`${this.p}/host`);
    if (!host) { this.messaggio('Codice non trovato', `Non c'è nessuna fiera con il codice <b>${esc(this.codice)}</b>. Controlla sulla TV e riprova.`, true); return; }
    const io = await this.rete.get(`${this.p}/giocatori/${this.me}`);
    if (io && io.nome) this.entra();
    else this.chiediNome();
    this.rete.onConnessione = (ok) => document.body.classList.toggle('scollegato', !ok);
  }

  messaggio(t, testo, altro = false) {
    this.r.innerHTML = `<div class="tel benvenuto"><h1>Mercante in Fiera</h1><div class="box"><h2>${t}</h2><p>${testo}</p>
      ${altro ? '<a class="bottone" href="./">Inserisci un altro codice</a>' : ''}</div></div>`;
  }

  chiediNome() {
    const nome = localStorage.getItem('mif_nome') || '';
    this.r.innerHTML = `<div class="tel benvenuto">
      <h1>Mercante in Fiera</h1><div class="sotto">la grande fiera di Natale</div>
      <div class="box"><h2>Come ti chiami?</h2>
        <input id="nome" maxlength="14" autocomplete="nickname" placeholder="Il tuo nome" value="${esc(nome)}">
        <button class="bottone grande" id="entra">Entra nella fiera</button>
        <p class="piccolo">fiera <b>${esc(this.codice)}</b></p>
      </div></div>`;
    const i = this.r.querySelector('#nome');
    const vai = async () => {
      const n = i.value.trim().slice(0, 14);
      if (!n) { i.focus(); return; }
      sbloccaAudio();
      schermoAcceso();
      localStorage.setItem('mif_nome', n);
      await this.rete.set(`${this.p}/giocatori/${this.me}`, { nome: n, t: Date.now() });
      this.entra();
    };
    this.r.querySelector('#entra').onclick = vai;
    i.onkeydown = (e) => { if (e.key === 'Enter') vai(); };
  }

  entra() {
    localStorage.setItem('mif_ultima', this.codice);
    this.r.innerHTML = `<div class="tel">
      <header class="testa"><div class="io"><span class="pallino"></span><b id="ioNome"></b></div><div class="saldo" id="saldo"></div></header>
      <div class="detto" id="detto"><img src="avatar/base.webp" alt=""><span></span></div>
      <section class="palco-tel" id="palcoTel"></section>
      <section class="trattative-tel" id="trattTel"></section>
      <section class="mie"><h3 id="mieTit">Le mie carte</h3><div class="griglia" id="mie"></div><div class="perse" id="perse"></div></section>
      <section class="tavolo"><h3>Le carte degli altri</h3><div id="tavolo"></div></section>
      <div class="scollegato-avviso">Connessione persa... riprovo</div>
    </div>
    <div class="velo" id="velo"></div>`;
    document.addEventListener('click', () => { sbloccaAudio(); schermoAcceso(); }, { once: true });
    this.rete.on(`${this.p}/stato`, (s) => { if (s) this.nuovoStato(JSON.parse(s)); });
  }

  // ------------------------------------------------------------- arriva un nuovo stato dalla TV
  nuovoStato(S) {
    const prima = this.S;
    this.S = S;
    if (!S.giocatori[this.me]) {
      if (S.fase === 'attesa' && prima && prima.giocatori[this.me]) { this.chiediNome(); return; }
      if (!prima) { this.render(); return; }
    }
    const nuovi = this.visto === null ? [] : S.ev.filter((e) => e.n > this.visto);
    this.visto = S.evn;
    // prima della ridisegnata: carte che se ne vanno
    for (const e of nuovi) this.eventoPrima(e);
    this.render();
    for (const e of nuovi) this.eventoDopo(e);
    this.controllaProposte();
  }

  vive(uid) {
    const S = this.S;
    return Object.entries(S.nere).filter(([id, u]) => u === uid && !S.eliminate.includes(id)).map(([id]) => id).sort((a, b) => CARTA[a].n - CARTA[b].n);
  }
  perse(uid) { return this.S.eliminate.filter((id) => this.S.nere[id] === uid); }
  saldo() {
    const c = this.S.conti[this.me];
    return c ? c.premi + c.scambi - c.posta - c.aste : 0;
  }

  // ------------------------------------------------------------- disegno
  render() {
    const S = this.S, io = S.giocatori[this.me];
    if (!io) {
      this.r.querySelector('#palcoTel') && (this.r.querySelector('#palcoTel').innerHTML = '<div class="aspetta"><h2>La fiera è già finita</h2><p>Aspetta la prossima partita!</p></div>');
      return;
    }
    document.documentElement.style.setProperty('--mio', io.colore);
    this.r.querySelector('#ioNome').textContent = io.nome;
    const c = S.conti[this.me];
    this.r.querySelector('#saldo').innerHTML = S.fase === 'attesa' ? '' : `<span><small>speso</small>${euro(c.posta + c.aste)}</span>${c.scambi ? `<span><small>scambi</small>${(c.scambi > 0 ? '+' : '') + euro(c.scambi)}</span>` : ''}${c.premi ? `<span class="oro"><small>vinto</small>${euro(c.premi)}</span>` : ''}`;
    const d = this.r.querySelector('#detto');
    d.querySelector('span').textContent = S.banditore?.testo || '';
    d.classList.toggle('vis', !!S.banditore?.testo);
    this.palco();
    this.trattative();
    this.mie();
    this.tavolo();
  }

  palco() {
    const S = this.S, box = this.r.querySelector('#palcoTel');
    let h = '';
    if (S.pausa) h += '<div class="pausa-tel">Il banditore ha messo in pausa</div>';
    if (S.fase === 'attesa') {
      const n = Object.keys(S.giocatori).length;
      h += `<div class="aspetta"><h2>Sei al banco!</h2><p>Guarda la TV: quando arrivano tutti, il banditore apre la fiera.</p><p class="piccolo">${n} ${n === 1 ? 'giocatore' : 'giocatori'} al banco</p></div>`;
    } else if (S.fase === 'regali') {
      h += '<div class="aspetta"><h2>I regali della casa</h2><p>Il banditore regala una carta a ciascuno...</p></div>';
    } else if (S.fase === 'asta') {
      h += this.htmlAsta();
    } else if (['premi', 'svela', 'finale'].includes(S.fase)) {
      h += this.htmlSvela();
    } else if (S.fase === 'fine') {
      h += this.htmlFine();
    }
    if (box.dataset.h === h) return;
    box.dataset.h = h;
    box.innerHTML = h;
    box.querySelectorAll('[data-offri]').forEach((b) => { b.onclick = () => this.offri(Number(b.dataset.offri)); });
    if (S.fase === 'asta' && S.lotto && S.lotto.tipo === 'buio' && !S.lotto.rivelate) {
      const s = box.querySelector('.lotto-tel');
      if (s) { s.innerHTML = ''; s.appendChild(sacco('piccolo')); }
    }
  }

  htmlAsta() {
    const S = this.S, L = S.lotto;
    if (!L) return '<div class="aspetta"><h2>Asta in corso</h2><p>Il banditore prepara il prossimo lotto...</p></div>';
    const tipi = { scoperta: L.k > 1 ? `${L.k} carte` : '1 carta', coperta: `${L.k} carte coperte`, buio: 'al buio: chissà quante!' };
    let carte = '';
    if (L.tipo === 'buio' && !L.rivelate) carte = '';
    else carte = L.carte.map((id) => `<img class="c" src="${img(L.rivelate ? id : 'dorso_nero', true)}" alt="">`).join('');
    const m = L.migliore, g = m ? S.giocatori[m.uid] : null;
    const prossima = m ? m.v + S.cfg.passo : L.base;
    let azione = '';
    if (L.stato === 'aperto' && !S.pausa) {
      if (m && m.uid === this.me) azione = `<div class="intesta">Sei in testa con ${euro(m.v)}!</div>`;
      else {
        const pi = [prossima, prossima + 40, prossima + 90, prossima + 190];
        azione = `<div class="offri">${pi.map((v, i) => `<button class="${i === 0 ? 'primo' : ''}" data-offri="${v}"><small>offro</small>${euro(v)}</button>`).join('')}</div>`;
        if (this.inviata && this.inviata.lotto === L.id && Date.now() - this.inviata.t < 2500) azione += '<div class="inviata">offerta inviata...</div>';
      }
    } else if (L.stato === 'aggiudicato') {
      azione = `<div class="esito" style="--c:${g?.colore}">${m.uid === this.me ? 'Aggiudicato a te!' : `Aggiudicato a ${esc(g?.nome || '')}`}</div>`;
    } else if (L.stato === 'invenduto') azione = '<div class="esito">Invenduto</div>';
    return `<div class="asta-tel">
      <div class="lotto-titolo">Lotto n. ${L.id}: ${tipi[L.tipo]}</div>
      <div class="lotto-tel n${L.k}">${carte}</div>
      ${L.rivelate && L.tipo === 'scoperta' ? `<div class="nomi-lotto">${L.carte.map((id) => esc(CARTA[id].nome)).join(', ')}</div>` : ''}
      <div class="attuale"><small>${m ? 'offerta di' : "base d'asta"}</small> <b>${euro(m ? m.v : L.base)}</b> ${g ? `<span class="chi" style="--c:${g.colore}">${esc(g.nome)}</span>` : ''}</div>
      <div class="conta-tel">${['UNO', 'DUE', 'TRE'].map((t, i) => `<span class="${L.conta > i ? 'on' : ''}">${t}</span>`).join('')}</div>
      ${azione}
    </div>`;
  }

  htmlSvela() {
    const S = this.S, R = S.rosse;
    if (!R) return '<div class="aspetta"><h2>Si contano i soldi...</h2></div>';
    let h = '';
    if (S.mercato) h += `<div class="mercato-tel"><b>Mercato aperto: ${S.mercato.resto}</b><span>tocca una carta per venderla, o una carta degli altri per comprarla</span></div>`;
    if (S.indizio) h += `<div class="indizio-tel">Sta per uscire <b>${esc(S.indizio)}</b></div>`;
    const ultima = R.svelate[R.svelate.length - 1];
    h += `<div class="premi-tel"><div class="monte"><small>montepremi</small> <b>${euro(S.montepremi)}</b></div>
      <div class="lista">${R.vincenti.map((id, i) => ({ id, i })).reverse().map(({ id, i }) => {
        const fatto = R.premiate.includes(id);
        const vin = S.vincite.find((x) => x.carta === id);
        return `<div class="pr ${fatto ? 'fatto' : ''} ${vin && vin.uid === this.me ? 'mio' : ''}"><img src="${img(fatto ? id : 'dorso_rosso', true)}" alt=""><b>${euro(R.premi[i])}</b>${vin ? `<small>${esc(S.giocatori[vin.uid]?.nome || '')}</small>` : ''}</div>`;
      }).join('')}</div></div>`;
    if (ultima && S.fase === 'svela') h += `<div class="ultima-tel"><img src="${img(ultima, true)}" alt=""><span>ultima scoperta: <b>${esc(CARTA[ultima].nome)}</b><br>ne mancano ${R.daSvelare.length}</span></div>`;
    return h;
  }

  htmlFine() {
    const S = this.S, c = S.conti[this.me];
    const mie = S.vincite.filter((v) => v.uid === this.me);
    const saldo = this.saldo();
    return `<div class="fine-tel ${mie.length ? 'vinto' : ''}">
      <h2>${mie.length ? 'Hai vinto!' : 'Sarà per la prossima!'}</h2>
      ${mie.map((v) => `<div class="vincita"><img src="${img(v.carta, true)}" alt=""><b>${euro(v.v)}</b></div>`).join('')}
      <table><tr><td>Posta</td><td>${euro(c.posta)}</td></tr><tr><td>Aste</td><td>${euro(c.aste)}</td></tr>
      <tr><td>Scambi</td><td>${(c.scambi > 0 ? '+' : '') + euro(c.scambi)}</td></tr><tr><td>Premi</td><td>${euro(c.premi)}</td></tr>
      <tr class="tot"><td>Saldo</td><td>${(saldo > 0 ? '+' : '') + euro(saldo)}</td></tr></table>
      <p class="piccolo">${saldo < 0 ? `Metti ${euro(-saldo)} nel salvadanaio.` : saldo > 0 ? `Ritira ${euro(saldo)} dal salvadanaio!` : 'Pari e patta!'}</p>
    </div>`;
  }

  mie() {
    const v = this.vive(this.me), pe = this.perse(this.me);
    const box = this.r.querySelector('#mie');
    const k = v.join() + '|' + this.S.fase;
    this.r.querySelector('#mieTit').textContent = v.length ? `Le mie carte (${v.length})` : 'Le mie carte';
    if (box.dataset.k !== k) {
      box.dataset.k = k;
      box.innerHTML = v.length ? '' : '<p class="vuoto">Ancora nessuna carta: fai un\'offerta!</p>';
      for (const id of v) {
        const c = carta(id, { mini: true, cls: 'mia' });
        c.onclick = () => this.foglioVendi(id);
        box.appendChild(c);
      }
    }
    const pb = this.r.querySelector('#perse');
    const kp = pe.join();
    if (pb.dataset.k !== kp) {
      pb.dataset.k = kp;
      pb.innerHTML = pe.length ? `<small>perse:</small> ${pe.map((id) => `<img src="${img(id, true)}" alt="">`).join('')}` : '';
    }
  }

  tavolo() {
    const S = this.S;
    const gs = Object.entries(S.giocatori).filter(([u]) => u !== this.me).sort((a, b) => a[1].ord - b[1].ord);
    const box = this.r.querySelector('#tavolo');
    const k = JSON.stringify(gs.map(([u]) => [u, this.vive(u)])) + S.fase;
    if (box.dataset.k === k) return;
    box.dataset.k = k;
    box.innerHTML = gs.length ? '' : '<p class="vuoto">Nessun altro al banco</p>';
    for (const [u, g] of gs) {
      const riga = el('div', 'riga-g');
      riga.style.setProperty('--c', g.colore);
      riga.innerHTML = `<div class="chi"><span class="pallino"></span>${esc(g.nome)}</div>`;
      const cc = el('div', 'sue');
      const v = this.vive(u);
      if (!v.length) cc.innerHTML = '<em>nessuna carta</em>';
      for (const id of v) {
        const c = carta(id, { mini: true });
        c.onclick = () => this.foglioCompra(id, u);
        cc.appendChild(c);
      }
      riga.appendChild(cc);
      box.appendChild(riga);
    }
  }

  trattative() {
    const S = this.S;
    const mie = Object.entries(S.proposte || {}).filter(([, p]) => p.da === this.me);
    const box = this.r.querySelector('#trattTel');
    const h = mie.map(([pid, p]) => `<div class="tr"><img src="${img(p.carta, true)}" alt=""><span>${p.modo === 'vendo' ? 'Offri' : 'Chiedi'} ${esc(conArticolo(p.carta))} a <b>${esc(S.giocatori[p.a]?.nome || '')}</b> per ${euro(p.prezzo)}<br><small>aspetto la risposta...</small></span><button data-ritira="${pid}">ritira</button></div>`).join('');
    if (box.dataset.h === h) return;
    box.dataset.h = h;
    box.innerHTML = h;
    box.querySelectorAll('[data-ritira]').forEach((b) => { b.onclick = () => this.manda({ tipo: 'ritira', pid: b.dataset.ritira }); });
  }

  // ------------------------------------------------------------- azioni
  offri(v) {
    const L = this.S.lotto;
    if (!L) return;
    sbloccaAudio();
    suona('offerta');
    navigator.vibrate?.(30);
    this.inviata = { lotto: L.id, t: Date.now() };
    this.rete.set(`${this.p}/offerte/${this.me}`, { v, lotto: L.id, t: Date.now() });
    this.r.querySelector('#palcoTel').dataset.h = '';
    this.palco();
    setTimeout(() => { this.r.querySelector('#palcoTel').dataset.h = ''; this.palco(); }, 2600);
  }
  manda(q) { return this.rete.push(`${this.p}/richieste`, { ...q, da: this.me, t: Date.now() }); }

  puoTrattare() { return ['regali', 'asta', 'premi', 'svela', 'finale'].includes(this.S.fase); }

  foglio(html, dopo) {
    const v = this.r.querySelector('#velo') || document.getElementById('velo');
    v.innerHTML = `<div class="foglio">${html}<button class="chiudi">chiudi</button></div>`;
    v.classList.add('vis');
    v.onclick = (e) => { if (e.target === v) this.chiudiFoglio(); };
    v.querySelector('.chiudi').onclick = () => this.chiudiFoglio();
    dopo?.(v);
  }
  chiudiFoglio() { const v = document.getElementById('velo'); v.classList.remove('vis'); v.innerHTML = ''; this.foglioAperto = null; }

  prezzoHtml() {
    return `<div class="prezzo"><button data-d="-50">- 0,50</button><button data-d="-10">- 0,10</button><b id="prezzo"></b><button data-d="10">+ 0,10</button><button data-d="50">+ 0,50</button><button data-d="100">+ 1,00</button></div>`;
  }
  legaPrezzo(v, iniziale) {
    let prezzo = iniziale;
    const mostra = () => { v.querySelector('#prezzo').textContent = prezzo ? euro(prezzo) : 'in regalo'; };
    v.querySelectorAll('[data-d]').forEach((b) => { b.onclick = () => { prezzo = Math.max(0, Math.min(99900, prezzo + Number(b.dataset.d))); mostra(); }; });
    mostra();
    return () => prezzo;
  }

  foglioVendi(id) {
    const S = this.S;
    const altri = Object.entries(S.giocatori).filter(([u]) => u !== this.me).sort((a, b) => a[1].ord - b[1].ord);
    if (!this.puoTrattare()) { this.foglio(`<img class="grande" src="${img(id)}" alt=""><h3>${esc(CARTA[id].nome)}</h3>`); return; }
    this.foglio(`<img class="grande" src="${img(id)}" alt=""><h3>Vendi ${esc(conArticolo(id))}</h3>
      <p>A chi la vuoi proporre?</p><div class="scegli">${altri.map(([u, g]) => `<button data-u="${u}" style="--c:${g.colore}">${esc(g.nome)}</button>`).join('') || '<em>nessun altro giocatore</em>'}</div>
      <p>A che prezzo?</p>${this.prezzoHtml()}<button class="bottone grande" id="proponi" disabled>Proponi</button>`, (v) => {
      let chi = null;
      const prezzo = this.legaPrezzo(v, 100);
      v.querySelectorAll('[data-u]').forEach((b) => {
        b.onclick = () => { chi = b.dataset.u; v.querySelectorAll('[data-u]').forEach((x) => x.classList.toggle('sel', x === b)); v.querySelector('#proponi').disabled = false; };
      });
      v.querySelector('#proponi').onclick = () => {
        if (!chi) return;
        this.manda({ tipo: 'proponi', a: chi, carta: id, prezzo: prezzo(), modo: 'vendo' });
        toast(`Proposta inviata a ${S.giocatori[chi].nome}`);
        this.chiudiFoglio();
      };
    });
  }

  foglioCompra(id, u) {
    const S = this.S, g = S.giocatori[u];
    if (!this.puoTrattare()) { this.foglio(`<img class="grande" src="${img(id)}" alt=""><h3>${esc(CARTA[id].nome)}</h3><p>di ${esc(g.nome)}</p>`); return; }
    this.foglio(`<img class="grande" src="${img(id)}" alt=""><h3>Compra ${esc(conArticolo(id))}</h3><p>da <b style="color:${g.colore}">${esc(g.nome)}</b>: quanto offri?</p>
      ${this.prezzoHtml()}<button class="bottone grande" id="proponi">Fai l'offerta</button>`, (v) => {
      const prezzo = this.legaPrezzo(v, 100);
      v.querySelector('#proponi').onclick = () => {
        this.manda({ tipo: 'proponi', a: u, carta: id, prezzo: prezzo(), modo: 'compro' });
        toast(`Offerta inviata a ${g.nome}`);
        this.chiudiFoglio();
      };
    });
  }

  controllaProposte() {
    const S = this.S;
    if (this.foglioAperto) {
      if (!S.proposte[this.foglioAperto]) this.chiudiFoglio();
      return;
    }
    if (document.getElementById('velo').classList.contains('vis')) return;
    const entrata = Object.entries(S.proposte || {}).find(([pid, p]) => p.a === this.me && !this.risposte.has(pid));
    if (!entrata) return;
    const [pid, p] = entrata;
    const g = S.giocatori[p.da];
    if (!g) return;
    suona('arrivo');
    navigator.vibrate?.([60, 40, 60]);
    const testo = p.modo === 'vendo'
      ? `<b style="color:${g.colore}">${esc(g.nome)}</b> ti vuole vendere <b>${esc(conArticolo(p.carta))}</b> per <b>${p.prezzo ? euro(p.prezzo) : 'niente (regalo!)'}</b>`
      : `<b style="color:${g.colore}">${esc(g.nome)}</b> vuole comprare <b>${esc(conArticolo(p.carta))}</b> per <b>${p.prezzo ? euro(p.prezzo) : 'niente'}</b>`;
    this.foglio(`<div class="proposta"><h3>Una proposta!</h3><img class="grande" src="${img(p.carta)}" alt=""><p>${testo}</p>
      <div class="sino"><button class="no" id="no">No grazie</button><button class="si" id="si">Affare fatto!</button></div></div>`, (v) => {
      this.foglioAperto = pid;
      const rispondi = (ok) => { this.risposte.add(pid); this.manda({ tipo: 'rispondi', pid, ok }); this.chiudiFoglio(); };
      v.querySelector('#si').onclick = () => rispondi(true);
      v.querySelector('#no').onclick = () => rispondi(false);
      v.querySelector('.chiudi').onclick = () => rispondi(false);
    });
  }

  // ------------------------------------------------------------- eventi animati
  eventoPrima(e) {
    if (e.tipo === 'eliminata' && e.uid === this.me) this.eliminazione(e.carta);
    if (e.tipo === 'scambio' && e.da === this.me) this.partenza(e.carta, e);
  }
  eventoDopo(e) {
    const S = this.S;
    if ((e.tipo === 'regalo' || e.tipo === 'aggiudicato') && e.uid === this.me) this.arrivo(e.carte, e.tipo === 'regalo' ? 'Un regalo per te!' : `Tue per ${euro(e.v)}!`);
    else if (e.tipo === 'scambio' && e.a === this.me) this.arrivo([e.carta], `Comprata da ${S.giocatori[e.da]?.nome || ''}`);
    else if (e.tipo === 'rifiuto' && e.a === this.me) toast(`${S.giocatori[e.da]?.nome || 'Qualcuno'} ha detto di no`, 'no');
    else if (e.tipo === 'vittoria') {
      if (e.uid === this.me) this.vittoria(e);
      else toast(`${S.giocatori[e.uid]?.nome} vince ${euro(e.v)}!`);
    } else if (e.tipo === 'fine') { suona('campanelli'); }
  }

  arrivo(carte, scritta) {
    const box = this.r.querySelector('#mie');
    suona('arrivo');
    navigator.vibrate?.([40, 30, 80]);
    const strato = el('div', 'arrivo-strato');
    strato.innerHTML = `<div class="scritta">${esc(scritta)}</div>`;
    document.body.appendChild(strato);
    const W = Math.min(innerWidth * 0.42, 220);
    carte.forEach((id, i) => {
      const slot = box.querySelector(`.carta[data-id="${id}"]`);
      if (slot) slot.style.visibility = 'hidden';
      const c = carta(id, { cls: 'arriva' });
      const x = innerWidth / 2 - W / 2 + (i - (carte.length - 1) / 2) * W * 0.35;
      c.style.cssText = `position:fixed;left:${x}px;top:${innerHeight * 0.18}px;width:${W}px;height:${W * 1.4}px;z-index:950`;
      strato.appendChild(c);
      const an = c.animate([
        { transform: `translateY(${-innerHeight}px) rotate(${-30 + i * 20}deg) scale(.6)` },
        { transform: `translateY(20px) rotate(${(i - 1) * 4}deg) scale(1.05)`, offset: 0.7 },
        { transform: `translateY(0) rotate(${(i - 1) * 4}deg) scale(1)` },
      ], { duration: 800, delay: i * 180, easing: 'cubic-bezier(.3,.8,.4,1)', fill: 'both' });
      an.finished.then(() => new Promise((r) => setTimeout(r, 1100 + (carte.length - 1 - i) * 120))).then(() => {
        const s = box.querySelector(`.carta[data-id="${id}"]`);
        const a = s ? s.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight, width: 10, height: 14 };
        const da = c.getBoundingClientRect();
        const dx = a.left + a.width / 2 - (da.left + da.width / 2), dy = a.top + a.height / 2 - (da.top + da.height / 2);
        return c.animate([{ transform: getComputedStyle(c).transform }, { transform: `translate(${dx}px,${dy}px) scale(${a.width / da.width})` }], { duration: 500, easing: 'ease-in', fill: 'forwards' }).finished;
      }).then(() => {
        const s = box.querySelector(`.carta[data-id="${id}"]`);
        if (s) { s.style.visibility = ''; s.classList.add('lampo'); }
        c.remove();
        if (i === carte.length - 1) strato.remove();
      });
    });
  }

  eliminazione(id) {
    suona('peccato');
    navigator.vibrate?.([200, 80, 200]);
    const strato = el('div', 'arrivo-strato rosso');
    strato.innerHTML = `<div class="scritta">Peccato! Hai perso ${esc(conArticolo(id))}</div>`;
    document.body.appendChild(strato);
    const W = Math.min(innerWidth * 0.5, 240);
    const c = el('div', 'carta eliminata');
    c.innerHTML = `<img src="${img(id)}" alt=""><div class="croce"><i></i><i></i></div><div class="bollo">ELIMINATA</div>`;
    c.style.cssText = `position:fixed;left:${innerWidth / 2 - W / 2}px;top:${innerHeight * 0.2}px;width:${W}px;height:${W * 1.4}px;z-index:950`;
    strato.appendChild(c);
    c.animate([
      { transform: 'scale(.3)', opacity: 0 },
      { transform: 'scale(1.05)', opacity: 1, offset: 0.15 },
      { transform: 'scale(1) rotate(0)', offset: 0.25 },
      { transform: 'translateX(-10px) rotate(-3deg)', offset: 0.35 },
      { transform: 'translateX(10px) rotate(3deg)', offset: 0.45 },
      { transform: 'translateX(0) rotate(0)', offset: 0.55 },
      { transform: 'translateY(0) rotate(0)', opacity: 1, offset: 0.7 },
      { transform: `translateY(${innerHeight}px) rotate(40deg)`, opacity: 0.2 },
    ], { duration: 2600, easing: 'ease-in-out', fill: 'forwards' }).finished.then(() => strato.remove());
  }

  partenza(id, e) {
    const S = this.S;
    const W = Math.min(innerWidth * 0.4, 200);
    const c = carta(id);
    c.style.cssText = `position:fixed;left:${innerWidth / 2 - W / 2}px;top:${innerHeight * 0.3}px;width:${W}px;height:${W * 1.4}px;z-index:950`;
    document.body.appendChild(c);
    suona('volo');
    toast(`Venduta a ${S.giocatori[e.a]?.nome || ''} per ${euro(e.prezzo)}`);
    c.animate([{ transform: 'scale(.5)', opacity: 0 }, { transform: 'scale(1)', opacity: 1, offset: 0.3 }, { transform: `translateY(${-innerHeight}px) rotate(25deg) scale(.7)`, opacity: 1 }],
      { duration: 1400, easing: 'ease-in', fill: 'forwards' }).finished.then(() => c.remove());
  }

  vittoria(e) {
    suona('fanfara');
    navigator.vibrate?.([100, 50, 100, 50, 300]);
    const v = el('div', 'vittoria');
    v.innerHTML = `<div class="raggi"></div><h1>HAI VINTO!</h1><div class="cifra">${euro(e.v)}</div>
      <img src="${img(e.carta)}" alt=""><p>con ${esc(conArticolo(e.carta))}</p><button class="bottone grande">Evviva!</button>`;
    document.body.appendChild(v);
    coriandoli(6000, 200);
    v.querySelector('button').onclick = () => v.remove();
  }
}
