// Il banditore virtuale: tiene lo stato della partita (è l'unico che lo scrive) e conduce asta,
// svelamento e premiazione. Gira sul dispositivo collegato alla TV (iPad).
import { RADICE, nuovoCodice } from './rete.js';
import { ACCEL, CARTE, CARTA, INDIZI, COLORI, euro, euroParlato, mescola, caso, RIPARTIZIONE, vincentiPerGiocatori, conArticolo } from './dati.js';
import { frase } from './frasi.js';
import { parla, zitto, suona } from './suoni.js';

const CFG_BASE = { posta: 100, base: 20, passo: 10, regalo: 1, vincenti: 0, velocita: 1, voce: true, nCarte: 40 };

export class Banditore {
  constructor(rete, vista) {
    this.rete = rete;
    this.vista = vista; // tv.js: disegna e anima
    this.S = null;
    this.segnale = 0; // cresce a ogni offerta valida (interrompe le attese)
    this.avanti = false;
    this.inCorso = false;
    this.bot = [];
  }

  get p() { return `${RADICE}/${this.codice}`; }

  // ---------------------------------------------------------------- stanza
  async nuovaStanza() {
    let codice;
    for (let i = 0; i < 8; i++) {
      codice = nuovoCodice();
      const h = await this.rete.get(`${RADICE}/${codice}/host`);
      if (!h) break;
    }
    this.codice = codice;
    await this.rete.set(`${this.p}/host`, this.rete.uid);
    await this.rete.set(`${this.p}/created`, Date.now());
    const cfg = { ...CFG_BASE, ...(JSON.parse(localStorage.getItem('mif_cfg') || '{}')) };
    this.S = {
      v: 1, codice, fase: 'attesa', cfg, giocatori: {}, conti: {}, nere: {}, mazzo: [], tentativi: {}, eliminate: [],
      coperte: {}, lotto: null, nLotti: 0, rosse: null, mercato: null, indizio: null, proposte: {}, vincite: [],
      banditore: { testo: '', posa: 'saluta', n: 0 }, ev: [], evn: 0, pausa: false, montepremi: 0,
    };
    localStorage.setItem('mif_tv', codice);
    this.ascolta();
    this.salva();
    this.vista.tutto(this.S);
    this.di('benvenuto');
  }

  async riprendi(codice) {
    const h = await this.rete.get(`${RADICE}/${codice}/host`);
    const st = await this.rete.get(`${RADICE}/${codice}/stato`);
    if (h !== this.rete.uid || !st) return false;
    this.codice = codice;
    this.S = JSON.parse(st);
    this.S.mercato = null;
    this.S.coperte = this.S.coperte || {};
    this.ascolta();
    this.vista.tutto(this.S);
    if (this.S.fase !== 'attesa' && this.S.fase !== 'fine') this.regia();
    return true;
  }

  ascolta() {
    const r = this.rete;
    r.onFigli(`${this.p}/giocatori`, {
      aggiunto: (uid, g) => this.nuovoGiocatore(uid, g),
      cambiato: (uid, g) => this.nuovoGiocatore(uid, g),
    });
    r.onFigli(`${this.p}/offerte`, {
      aggiunto: (uid, o) => this.offerta(uid, o),
      cambiato: (uid, o) => this.offerta(uid, o),
    });
    r.onFigli(`${this.p}/richieste`, {
      aggiunto: (k, q) => { this.richiesta(k, q); r.remove(`${this.p}/richieste/${k}`); },
    });
    // pulizia periodica delle trattative scadute e conto alla rovescia del mercato
    setInterval(() => this.tick(), 1000);
  }

  salva() {
    if (this._salva) return;
    this._salva = setTimeout(() => {
      this._salva = null;
      this.rete.set(`${this.p}/stato`, JSON.stringify(this.S));
      this.vista.aggiorna(this.S);
    }, 40);
  }

  evento(tipo, dati = {}) {
    const e = { n: ++this.S.evn, tipo, ...dati };
    this.S.ev.push(e);
    if (this.S.ev.length > 14) this.S.ev.shift();
    this.salva();
    this.vista.evento(e, this.S);
    return e;
  }

  nome(uid) { return this.S.giocatori[uid]?.nome || 'qualcuno'; }
  vel(ms) { return ms / (this.S.cfg.velocita || 1) / ACCEL; }

  // Il banditore parla: fumetto sulla TV + voce. Risolve quando ha finito di parlare.
  di(tipo, d = {}, { interrompi = false } = {}) {
    const dati = { ...d };
    if (typeof d.cifra === 'number') { dati.cifra = euro(d.cifra); dati.cifraVoce = euroParlato(d.cifra); }
    if (d.carta && CARTA[d.carta]) { dati.carta = conArticolo(d.carta); dati.cartaVoce = conArticolo(d.carta); }
    const f = frase(tipo, dati);
    this.S.banditore = { testo: f.testo, posa: f.posa, n: (this.S.banditore?.n || 0) + 1 };
    this.salva();
    this.vista.banditore(this.S.banditore);
    return parla(f.voce, { interrompi });
  }

  // Attesa interrompibile: torna true se nel frattempo è arrivata un'offerta (segnale cambiato)
  async attendi(ms, visto = null) {
    const fine = Date.now() + this.vel(ms);
    while (Date.now() < fine || this.S.pausa) {
      if (visto !== null && this.segnale !== visto) return true;
      if (this.avanti) { this.avanti = false; return false; }
      await new Promise((r) => setTimeout(r, 80));
    }
    return visto !== null && this.segnale !== visto;
  }

  // ---------------------------------------------------------------- giocatori
  nuovoGiocatore(uid, g) {
    const S = this.S;
    if (!g || !g.nome) return;
    let nome = String(g.nome).trim().slice(0, 16) || 'Ospite';
    if (S.giocatori[uid]) {
      if (S.giocatori[uid].nome !== nome) { S.giocatori[uid].nome = this.nomeUnico(nome, uid); this.salva(); }
      return;
    }
    if (S.fase === 'fine') return;
    const ord = Object.keys(S.giocatori).length;
    S.giocatori[uid] = { nome: this.nomeUnico(nome, uid), colore: COLORI[ord % COLORI.length], ord, bot: !!g.bot };
    S.conti[uid] = { posta: 0, aste: 0, scambi: 0, premi: 0 };
    // chi arriva a fiera iniziata paga la posta (se l'asta è ancora aperta) e riceve il regalo
    if (S.fase === 'regali' || S.fase === 'asta') {
      S.conti[uid].posta = S.cfg.posta;
      for (let i = 0; i < S.cfg.regalo && S.mazzo.length; i++) {
        const id = S.mazzo.shift();
        S.nere[id] = uid;
        S.coperte[id] = true;
        this.evento('regalo', { uid, carte: [id] });
      }
    }
    this.salva();
    this.vista.aggiorna(S);
    if (S.fase === 'attesa' || Math.random() < 0.6) this.di('arrivo', { nome: S.giocatori[uid].nome });
  }
  nomeUnico(nome, uid) {
    const usati = Object.entries(this.S.giocatori).filter(([u]) => u !== uid).map(([, g]) => g.nome.toLowerCase());
    if (!usati.includes(nome.toLowerCase())) return nome;
    for (let i = 2; ; i++) if (!usati.includes((nome + ' ' + i).toLowerCase())) return nome + ' ' + i;
  }
  togliGiocatore(uid) {
    const S = this.S;
    if (S.fase !== 'attesa') return;
    delete S.giocatori[uid];
    delete S.conti[uid];
    this.rete.remove(`${this.p}/giocatori/${uid}`);
    Object.values(S.giocatori).sort((a, b) => a.ord - b.ord).forEach((g, i) => { g.ord = i; g.colore = COLORI[i % COLORI.length]; });
    this.salva();
  }
  aggiungiBot(n) {
    const nomi = ['Nonna Pina', 'Zio Gino', 'Zia Carla', 'Nonno Beppe', 'Cugino Leo', 'Marta', 'Babbo', 'Mamma'];
    for (let i = 0; i < n; i++) {
      const uid = 'bot' + (this.bot.length + 1);
      this.bot.push(uid);
      this.nuovoGiocatore(uid, { nome: nomi[(this.bot.length - 1) % nomi.length], bot: true });
    }
  }

  // ---------------------------------------------------------------- comandi dalla TV
  cfg(k, v) { this.S.cfg[k] = v; localStorage.setItem('mif_cfg', JSON.stringify(this.S.cfg)); this.salva(); }
  pausa(v = !this.S.pausa) { this.S.pausa = v; if (v) zitto(); this.salva(); }
  saltaAvanti() { this.avanti = true; zitto(); }

  async inizia() {
    const S = this.S;
    if (S.fase !== 'attesa' || Object.keys(S.giocatori).length < 1) return;
    S.fase = 'regali';
    // per le prove si può giocare con meno figure: le stesse nel mazzo nero e in quello rosso
    const n = Math.max(6, Math.min(CARTE.length, S.cfg.nCarte || CARTE.length));
    S.figure = mescola(CARTE.map((c) => c.id)).slice(0, n);
    S.mazzo = mescola(S.figure);
    S.nere = {}; S.coperte = {}; S.eliminate = []; S.tentativi = {}; S.vincite = []; S.proposte = {};
    S.serie = null; S.sfortuna = null; S.pochi = [];
    for (const uid of Object.keys(S.giocatori)) S.conti[uid] = { posta: S.cfg.posta, aste: 0, scambi: 0, premi: 0 };
    this.salva();
    this.regia();
  }

  async nuovaPartita() {
    const S = this.S;
    S.fase = 'attesa'; S.lotto = null; S.rosse = null; S.mercato = null; S.indizio = null; S.nLotti = 0;
    S.nere = {}; S.coperte = {}; S.eliminate = []; S.vincite = []; S.proposte = {}; S.montepremi = 0;
    for (const uid of Object.keys(S.conti)) S.conti[uid] = { posta: 0, aste: 0, scambi: 0, premi: 0 };
    this.salva();
    this.vista.tutto(S);
    this.di('benvenuto');
  }

  // ---------------------------------------------------------------- regia
  async regia() {
    if (this.inCorso) return;
    this.inCorso = true;
    try {
      const S = this.S;
      if (S.fase === 'regali') await this.faseRegali();
      if (S.fase === 'asta') await this.faseAsta();
      if (S.fase === 'premi') await this.fasePremi();
      if (S.fase === 'svela') await this.faseSvela();
      if (S.fase === 'finale') await this.faseFinale();
    } finally { this.inCorso = false; }
  }

  async faseRegali() {
    const S = this.S;
    await this.di('inizio', { cifra: S.cfg.posta });
    suona('moneta');
    if (S.cfg.regalo > 0) {
      await this.di('regalo');
      for (let r = 0; r < S.cfg.regalo; r++) {
        for (const uid of this.ordine()) {
          if (!S.mazzo.length) break;
          const id = S.mazzo.shift();
          S.nere[id] = uid;
          S.coperte[id] = true; // la carta in regalo la vede solo chi la riceve
          this.evento('regalo', { uid, carte: [id] });
          await this.attendi(900);
        }
      }
      await this.attendi(1200);
    }
    S.fase = 'asta';
    this.salva();
  }
  ordine() { return Object.entries(this.S.giocatori).sort((a, b) => a[1].ord - b[1].ord).map(([u]) => u); }

  // ---------------------------------------------------------------- asta
  creaLotto() {
    const S = this.S, R = S.mazzo.length, cfg = S.cfg;
    let tipo = 'scoperta', k = 1;
    const r = Math.random();
    if (S.nLotti >= 2 && R > 1) {
      if (r < 0.5) { tipo = 'scoperta'; k = Math.random() < 0.22 ? 2 : 1; }
      else if (r < 0.75) { tipo = 'coperta'; k = 1 + Math.floor(Math.random() * 3); }
      else { tipo = 'buio'; k = 1 + Math.floor(Math.random() * 4); }
    }
    k = Math.min(k, R);
    const carte = S.mazzo.splice(0, k);
    const base = tipo === 'buio' ? cfg.base : cfg.base * k;
    S.lotto = { id: ++S.nLotti, tipo, carte, k, base, migliore: null, conta: 0, stato: 'aperto', rivelate: tipo === 'scoperta', offerte: 0 };
    this.salva();
    this.vista.lotto(S.lotto, S);
  }

  async annunciaLotto() {
    const L = this.S.lotto;
    if (L.tipo === 'scoperta' && L.k === 1) return this.di('lottoScoperto1', { carta: L.carte[0], cifra: L.base });
    if (L.tipo === 'scoperta') return this.di('lottoScopertoN', { k: L.k, cifra: L.base });
    if (L.tipo === 'coperta') return this.di('lottoCoperto', { k: L.k });
    return this.di('lottoBuio');
  }

  async faseAsta() {
    const S = this.S;
    while (true) {
      if (!S.lotto || S.lotto.stato !== 'aperto') {
        if (!S.mazzo.length) break;
        this.creaLotto();
        await this.attendi(700);
        await this.annunciaLotto();
      }
      await this.conduciLotto();
      await this.attendi(1400);
    }
    S.lotto = null;
    S.fase = 'premi';
    this.salva();
  }

  async conduciLotto() {
    const S = this.S, L = S.lotto;
    let silenzi = 0;
    let visto = this.segnale;
    L.conta = 0;
    this.salva();
    while (L.stato === 'aperto') {
      const attesa = L.migliore ? (L.conta === 0 ? 3200 : 2300) : 5200;
      const nuova = await this.attendi(attesa, visto);
      visto = this.segnale;
      if (L.stato !== 'aperto') break;
      if (nuova) { silenzi = 0; continue; }
      if (!L.migliore) {
        silenzi++;
        if (silenzi === 1) { await this.di('silenzio1'); continue; }
        if (silenzi === 2 && !L.ribassato && L.base > S.cfg.passo) {
          L.ribassato = true;
          L.base = Math.max(S.cfg.passo, Math.round(L.base / 2 / 10) * 10);
          this.salva();
          await this.di('ribasso', { cifra: L.base });
          continue;
        }
        await this.invenduto(L);
        break;
      }
      L.conta++;
      this.salva();
      if (L.conta < 3) {
        suona('tick');
        await this.di('conta' + L.conta, { cifra: L.migliore.v });
      } else {
        await this.aggiudica(L);
      }
    }
  }

  offerta(uid, o) {
    const S = this.S, L = S?.lotto;
    if (!o || !L || S.fase !== 'asta' || L.stato !== 'aperto' || o.lotto !== L.id) return;
    if (!S.giocatori[uid] || S.pausa) return;
    const v = Math.round(Number(o.v));
    const minimo = L.migliore ? L.migliore.v + S.cfg.passo : L.base;
    if (!(v >= minimo) || v > 100000) return;
    if (L.migliore && L.migliore.uid === uid) return;
    const prima = L.migliore;
    L.migliore = { uid, v };
    // che battuta dire: rilancio grosso, prezzo alto, duello tra due giocatori o offerta normale
    L.storia = (L.storia || []).concat(uid).slice(-6);
    const st = L.storia, n = st.length;
    let tipo = 'offerta', extra = {};
    if (prima && v - prima.v >= 4 * S.cfg.passo) tipo = 'rilancioGrosso';
    else if (!L.alto && v >= Math.max(300, L.base * 8)) { tipo = 'prezzoAlto'; L.alto = true; }
    else if (n >= 4 && st[n - 1] === st[n - 3] && st[n - 2] === st[n - 4] && st[n - 1] !== st[n - 2] && Math.random() < 0.6) {
      tipo = 'duello'; extra = { altro: this.nome(st[n - 2]) };
    }
    this._battuta = { tipo, extra };
    L.conta = 0;
    L.offerte++;
    this.segnale++;
    this.salva();
    suona('offerta');
    this.vista.offerta(L, S);
    // annuncia l'ultima offerta (se ne arrivano tante insieme, dice solo l'ultima)
    clearTimeout(this._annuncio);
    this._annuncio = setTimeout(() => {
      if (L.stato === 'aperto' && L.migliore) this.di(this._battuta.tipo, { ...this._battuta.extra, nome: this.nome(L.migliore.uid), cifra: L.migliore.v }, { interrompi: true });
    }, 250);
  }

  async aggiudica(L) {
    const S = this.S;
    clearTimeout(this._annuncio);
    L.stato = 'aggiudicato';
    L.conta = 3;
    const { uid, v } = L.migliore;
    S.conti[uid].aste += v;
    for (const id of L.carte) {
      S.nere[id] = uid;
      // le carte comprate coperte o al buio restano coperte agli altri
      if (L.tipo === 'scoperta') delete S.coperte[id]; else S.coperte[id] = true;
    }
    this.salva();
    suona('martello');
    this.vista.martello();
    await this.di('conta3', {}, { interrompi: true });
    // lotti vinti di fila dallo stesso giocatore: doppietta, tripletta, poker...
    if (S.serie?.uid === uid) S.serie.n++; else S.serie = { uid, n: 1 };
    const serie = S.serie.n;
    const detto = this.di(L.offerte === 1 && Math.random() < 0.6 ? 'affare' : 'aggiudicato', { nome: this.nome(uid), cifra: v });
    await this.attendi(500);
    this.evento('aggiudicato', { uid, carte: L.carte, v, lotto: L.id });
    if (serie >= 2) {
      await detto;
      await this.di(serie === 2 ? 'doppietta' : serie === 3 ? 'tripletta' : 'poker', { nome: this.nome(uid), k: serie });
    } else await this.attendi(1800);
  }

  async invenduto(L) {
    const S = this.S;
    L.stato = 'invenduto';
    let ritirate = 0;
    for (const id of L.carte) {
      S.tentativi[id] = (S.tentativi[id] || 0) + 1;
      if (S.tentativi[id] >= 2) { S.nere[id] = '_banco'; ritirate++; } else S.mazzo.push(id);
    }
    this.salva();
    this.vista.invenduto(L, S);
    await this.di(ritirate ? 'ritirata' : 'invenduto');
  }

  // ---------------------------------------------------------------- premi
  async fasePremi() {
    const S = this.S;
    const giocatori = Object.keys(S.giocatori);
    let tot = 0;
    for (const u of giocatori) tot += (S.conti[u].posta || 0) + (S.conti[u].aste || 0);
    S.montepremi = tot;
    const figure = S.figure || CARTE.map((c) => c.id);
    // con poche figure le carte vincenti non possono essere più della metà
    const W = Math.max(2, Math.min(S.cfg.vincenti || vincentiPerGiocatori(giocatori.length), Math.floor(figure.length / 2)));
    const perc = RIPARTIZIONE[W];
    const premi = perc.map((p) => Math.floor((tot * p) / 100 / 10) * 10);
    premi[premi.length - 1] += tot - premi.reduce((a, b) => a + b, 0);
    const tutte = mescola(figure);
    S.rosse = { vincenti: tutte.slice(0, W), premi, daSvelare: tutte.slice(W), svelate: [], premiate: [], riporto: 0 };
    this.salva();
    await this.di('fineAsta', { cifra: tot });
    suona('moneta');
    this.evento('premi', {});
    await this.di('premi', { k: W });
    await this.attendi(1500);
    S.fase = 'svela';
    this.salva();
    await this.di('svela');
  }

  async mercato(sec, tipo = 'mercato') {
    const S = this.S;
    S.mercato = { resto: sec, sec, passo: [] };
    this.avanti = false;
    this.salva();
    suona('mercato');
    this.di(tipo, { k: sec });
    let nessuno = false;
    // il conto alla rovescia lo fa tick(), che si ferma durante la pausa
    while (S.mercato && S.mercato.resto > 0) {
      if (this.avanti) { this.avanti = false; nessuno = true; break; }
      if (this.tuttiPassano()) { nessuno = true; break; }
      await new Promise((r) => setTimeout(r, 100));
    }
    S.mercato = null;
    S.indizio = null;
    this.salva();
    await this.di(nessuno ? 'mercatoNessuno' : 'mercatoChiuso', {}, { interrompi: true });
  }

  // tutti i giocatori veri hanno detto "non tratto"
  tuttiPassano() {
    const veri = Object.entries(this.S.giocatori).filter(([, g]) => !g.bot).map(([u]) => u);
    return veri.length > 0 && veri.every((u) => this.S.mercato?.passo?.includes(u));
  }

  scegliIndizio(id) {
    const S = this.S;
    const vive = [...S.rosse.daSvelare, ...S.rosse.vincenti];
    const opz = CARTA[id].t.filter((t) => vive.filter((x) => CARTA[x].t.includes(t)).length >= 2);
    return opz.length ? caso(opz) : null;
  }

  vive(uid) { return Object.keys(this.S.nere).filter((id) => this.proprietario(id) === uid); }

  proprietario(id) {
    const u = this.S.nere[id];
    return u && this.S.giocatori[u] && !this.S.eliminate.includes(id) ? u : null;
  }

  async faseSvela() {
    const S = this.S, R = S.rosse;
    let giri = 0;
    while (R.daSvelare.length) {
      const resto = R.daSvelare.length;
      let k = resto > 14 ? 1 + Math.floor(Math.random() * 3) : resto > 6 ? 1 + Math.floor(Math.random() * 2) : 1;
      k = Math.min(k, resto);
      const gruppo = R.daSvelare.slice(0, k);
      giri++;
      const tag = Math.random() < 0.38 ? this.scegliIndizio(gruppo[0]) : null;
      if (tag) {
        S.indizio = INDIZI[tag];
        this.salva();
        await this.di('indizio', { indizio: INDIZI[tag] });
        await this.mercato(Math.max(1, Math.round(this.vel(20000) / 1000)));
      } else if (giri % 4 === 0) {
        await this.mercato(Math.max(1, Math.round(this.vel(15000) / 1000)));
      }
      await this.di(k === 1 ? 'annuncio1' : 'annuncioN', { k });
      for (const id of gruppo) {
        R.daSvelare.shift();
        R.svelate.push(id);
        const u = this.proprietario(id);
        suona('gira');
        this.evento('svelata', { carta: id, uid: u, g: giri });
        await this.attendi(900);
        if (u) {
          S.eliminate.push(id);
          delete S.coperte[id];
          for (const [pid, p] of Object.entries(S.proposte)) if (p.carta === id) delete S.proposte[pid];
          this.evento('eliminata', { uid: u, carta: id });
          suona('peccato');
          // la stessa persona perde più carte di fila: sfortuna doppia, tripla...
          if (S.sfortuna?.uid === u) S.sfortuna.n++; else S.sfortuna = { uid: u, n: 1 };
          const sf = S.sfortuna.n;
          await this.di(sf === 2 ? 'sfortunaDoppia' : sf >= 3 ? 'sfortunaTripla' : 'eliminata', { nome: this.nome(u), carta: id });
          if (!this.vive(u).length) await this.di('maniVuote', { nome: this.nome(u) });
        } else {
          const r = Math.random();
          if (r < 0.4) await this.di('nessuno', { carta: id });
          else if (r < 0.5) await this.di('salvi');
        }
        await this.attendi(600);
      }
      // annuncia quando restano in pochi con le carte in mano
      const inCorsa = Object.keys(S.giocatori).filter((x) => this.vive(x).length).length;
      S.pochi = S.pochi || [];
      if (inCorsa > 0 && inCorsa <= 3 && Object.keys(S.giocatori).length > inCorsa && !S.pochi.includes(inCorsa) && R.daSvelare.length) {
        S.pochi.push(inCorsa);
        await this.di('pochi', { k: inCorsa });
      }
      await this.attendi(1200);
    }
    S.fase = 'finale';
    this.salva();
  }

  async faseFinale() {
    const S = this.S, R = S.rosse;
    if (!R.premiate.length) await this.di('finale');
    while (R.premiate.length < R.vincenti.length) {
      const i = R.premiate.length, W = R.vincenti.length;
      if (i >= W - 2) await this.mercato(Math.max(1, Math.round(this.vel(18000) / 1000)), 'ultimoMercato');
      if (i === W - 1) await this.di('granPremio');
      const id = R.vincenti[i];
      const premio = R.premi[i] + R.riporto;
      R.premiate.push(id);
      delete S.coperte[id];
      const u = this.proprietario(id);
      suona('gira');
      this.evento('svelaPremio', { carta: id, i, v: premio, uid: u });
      await this.attendi(1300);
      if (u) {
        S.conti[u].premi += premio;
        R.riporto = 0;
        S.vincite.push({ uid: u, carta: id, v: premio });
        this.evento('vittoria', { uid: u, carta: id, v: premio });
        suona('fanfara');
        await this.di('vince', { nome: this.nome(u), carta: id, cifra: premio });
      } else {
        R.riporto = premio;
        await this.di(i === W - 1 ? 'vinceNessunoUltimo' : 'vinceNessuno', { carta: id });
      }
      this.salva();
      await this.attendi(2600);
    }
    S.fase = 'fine';
    S.proposte = {};
    this.salva();
    this.evento('fine', {});
    suona('campanelli');
    await this.di('fine');
  }

  // ---------------------------------------------------------------- trattative tra giocatori
  richiesta(k, q) {
    const S = this.S;
    if (!S || !q || !S.giocatori[q.da]) return;
    if (!['regali', 'asta', 'premi', 'svela', 'finale'].includes(S.fase)) return;
    if (q.tipo === 'proponi') {
      const prezzo = Math.round(Number(q.prezzo));
      if (!(prezzo >= 0 && prezzo <= 100000) || !S.giocatori[q.a] || q.a === q.da || !CARTA[q.carta]) return;
      const venditore = q.modo === 'compro' ? q.a : q.da;
      if (this.proprietario(q.carta) !== venditore) return;
      if (S.rosse && S.rosse.premiate.includes(q.carta)) return;
      S.proposte[k] = { da: q.da, a: q.a, carta: q.carta, prezzo, modo: q.modo === 'compro' ? 'compro' : 'vendo', t: Date.now() };
      this.salva();
      this.vista.trattativa(S.proposte[k], S);
      this.rispostaBot(k);
    } else if (q.tipo === 'rispondi') {
      const p = S.proposte[q.pid];
      if (!p || p.a !== q.da) return;
      delete S.proposte[q.pid];
      const venditore = p.modo === 'vendo' ? p.da : p.a;
      const compratore = p.modo === 'vendo' ? p.a : p.da;
      if (q.ok && this.proprietario(p.carta) === venditore && !(S.rosse && S.rosse.premiate.includes(p.carta))) {
        S.nere[p.carta] = compratore;
        S.conti[compratore].scambi -= p.prezzo;
        S.conti[venditore].scambi += p.prezzo;
        for (const [pid, x] of Object.entries(S.proposte)) if (x.carta === p.carta) delete S.proposte[pid];
        this.evento('scambio', { da: venditore, a: compratore, carta: p.carta, prezzo: p.prezzo });
        suona('moneta');
        this.di('scambioFatto', { carta: p.carta, nome: this.nome(compratore) });
      } else {
        this.evento('rifiuto', { a: p.da, da: p.a, carta: p.carta });
        this.salva();
      }
    } else if (q.tipo === 'passo') {
      if (S.mercato && !S.mercato.passo.includes(q.da)) { S.mercato.passo.push(q.da); this.salva(); }
    } else if (q.tipo === 'copri') {
      // il proprietario copre o scopre le sue carte agli occhi degli altri
      const ids = Array.isArray(q.carte) ? q.carte : [q.carta];
      for (const id of ids) {
        if (!CARTA[id] || this.proprietario(id) !== q.da) continue;
        if (q.v) S.coperte[id] = true; else delete S.coperte[id];
      }
      this.salva();
    } else if (q.tipo === 'ritira') {
      const p = S.proposte[q.pid];
      if (p && p.da === q.da) { delete S.proposte[q.pid]; this.salva(); }
    }
  }

  tick() {
    const S = this.S;
    if (!S) return;
    let cambia = false;
    for (const [pid, p] of Object.entries(S.proposte || {})) {
      if (Date.now() - p.t > 90000 || !this.S.giocatori[p.a]) { delete S.proposte[pid]; cambia = true; }
    }
    if (S.mercato) {
      S.mercato.resto = Math.max(0, S.mercato.resto - (S.pausa ? 0 : 1));
      cambia = true;
    }
    if (cambia) this.salva();
    this.giocaBot();
  }

  // ---------------------------------------------------------------- giocatori finti (?bot=N, per prove e dimostrazioni)
  giocaBot() {
    if (!this.bot.length || !this.S) return;
    const S = this.S, L = S.lotto;
    if (S.fase === 'asta' && L && L.stato === 'aperto' && !S.pausa) {
      for (const b of this.bot) {
        if (L.migliore?.uid === b) continue;
        const prossima = L.migliore ? L.migliore.v + S.cfg.passo : L.base;
        const tetto = (L.tipo === 'buio' ? 2 : L.k) * S.cfg.base * (2 + (b.charCodeAt(3) % 4));
        if (prossima <= tetto && Math.random() < 0.18) this.offerta(b, { v: prossima, lotto: L.id });
      }
    }
    if (S.mercato && Math.random() < 0.15) {
      const b = caso(this.bot);
      const altri = Object.keys(S.giocatori).filter((u) => u !== b);
      const mie = Object.keys(S.nere).filter((id) => this.proprietario(id) === b);
      if (mie.length && altri.length) {
        const k = 'b' + Date.now();
        this.richiesta(k, { tipo: 'proponi', da: b, a: caso(altri), carta: caso(mie), prezzo: 10 * (1 + Math.floor(Math.random() * 15)), modo: 'vendo' });
      }
    }
  }
  rispostaBot(pid) {
    const p = this.S.proposte[pid];
    if (!p || !this.bot.includes(p.a)) return;
    setTimeout(() => this.richiesta('r' + pid, { tipo: 'rispondi', da: p.a, pid, ok: Math.random() < 0.5 }), 1500 + Math.random() * 3000);
  }
}
